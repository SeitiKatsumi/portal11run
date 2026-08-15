import { listBrazilRankings } from "@/lib/brazil-rankings";
import { listInternationalRankings, sourceKeyForCountry } from "@/lib/international-rankings";
import { listJapanRankings } from "@/lib/japan-rankings";
import { listWorldAthleticsRankings } from "@/lib/world-athletics-rankings";
import type { JapanAge, JapanEvent } from "@/lib/japan-ranking-core";
import type { InternationalAgeKey, InternationalEvent } from "@/lib/international-ranking-core";
import type { Alignment, ComparableSource, PathwayInput } from "./core";

type RankingRow = { performance_milliseconds?: number | null; performance?: string; source_url?: string };
type RankingPayload = { results?: RankingRow[]; count?: number; import?: Record<string, unknown> | null; source?: { sourceUrl?: string }; config?: { available?: boolean; note?: string | null } };

function performanceMs(row: RankingRow) {
  if (Number.isFinite(row.performance_milliseconds)) return Number(row.performance_milliseconds);
  const value = String(row.performance ?? "").replace(",", ".");
  const parts = value.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  const seconds = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0];
  return seconds * 1000;
}

function sourceFromPayload(config: Omit<ComparableSource, "performancesMs" | "status">, payload: RankingPayload): ComparableSource {
  const rows = payload.results ?? [];
  const available = payload.config?.available !== false && Boolean(payload.import) && rows.length > 0;
  return { ...config, sourceUrl: config.sourceUrl || payload.source?.sourceUrl || "", status: available ? "available" : "unavailable", message: available ? undefined : payload.config?.note ?? "Esta referência não possui dados sincronizados suficientes para a análise atual.", updatedAt: String(payload.import?.completed_at ?? payload.import?.source_updated_at ?? "") || null, performancesMs: rows.map(performanceMs).filter((value) => value > 0) };
}

function usaAge(age: number): { ageKey: InternationalAgeKey; alignment: Alignment; category: string } | null {
  if (age <= 8) return null;
  const ageKey = age <= 10 ? "9-10" : age <= 12 ? "11-12" : age <= 14 ? "13-14" : age <= 16 ? "15-16" : age <= 18 ? "17-18" : null;
  return ageKey ? { ageKey, alignment: "two_year_band", category: ageKey } : null;
}

export async function loadOlympicPathwaySources(input: PathwayInput) {
  const season = Number(input.performanceDate.slice(0, 4));
  const age = input.ageYears;
  const event = input.event as InternationalEvent;
  const tasks: Array<Promise<ComparableSource>> = [];
  const brAge = age <= 15 ? "sub16" : age <= 17 ? "sub18" : null;
  if (brAge && event !== 10000) tasks.push(listBrazilRankings({ season, gender: input.gender, ageKey: brAge, event, limit: 100 }).then((payload) => sourceFromPayload({ key: "BR", label: "Brasil", country: "BR", category: brAge === "sub16" ? "Sub-16" : "Sub-18", alignment: "two_year_band", sourceUrl: "https://11run.com.br/referencias/ranking-brasil" }, payload)));
  const us = usaAge(age);
  if (us) tasks.push(Promise.resolve(listInternationalRankings({ country: "US", sourceKey: sourceKeyForCountry("US"), season, gender: input.gender, ageKey: us.ageKey, event, limit: 100 })).then((payload) => sourceFromPayload({ key: "US", label: "Estados Unidos", country: "US", category: us.category, alignment: us.alignment, sourceUrl: "https://11run.com.br/referencias/ranking-eua" }, payload)));
  if (age >= 13 && age <= 19 && event !== 10000) {
    const ageKey = age <= 17 ? String(age) : "18-19";
    tasks.push(Promise.resolve(listInternationalRankings({ country: "NO", sourceKey: sourceKeyForCountry("NO"), season, gender: input.gender, ageKey: ageKey as InternationalAgeKey, event, limit: 100 })).then((payload) => sourceFromPayload({ key: "NO", label: "Noruega", country: "NO", category: ageKey, alignment: age <= 17 ? "exact_age" : "two_year_band", sourceUrl: "https://11run.com.br/referencias/ranking-noruega" }, payload)));
  }
  if (age >= 12 && age <= 17 && event !== 10000) {
    const payload = listJapanRankings({ season, gender: input.gender, age: age as JapanAge, event: event as JapanEvent, limit: 100 });
    const normalized: RankingPayload = { ...payload, results: (payload.results as RankingRow[]), source: { sourceUrl: "https://11run.com.br/referencias/ranking-japao" } };
    tasks.push(Promise.resolve(sourceFromPayload({ key: "JP", label: "Japão", country: "JP", category: `${age} anos (série escolar)`, alignment: "school_year_reference", sourceUrl: "https://11run.com.br/referencias/ranking-japao" }, normalized)));
  }
  const worldAge = age <= 17 ? "u18" : age <= 19 ? "u20" : "senior";
  const alignment: Alignment = worldAge === "u18" ? "u18_broad" : worldAge === "u20" ? "u20_broad" : "senior";
  for (const scope of ["KE", "UG", "WORLD"] as const) tasks.push(listWorldAthleticsRankings({ scope, season, gender: input.gender, ageKey: worldAge, event, limit: 100 }).then((payload) => sourceFromPayload({ key: scope, label: scope === "KE" ? "Quênia" : scope === "UG" ? "Uganda" : "Mundial", country: scope, category: worldAge.toUpperCase(), alignment, sourceUrl: scope === "KE" ? "https://11run.com.br/referencias/ranking-quenia" : scope === "UG" ? "https://11run.com.br/referencias/ranking-uganda" : "https://11run.com.br/referencias/ranking-mundial" }, payload)));
  const settled = await Promise.allSettled(tasks);
  return settled.map((result, index) => result.status === "fulfilled" ? result.value : ({ key: `unavailable-${index}`, label: "Base temporariamente indisponível", country: "", category: "", alignment: "insufficient_comparison", sourceUrl: "", status: "unavailable", message: "A fonte não respondeu e não participou desta análise.", performancesMs: [] } as ComparableSource));
}
