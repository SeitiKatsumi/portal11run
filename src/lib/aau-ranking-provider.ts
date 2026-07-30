import { load } from "cheerio";
import {
  ageLabels,
  runningPerformanceToMilliseconds,
  type InternationalEvent,
  type InternationalGender,
  type ParsedInternationalRanking,
  type UsaAgeKey
} from "./international-ranking-core.ts";

const AAU_RESULTS_HOST = "image.aausports.org";
const AAU_CLUB_RESULTS_URL = "https://image.aausports.org/sports/athletics/results/2026/club/clubcompleteresults.htm";
const USER_AGENT = "11RunInternationalReferences/1.0 (+https://11run.com.br/referencias/ranking-eua)";

type AauInput = {
  season: number;
  gender: InternationalGender;
  ageKey: UsaAgeKey;
  event: InternationalEvent;
};

function categoryAgeMatches(label: string, ageKey: UsaAgeKey) {
  const normalized = label.toLowerCase();
  if (ageKey === "8-under") return normalized.includes("8 & under");
  if (ageKey === "15-16" || ageKey === "17-18") return normalized.includes(`${ageKey} year old`);
  const [first, last] = ageKey.split("-").map(Number);
  return [first, last].some((age) => normalized.includes(`${age} year old`));
}

function genderMatches(label: string, gender: InternationalGender) {
  return gender === "M" ? /^(Boys|Men)\b/.test(label) : /^(Girls|Women)\b/.test(label);
}

function ageFromHeading(label: string, season: number, birthYear: number) {
  const exact = label.match(/\b(9|10|11|12|13|14) year old\b/i);
  if (exact) return Number(exact[1]);
  const fullBirthYear = birthYear >= 90 ? 1900 + birthYear : 2000 + birthYear;
  const calculated = season - fullBirthYear;
  return calculated >= 5 && calculated <= 18 ? calculated : undefined;
}

function normalizeName(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeTeam(value: string) {
  return value.replace(/^X(?=[A-Z])/, "").replace(/\s+/g, " ").trim();
}

export function parseAauRankingHtml(html: string, sourceUrl: string, input: AauInput): ParsedInternationalRanking {
  const text = load(html).root().text().replace(/\r/g, "");
  const lines = text.split("\n");
  const headingPattern = /^(Girls|Boys|Women|Men)\s+(800|1500|3000) Meters (.+)$/;
  const eventHeadingPattern = /^(Girls|Boys|Women|Men)\s+\S+/;
  const rowPattern = /^\s*(\d+)\s+#\s*(\d+)\s+(.+?)\s+(\d{2})\s+(.+?)\s+(X?\d{1,2}:\d{2}\.\d{2,3}|X?\d{1,2}\.\d{2,3})(?:[A-Za-z!*qQ]*)?(?:\s+.*)?$/;
  const rows: ParsedInternationalRanking["rows"] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].trim();
    const headingMatch = heading.match(headingPattern);
    if (
      !headingMatch
      || Number(headingMatch[2]) !== input.event
      || !genderMatches(heading, input.gender)
      || !categoryAgeMatches(headingMatch[3], input.ageKey)
      || /Race Walk|Relay/i.test(heading)
    ) continue;

    for (let rowIndex = index + 1; rowIndex < lines.length; rowIndex += 1) {
      const line = lines[rowIndex];
      if (eventHeadingPattern.test(line.trim())) break;
      const match = line.match(rowPattern);
      if (!match) continue;
      const performance = match[6].replace(/^X/, "");
      const performanceMilliseconds = runningPerformanceToMilliseconds(performance);
      if (performanceMilliseconds === undefined) continue;
      const birthYear = Number(match[4]);
      rows.push({
        position: Number(match[1]),
        performance,
        performanceMilliseconds,
        athleteName: normalizeName(match[3]),
        athleteAge: ageFromHeading(headingMatch[3], input.season, birthYear),
        teamName: normalizeTeam(match[5]) || undefined,
        meetName: "AAU National Club Championships",
        meetLocation: "Jacksonville, Flórida",
        performanceDateOriginal: "7–11 jul 2026",
        roundLabel: "Melhor marca na competição",
        sourceStatus: "Resultado oficial AAU",
        sourceKey: "aau-club-2026",
        sourceUrl
      });
    }
  }

  const bestByAthlete = new Map<string, (typeof rows)[number]>();
  for (const row of rows) {
    const key = `${normalizeName(row.athleteName).toLocaleLowerCase("en-US")}|${row.athleteAge ?? ""}|${normalizeTeam(row.teamName ?? "").toLocaleLowerCase("en-US")}`;
    const existing = bestByAthlete.get(key);
    if (!existing || Number(row.performanceMilliseconds) < Number(existing.performanceMilliseconds)) {
      bestByAthlete.set(key, row);
    }
  }

  const ranked = [...bestByAthlete.values()]
    .sort((a, b) => Number(a.performanceMilliseconds) - Number(b.performanceMilliseconds))
    .slice(0, 100)
    .map((row, index) => ({ ...row, position: index + 1 }));

  return {
    sourceUrl,
    sourceUpdatedAt: "2026-07-11T15:13:00-04:00",
    ageLabel: ageLabels[input.ageKey],
    roundLabel: "Melhor marca na competição",
    sourceStatus: "Resultados oficiais consolidados",
    rows: ranked
  };
}

async function fetchAauHtml(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== AAU_RESULTS_HOST) {
    throw new Error("Fonte AAU fora da allowlist.");
  }
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html" },
    signal: AbortSignal.timeout(30_000),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`A fonte oficial da AAU respondeu com HTTP ${response.status}.`);
  return response.text();
}

export class AauRankingProvider {
  async fetchRanking(input: AauInput): Promise<ParsedInternationalRanking> {
    if (input.season !== 2026) {
      throw new Error("A integração AAU configurada corresponde à temporada 2026.");
    }
    const html = await fetchAauHtml(AAU_CLUB_RESULTS_URL);
    return parseAauRankingHtml(html, AAU_CLUB_RESULTS_URL, input);
  }
}
