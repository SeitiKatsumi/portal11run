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
  dayName?: string;
  start_time?: string;
  am_pm?: string;
};

type EventRecord = {
  rounds?: Record<string, EventRound>;
};

type ResultAthlete = {
  age?: number;
  athlete_status?: string;
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

type ResultRecord = Record<string, unknown> & {
  performanceList?: ResultAthlete[];
};

type SelectedUsaRows = {
  rows: ResultAthlete[];
  round?: EventRound;
  roundKey: string;
  roundLabel: string;
  sourceStatus: string;
  usesEntryMarks: boolean;
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
  if (![800, 1500, 3000].includes(event)) {
    return { available: false, note: "A referência juvenil conectada dos EUA disponibiliza 800 m, 1.500 m e 3.000 m." };
  }
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

function validPerformance(row: ResultAthlete) {
  const mark = row.mark?.trim();
  return Boolean(
    row.fname
    && row.lname
    && mark
    && !["NT", "DNS", "DNF", "DQ", "SCR"].includes(mark.toUpperCase())
    && !row.status
    && !row.athlete_status
    && runningPerformanceToMilliseconds(mark) !== undefined
  );
}

function sortedRows(rows: ResultAthlete[], useOfficialPlace: boolean) {
  return rows
    .filter(validPerformance)
    .sort((a, b) => {
      const aPlace = Number(a.place ?? a.placeFormatted ?? 0);
      const bPlace = Number(b.place ?? b.placeFormatted ?? 0);
      if (useOfficialPlace && aPlace > 0 && bPlace > 0) return aPlace - bPlace;
      const aTime = runningPerformanceToMilliseconds(String(a.mark));
      const bTime = runningPerformanceToMilliseconds(String(b.mark));
      return Number(aTime ?? Number.POSITIVE_INFINITY) - Number(bTime ?? Number.POSITIVE_INFINITY);
    })
    .slice(0, 100);
}

function labelForRound(roundKey: string) {
  return roundKey === "Final" ? "Final" : "Preliminar";
}

export function selectUsaRankingRows(
  rounds: Record<string, EventRound>,
  resultRecord: ResultRecord
): SelectedUsaRows {
  const officialRounds = ["Final", "Prelim"]
    .filter((key) => rounds[key])
    .map((key) => ({
      key,
      round: rounds[key],
      rows: sortedRows(flattenResults(resultRecord[key]), true)
    }));
  const completed = officialRounds.find((item) => item.round?.statusFormatted === "Done" && item.rows.length);
  const withPublishedMarks = officialRounds.find((item) => item.rows.length);
  const selected = completed ?? withPublishedMarks;

  if (selected) {
    const completedRound = selected.round?.statusFormatted === "Done";
    return {
      rows: selected.rows,
      round: selected.round,
      roundKey: selected.key,
      roundLabel: labelForRound(selected.key),
      sourceStatus: completedRound
        ? (selected.key === "Final" ? "Resultado final" : "Resultado preliminar")
        : `Resultados parciais · ${selected.round?.statusFormatted ?? "Em andamento"}`,
      usesEntryMarks: false
    };
  }

  const entryRows = sortedRows(
    Array.isArray(resultRecord.performanceList) ? resultRecord.performanceList : [],
    false
  );
  const scheduledKey = rounds.Prelim ? "Prelim" : "Final";
  return {
    rows: entryRows,
    round: rounds[scheduledKey],
    roundKey: scheduledKey,
    roundLabel: "Marcas de entrada",
    sourceStatus: entryRows.length ? "Inscritos e marcas de entrada" : "Aguardando publicação da lista oficial",
    usesEntryMarks: true
  };
}

function scheduledLabel(round?: EventRound) {
  if (!round?.dayName && !round?.start_time) return undefined;
  const weekdays: Record<string, string> = {
    Monday: "segunda-feira",
    Tuesday: "terça-feira",
    Wednesday: "quarta-feira",
    Thursday: "quinta-feira",
    Friday: "sexta-feira",
    Saturday: "sábado",
    Sunday: "domingo"
  };
  const day = round.dayName ? (weekdays[round.dayName] ?? round.dayName) : "";
  const time = [round.start_time, round.am_pm].filter(Boolean).join(" ");
  return [day, time].filter(Boolean).join(", ");
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
    const resultRecord = await fetchJson<ResultRecord>(`${DATABASE_ROOT}/results/${eventKey}.json`);
    const selected = selectUsaRankingRows(rounds, resultRecord);
    const scheduled = selected.usesEntryMarks ? scheduledLabel(selected.round) : undefined;

    const rows = selected.rows.map((row, index) => {
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
        performanceDate: selected.round?.completed_at?.slice(0, 10),
        performanceDateOriginal: scheduled,
        roundLabel: selected.roundLabel,
        sourceStatus: selected.sourceStatus,
        sourceKey: "usatf-national-jo-2026",
        sourceUrl: `${LIVE_RESULTS_URL}/${eventKey}/${selected.roundKey}`
      };
    });

    return {
      sourceUrl: `${LIVE_RESULTS_URL}/${eventKey}/${selected.roundKey}`,
      sourceUpdatedAt: selected.round?.completed_last_updated,
      ageLabel: ageLabels[input.ageKey],
      roundLabel: selected.roundLabel,
      sourceStatus: selected.sourceStatus,
      rows
    };
  }
}
