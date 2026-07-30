import {
  ageLabels,
  runningPerformanceToMilliseconds,
  type InternationalEvent,
  type InternationalGender,
  type ParsedInternationalRanking,
  type UsaAgeKey
} from "./international-ranking-core.ts";

const FIREBASE_HOST = "track-scoreboard-default-rtdb.firebaseio.com";
const MEET_ID = 14258;
const LIVE_RESULTS_URL = `https://finishedresults.trackscoreboard.com/meets/${MEET_ID}/events`;
const DATABASE_ROOT = `https://${FIREBASE_HOST}/trackscoreboard/finishedresults/meets/${MEET_ID}/meet`;
const USER_AGENT = "11RunInternationalReferences/1.0 (+https://11run.com.br/referencias/ranking-eua)";

type EventRound = {
  name?: string;
  distance?: number;
  statusFormatted?: string;
  completed_at?: string;
  completed_last_updated?: string;
};

type EventRecord = {
  rounds?: Record<string, EventRound>;
};

type ResultAthlete = {
  age?: number;
  fname?: string;
  lname?: string;
  gender?: string;
  mark?: string;
  markOriginal?: number;
  place?: number;
  placeFormatted?: number | string;
  teamName?: string;
  teamsAbbr?: string;
  status?: string;
};

const divisionNames: Record<UsaAgeKey, string> = {
  "8-under": "7-8 Division",
  "9-10": "9-10 Division",
  "11-12": "11-12 Division",
  "13-14": "13-14 Division",
  "15-16": "15-16 Division",
  "17-18": "17-18 Division"
};

function expectedGenderWord(gender: InternationalGender, ageKey: UsaAgeKey) {
  if (ageKey === "17-18") return gender === "M" ? "Mens" : "Womens";
  return gender === "M" ? "Boys" : "Girls";
}

export function usaCategoryAvailability(ageKey: UsaAgeKey, event: InternationalEvent) {
  if (event === 3000 && (ageKey === "8-under" || ageKey === "9-10")) {
    return { available: false, note: "Os 3.000 m não constam no programa oficial da USATF para esta faixa etária." };
  }
  return { available: true, note: null };
}

async function fetchJson<T>(url: string): Promise<T> {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== FIREBASE_HOST) throw new Error("Fonte de resultados fora da allowlist.");
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`O placar oficial respondeu com HTTP ${response.status}.`);
  return response.json() as Promise<T>;
}

function flattenResults(value: unknown): ResultAthlete[] {
  if (!value || typeof value !== "object") return [];
  const groups = (value as { results?: unknown[] }).results;
  if (!Array.isArray(groups)) return [];
  return groups.flatMap((group) => {
    if (!group || typeof group !== "object") return [];
    const nested = (group as { results?: ResultAthlete[] }).results;
    return Array.isArray(nested) ? nested : [];
  });
}

export class UsaRankingProvider {
  async fetchRanking(input: {
    season: number;
    gender: InternationalGender;
    ageKey: UsaAgeKey;
    event: InternationalEvent;
  }): Promise<ParsedInternationalRanking> {
    if (input.season !== 2026) throw new Error("A integração oficial configurada corresponde à edição USATF 2026.");
    const availability = usaCategoryAvailability(input.ageKey, input.event);
    if (!availability.available) throw new Error(availability.note ?? "Categoria indisponível.");

    const events = await fetchJson<Record<string, EventRecord>>(`${DATABASE_ROOT}/events.json`);
    const division = divisionNames[input.ageKey];
    const genderWord = expectedGenderWord(input.gender, input.ageKey);
    const candidate = Object.entries(events).find(([, event]) =>
      Object.values(event.rounds ?? {}).some((round) =>
        round.distance === input.event
        && Boolean(round.name?.startsWith(`${genderWord} ${input.event} Run`))
        && Boolean(round.name?.includes(division))
        && !round.name?.includes("Relay")
        && !round.name?.includes("Pentathlon")
        && !round.name?.includes("Heptathlon")
        && !round.name?.includes("Decathlon")
      )
    );
    if (!candidate) throw new Error("A prova não foi localizada no programa oficial da USATF.");
    const [eventKey, eventRecord] = candidate;
    const rounds = eventRecord.rounds ?? {};
    const finalDone = rounds.Final?.statusFormatted === "Done";
    const prelimDone = rounds.Prelim?.statusFormatted === "Done";
    const roundKey = finalDone ? "Final" : prelimDone ? "Prelim" : "Final";
    const round = rounds[roundKey];
    const resultRecord = await fetchJson<Record<string, unknown>>(`${DATABASE_ROOT}/results/${eventKey}.json`);
    const rawRows = flattenResults(resultRecord[roundKey]);
    const validRows = rawRows
      .filter((row) => row.fname && row.lname && row.mark && row.mark !== "NT" && row.mark !== "DNS" && !row.status)
      .sort((a, b) => {
        const aPlace = Number(a.place ?? a.placeFormatted ?? 0);
        const bPlace = Number(b.place ?? b.placeFormatted ?? 0);
        if (aPlace > 0 && bPlace > 0) return aPlace - bPlace;
        return Number(a.markOriginal ?? Number.POSITIVE_INFINITY) - Number(b.markOriginal ?? Number.POSITIVE_INFINITY);
      })
      .slice(0, 100);

    const rows = validRows.map((row, index) => {
      const performance = String(row.mark);
      const associationCode = row.teamName?.match(/^(\d{2})\s/)?.[1];
      return {
        position: Number(row.place ?? row.placeFormatted) > 0 ? Number(row.place ?? row.placeFormatted) : index + 1,
        performance,
        performanceMilliseconds: runningPerformanceToMilliseconds(performance),
        athleteName: `${row.fname} ${row.lname}`.replace(/\s+/g, " ").trim(),
        athleteAge: Number.isFinite(Number(row.age)) ? Number(row.age) : undefined,
        teamName: row.teamName?.trim() || undefined,
        regionName: associationCode ? `Associação USATF ${associationCode}` : undefined,
        meetName: "USATF National Junior Olympic Track & Field Championships",
        meetLocation: "Norwalk, Califórnia",
        performanceDate: round?.completed_at?.slice(0, 10),
        roundLabel: roundKey === "Final" ? "Final" : "Preliminar",
        sourceStatus: round?.statusFormatted ?? "Em andamento"
      };
    });

    const status = round?.statusFormatted === "Done"
      ? (roundKey === "Final" ? "Resultado final" : "Resultado preliminar")
      : "Lista de largada";
    return {
      sourceUrl: `${LIVE_RESULTS_URL}/${eventKey}/${roundKey}`,
      sourceUpdatedAt: round?.completed_last_updated,
      ageLabel: ageLabels[input.ageKey],
      roundLabel: roundKey === "Final" ? "Final" : "Preliminar",
      sourceStatus: status,
      rows
    };
  }
}
