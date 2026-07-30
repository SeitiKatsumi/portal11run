import * as cheerio from "cheerio";
import {
  ageLabels,
  runningPerformanceToMilliseconds,
  type InternationalEvent,
  type InternationalGender,
  type NorwayAgeKey,
  type ParsedInternationalRanking
} from "./international-ranking-core.ts";

const NORWAY_HOST = "www.minfriidrettsstatistikk.info";
const BASE_URL = `https://${NORWAY_HOST}/php/LandsStatistikk.php`;
const USER_AGENT = "11RunInternationalReferences/1.0 (+https://11run.com.br/referencias/ranking-noruega)";

const classIds: Record<InternationalGender, Record<NorwayAgeKey, number>> = {
  M: { "13": 4, "14": 5, "15": 6, "16": 7 },
  F: { "13": 15, "14": 16, "15": 17, "16": 18 }
};

const eventIds: Record<InternationalEvent, number> = { 800: 9, 1500: 11, 3000: 13 };

function norwegianDateToIso(value: string, season: number) {
  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{2}|\d{4})$/);
  if (!match) return undefined;
  const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3]);
  return `${year || season}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function normalizeNorwegianPerformance(value: string) {
  const clean = value.trim().replace(/\s+/g, "");
  const parts = clean.split(",");
  if (parts.length === 3) return `${Number(parts[0])}:${parts[1].padStart(2, "0")}.${parts[2].padEnd(2, "0").slice(0, 2)}`;
  if (parts.length === 2) return `${parts[0]}.${parts[1].padEnd(2, "0").slice(0, 2)}`;
  return clean;
}

export function buildNorwayRankingUrl(input: {
  season: number;
  gender: InternationalGender;
  ageKey: NorwayAgeKey;
  event: InternationalEvent;
}) {
  const url = new URL(BASE_URL);
  url.searchParams.set("showclass", String(classIds[input.gender][input.ageKey]));
  url.searchParams.set("showevent", String(eventIds[input.event]));
  url.searchParams.set("outdoor", "Y");
  url.searchParams.set("showseason", String(input.season));
  url.searchParams.set("showclub", "0");
  return url.toString();
}

export function parseNorwayRankingHtml(
  html: string,
  sourceUrl: string,
  season: number,
  ageKey: NorwayAgeKey
): ParsedInternationalRanking {
  const $ = cheerio.load(html);
  const table = $("table").toArray().find((candidate) => {
    const headers = $(candidate).find("tr").first().find("th").map((_, cell) => $(cell).text().trim()).get();
    return ["Resultat", "Navn, Klubb", "F.Dato", "Plassering", "Sted", "R.Dato"].every((header) => headers.includes(header));
  });
  if (!table) throw new Error("A tabela principal da estatística norueguesa não foi localizada.");

  const rows: ParsedInternationalRanking["rows"] = [];
  $(table).find("tr").slice(1).each((_, row) => {
    if (rows.length >= 100) return false;
    const cells = $(row).find("td").toArray();
    if (cells.length < 6) return;
    const rawPerformance = $(cells[0]).text().trim();
    const athleteName = $(cells[1]).find("a").first().text().replace(/\s+/g, " ").trim();
    if (!rawPerformance || !athleteName) return;
    const fullIdentity = $(cells[1]).text().replace(/\s+/g, " ").trim();
    const teamName = fullIdentity.startsWith(athleteName)
      ? fullIdentity.slice(athleteName.length).replace(/^\s*,\s*/, "").trim()
      : undefined;
    const performance = normalizeNorwegianPerformance(rawPerformance);
    const birthOriginal = $(cells[2]).text().trim();
    const placeText = $(cells[3]).text().trim();
    const venueCell = $(cells[4]);
    const venueText = venueCell.clone().children().remove().end().text().replace(/\s+/g, " ").replace(/,\s*$/, "").trim();
    const meetName = venueCell.find("a").first().text().replace(/\s+/g, " ").trim();
    const resultDateOriginal = $(cells[5]).text().trim();
    rows.push({
      position: rows.length + 1,
      performance,
      performanceMilliseconds: runningPerformanceToMilliseconds(performance),
      athleteName,
      athleteAge: Number(ageKey),
      teamName: teamName || undefined,
      birthDate: norwegianDateToIso(birthOriginal, season),
      birthDateOriginal: birthOriginal || undefined,
      meetName: meetName || placeText || undefined,
      meetLocation: venueText || undefined,
      performanceDate: norwegianDateToIso(resultDateOriginal, season),
      performanceDateOriginal: resultDateOriginal || undefined,
      roundLabel: placeText || undefined,
      sourceStatus: "Resultado válido"
    });
  });

  return {
    sourceUrl,
    sourceUpdatedAt: new Date().toISOString(),
    ageLabel: ageLabels[ageKey],
    roundLabel: "Ranking nacional",
    sourceStatus: rows.length ? "Publicado" : "Sem resultados na fonte",
    rows
  };
}

export class NorwayRankingProvider {
  async fetchRanking(input: {
    season: number;
    gender: InternationalGender;
    ageKey: NorwayAgeKey;
    event: InternationalEvent;
  }) {
    const sourceUrl = buildNorwayRankingUrl(input);
    const url = new URL(sourceUrl);
    if (url.protocol !== "https:" || url.hostname !== NORWAY_HOST) throw new Error("Fonte norueguesa fora da allowlist.");
    const response = await fetch(sourceUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      signal: AbortSignal.timeout(25_000),
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`A fonte norueguesa respondeu com HTTP ${response.status}.`);
    return parseNorwayRankingHtml(await response.text(), sourceUrl, input.season, input.ageKey);
  }
}
