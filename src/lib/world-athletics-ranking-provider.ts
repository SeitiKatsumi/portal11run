import * as cheerio from "cheerio";
import {
  ageLabels,
  runningPerformanceToMilliseconds,
  type InternationalEvent,
  type InternationalGender,
  type ParsedInternationalRanking,
  type WorldAthleticsAgeKey
} from "./international-ranking-core.ts";

const HOST = "worldathletics.org";
const BASE_URL = `https://${HOST}/records/toplists/middlelong`;
const USER_AGENT = "11RunInternationalReferences/1.0 (+https://11run.com.br/referencias/ranking-mundial)";

const eventSlugs: Partial<Record<InternationalEvent, string>> = {
  800: "800-metres",
  1500: "1500-metres",
  3000: "3000-metres",
  5000: "5000-metres",
  10000: "10000-metres"
};

export type WorldAthleticsScope = "WORLD" | "KE" | "UG";

export type WorldAthleticsRankingInput = {
  scope: WorldAthleticsScope;
  season: number;
  gender: InternationalGender;
  ageKey: WorldAthleticsAgeKey;
  event: InternationalEvent;
};

const scopeCountryCodes: Record<Exclude<WorldAthleticsScope, "WORLD">, string> = {
  KE: "KEN",
  UG: "UGA"
};

function englishDateToIso(value: string) {
  const months: Record<string, string> = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12"
  };
  const match = value.trim().toUpperCase().match(/^(\d{1,2})\s+([A-Z]{3})\s+(\d{4})$/);
  if (!match || !months[match[2]]) return undefined;
  return `${match[3]}-${months[match[2]]}-${match[1].padStart(2, "0")}`;
}

export function buildWorldAthleticsRankingUrl(input: WorldAthleticsRankingInput) {
  const slug = eventSlugs[input.event];
  if (!slug) throw new Error("A prova não integra o recorte de pista da World Athletics.");
  if (input.scope !== "WORLD" && input.ageKey === "senior") {
    throw new Error("Os rankings por país estão limitados às categorias juvenis até Sub-20.");
  }
  const gender = input.gender === "M" ? "men" : "women";
  const url = new URL(`${BASE_URL}/${slug}/all/${gender}/${input.ageKey}/${input.season}`);
  url.searchParams.set("ageCategory", input.ageKey);
  url.searchParams.set("bestResultsOnly", "true");
  url.searchParams.set("maxResultsByCountry", "all");
  if (input.scope === "WORLD") {
    url.searchParams.set("regionType", "world");
  } else {
    url.searchParams.set("regionType", "countries");
    url.searchParams.set("region", scopeCountryCodes[input.scope]);
  }
  return url.toString();
}

export function parseWorldAthleticsRankingHtml(
  html: string,
  sourceUrl: string,
  input: WorldAthleticsRankingInput
): ParsedInternationalRanking {
  const $ = cheerio.load(html);
  const table = $("table").toArray().find((candidate) => {
    const headers = $(candidate).find("thead th").map((_, cell) => $(cell).text().replace(/\s+/g, " ").trim()).get();
    return ["Rank", "Mark", "Competitor", "DOB", "Venue", "Date"].every((header) => headers.includes(header));
  });
  if (!table) throw new Error("A tabela oficial da World Athletics não foi localizada.");

  const headers = $(table).find("thead th").map((_, cell) => $(cell).text().replace(/\s+/g, " ").trim()).get();
  const indexOf = (label: string) => headers.findIndex((header) => header === label);
  const countryIndex = headers.findIndex((header, index) => !header && index > indexOf("DOB"));
  const rows: ParsedInternationalRanking["rows"] = [];

  $(table).find("tbody tr").each((_, row) => {
    if (rows.length >= 100) return false;
    const cells = $(row).find("td").toArray();
    const text = (index: number) => index >= 0 ? $(cells[index]).text().replace(/\s+/g, " ").trim() : "";
    const position = Number.parseInt(text(indexOf("Rank")), 10);
    const performance = text(indexOf("Mark"));
    const athleteName = text(indexOf("Competitor"));
    if (!Number.isFinite(position) || !athleteName || runningPerformanceToMilliseconds(performance) === undefined) return;
    const birthOriginal = text(indexOf("DOB"));
    const countryCode = text(countryIndex);
    const venue = text(indexOf("Venue"));
    const dateOriginal = text(indexOf("Date"));
    rows.push({
      position,
      performance,
      performanceMilliseconds: runningPerformanceToMilliseconds(performance),
      athleteName,
      regionName: countryCode || undefined,
      birthDate: englishDateToIso(birthOriginal),
      birthDateOriginal: birthOriginal || undefined,
      meetName: "World Athletics Top Lists",
      meetLocation: venue || undefined,
      performanceDate: englishDateToIso(dateOriginal),
      performanceDateOriginal: dateOriginal || undefined,
      roundLabel: "Melhor marca do atleta",
      sourceStatus: "Marca oficial World Athletics",
      sourceKey: "world-athletics-toplists-2026",
      sourceUrl
    });
  });

  return {
    sourceUrl,
    sourceUpdatedAt: new Date().toISOString(),
    ageLabel: ageLabels[input.ageKey],
    roundLabel: "Melhores tempos",
    sourceStatus: rows.length ? "Top List oficial publicada" : "Sem marcas publicadas",
    rows
  };
}

export class WorldAthleticsRankingProvider {
  async fetchRanking(input: WorldAthleticsRankingInput) {
    const sourceUrl = buildWorldAthleticsRankingUrl(input);
    const url = new URL(sourceUrl);
    if (url.protocol !== "https:" || url.hostname !== HOST) throw new Error("Fonte mundial fora da allowlist.");
    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(35_000),
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`A World Athletics respondeu com HTTP ${response.status}.`);
    return parseWorldAthleticsRankingHtml(await response.text(), sourceUrl, input);
  }
}
