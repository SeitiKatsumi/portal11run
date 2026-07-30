import * as cheerio from "cheerio";
import {
  jaafDateToIso,
  performanceToMilliseconds,
  type JapanEvent,
  type JapanGender,
  type JapanSchoolYear,
  type ParsedJapanRanking
} from "./japan-ranking-core.ts";

const JAAF_HOSTS = new Set(["www.jaaf.or.jp", "jaaf.or.jp"]);
const USER_AGENT = "11RunInternationalReferences/1.0 (+https://11run.com.br/referencias/ranking-japao)";

export type JaafRequest = {
  baseUrl: string;
  season: number;
  event: JapanEvent;
  eventId: number;
  typeId: number;
  gender: JapanGender;
  schoolYear: JapanSchoolYear;
};

function absoluteJaafUrl(value: string, sourceUrl: string) {
  const url = new URL(value, sourceUrl);
  if (!JAAF_HOSTS.has(url.hostname)) throw new Error("A fonte retornou um link externo não permitido.");
  return url.toString();
}

export function buildJaafRankingUrl(input: JaafRequest) {
  const url = new URL(input.baseUrl);
  if (url.protocol !== "https:" || !JAAF_HOSTS.has(url.hostname)) {
    throw new Error("A URL-base da JAAF não pertence à allowlist oficial.");
  }
  url.searchParams.set("event_id", String(input.eventId));
  url.searchParams.set("type_id", String(input.typeId));
  url.searchParams.set("search", "1");
  url.searchParams.set("gender", input.gender);
  url.searchParams.set("school_year", String(input.schoolYear));
  url.searchParams.set("order", "1");
  url.hash = "sectionRanking";
  return url.toString();
}

export function parseJaafRankingHtml(
  html: string,
  sourceUrl: string,
  season: number,
  expectedSchoolYear: JapanSchoolYear
): ParsedJapanRanking {
  const $ = cheerio.load(html);
  const tables = $("table").toArray();
  const rankingTable = tables.find((table) => {
    const headers = $(table).find("tr").first().find("th").map((_, cell) => $(cell).text().trim()).get();
    return ["順位", "記録", "氏名", "学校/クラブ", "学年"].every((header) => headers.includes(header));
  });
  if (!rankingTable) throw new Error("A tabela de ranking não foi localizada na estrutura atual da JAAF.");

  const headers = $(rankingTable).find("tr").first().find("th").map((_, cell) => $(cell).text().replace(/\s+/g, "").trim()).get();
  const indexOf = (label: string) => headers.findIndex((header) => header === label);
  const required = ["順位", "記録", "氏名", "学年"];
  if (required.some((label) => indexOf(label) < 0)) {
    throw new Error(`A estrutura da JAAF mudou: colunas obrigatórias ausentes (${required.join(", ")}).`);
  }

  const sourceUpdatedMatch = $.root().text().replace(/\s+/g, " ").match(/(\d{4}年\d{1,2}月\d{1,2}日)更新/);
  const rows: ParsedJapanRanking["rows"] = [];

  $(rankingTable).find("tr").slice(1).each((_, row) => {
    if (rows.length >= 100) return false;
    const cells = $(row).find("td").toArray();
    if (cells.length < required.length) return;
    const text = (label: string) => {
      const index = indexOf(label);
      return index >= 0 ? $(cells[index]).clone().children().remove().end().text().replace(/\s+/g, " ").trim() : "";
    };
    const position = Number.parseInt(text("順位"), 10);
    const performance = text("記録");
    const athleteNameJapanese = text("氏名");
    const yearMatch = text("学年").match(/([123])年/);
    const schoolYear = yearMatch ? Number(yearMatch[1]) as JapanSchoolYear : undefined;
    if (!Number.isFinite(position) || !performance || !athleteNameJapanese || schoolYear !== expectedSchoolYear) return;

    const pointsText = text("ポイント");
    const points = pointsText ? Number(pointsText) : undefined;
    const originalDate = text("競技日") || undefined;
    const proofCellIndex = headers.findIndex((header) => header === "記録証");
    const proofCell = proofCellIndex >= 0 ? $(cells[proofCellIndex]) : null;
    const modalId = proofCell?.find("a.popup-modal").attr("href")?.replace(/^#kirokusho_/, "");
    const pdfHref = $(row).find('a[href*="filetype=pdf"]').first().attr("href");
    const imageUrl = modalId
      ? new URL(`?event_id=${new URL(sourceUrl).searchParams.get("event_id") ?? ""}&type_id=1&record=${modalId}`, sourceUrl).toString()
      : undefined;

    rows.push({
      position,
      points: Number.isFinite(points) ? points : undefined,
      performance,
      performanceMilliseconds: performanceToMilliseconds(performance),
      athleteNameJapanese,
      prefectureJapanese: text("都道府県") || undefined,
      teamJapanese: text("学校/クラブ") || undefined,
      schoolYear,
      performanceDateOriginal: originalDate,
      performanceDate: jaafDateToIso(originalDate, season),
      proofImageUrl: imageUrl,
      proofPdfUrl: pdfHref ? absoluteJaafUrl(pdfHref, sourceUrl) : undefined
    });
  });

  if (!rows.length) throw new Error("A JAAF respondeu sem resultados válidos para a categoria.");
  return { sourceUpdatedAt: sourceUpdatedMatch?.[1], rows };
}

export class JaafRankingProvider {
  async fetchRanking(input: JaafRequest) {
    const sourceUrl = buildJaafRankingUrl(input);
    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const response = await fetch(sourceUrl, {
          headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
          signal: AbortSignal.timeout(18_000),
          cache: "no-store"
        });
        if (!response.ok) throw new Error(`A JAAF respondeu com HTTP ${response.status}.`);
        const html = await response.text();
        const parsed = parseJaafRankingHtml(html, sourceUrl, input.season, input.schoolYear);
        return { sourceUrl, ...parsed };
      } catch (error) {
        lastError = error;
        if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 900));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Não foi possível consultar a JAAF.");
  }
}
