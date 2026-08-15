import { calculateRiegelProjection, parseDuration, solveEquivalentVDOTTime, calculateVDOT } from "../running-formulas/index.ts";

export const OLYMPIC_PATHWAY_VERSION = "oci-1.0.0";
export const pathwayEvents = [800, 1500, 3000, 5000, 10000] as const;
export type PathwayEvent = (typeof pathwayEvents)[number];
export type CompetitiveGender = "M" | "F";
export type Alignment = "exact_age" | "one_year_band" | "two_year_band" | "school_year_reference" | "u18_broad" | "u20_broad" | "senior" | "projected_event" | "insufficient_comparison";

export type PathwayInput = {
  event: PathwayEvent;
  performance: string;
  ageYears: number;
  ageMonths: number;
  gender: CompetitiveGender;
  representedCountry: string;
  performanceDate: string;
  context: "official" | "measured-test" | "track-training" | "road" | "free-course" | "estimate";
  surface: "outdoor" | "indoor" | "road" | "cross" | "unmeasured";
};

export type ComparableSource = {
  key: string;
  label: string;
  country: string;
  category: string;
  alignment: Alignment;
  sourceUrl: string;
  updatedAt?: string | null;
  status: "available" | "unavailable" | "future" | "incompatible";
  message?: string;
  performancesMs: number[];
};

const alignmentWeight: Record<Alignment, number> = {
  exact_age: 1,
  one_year_band: .94,
  two_year_band: .88,
  school_year_reference: .82,
  u18_broad: .7,
  u20_broad: .62,
  senior: .55,
  projected_event: .5,
  insufficient_comparison: 0
};

export function validatePathwayInput(value: Partial<PathwayInput>) {
  const errors: Record<string, string> = {};
  const seconds = parseDuration(value.performance ?? "");
  if (!pathwayEvents.includes(value.event as PathwayEvent)) errors.event = "Selecione uma prova válida.";
  if (!seconds) errors.performance = "Informe uma marca válida, como 4:32.8.";
  if (!Number.isInteger(value.ageYears) || Number(value.ageYears) < 9 || Number(value.ageYears) > 80) errors.ageYears = "A idade deve estar entre 9 e 80 anos.";
  if (!Number.isInteger(value.ageMonths) || Number(value.ageMonths) < 0 || Number(value.ageMonths) > 11) errors.ageMonths = "Informe de 0 a 11 meses.";
  if (!(["M", "F"] as const).includes(value.gender as CompetitiveGender)) errors.gender = "Selecione a categoria competitiva.";
  if (!value.performanceDate || !/^\d{4}-\d{2}-\d{2}$/.test(value.performanceDate)) errors.performanceDate = "Informe a data da marca.";
  return { valid: Object.keys(errors).length === 0, errors, seconds };
}

function positionFor(markMs: number, performances: number[]) {
  const ordered = performances.filter(Number.isFinite).sort((a, b) => a - b);
  if (!ordered.length) return null;
  const estimatedPosition = ordered.filter((value) => value < markMs).length + 1;
  return { position: estimatedPosition > ordered.length ? null : estimatedPosition, beyondAvailableList: estimatedPosition > ordered.length, count: ordered.length, leaderMs: ordered[0], tenthMs: ordered[9] ?? null, hundredthMs: ordered[99] ?? null };
}

export function analyzeOlympicPathway(input: PathwayInput, sources: ComparableSource[], generatedAt = new Date().toISOString()) {
  const checked = validatePathwayInput(input);
  if (!checked.valid || !checked.seconds) throw new Error("Dados da marca inválidos.");
  const markMs = checked.seconds * 1000;
  const comparisons = sources.map((source) => {
    const ranking = source.status === "available" ? positionFor(markMs, source.performancesMs) : null;
    if (!ranking) return { ...source, position: null, count: source.performancesMs.length, score: null, top10GapMs: null };
    const percentile = ranking.position === null ? 1 : Math.max(1, Math.min(100, 101 - ranking.position));
    return { ...source, ...ranking, score: percentile * alignmentWeight[source.alignment], top10GapMs: ranking.tenthMs ? markMs - ranking.tenthMs : null };
  });
  const scored = comparisons.filter((item) => item.score !== null && item.count >= 5);
  const totalWeight = scored.reduce((sum, item) => sum + alignmentWeight[item.alignment], 0);
  const compatibility = totalWeight ? Math.round(scored.reduce((sum, item) => sum + Number(item.score) * alignmentWeight[item.alignment], 0) / totalWeight) : null;
  const age = input.ageYears + input.ageMonths / 12;
  const confidence = age < 14 ? "baixa" : scored.length >= 5 && age >= 18 ? "moderada" : scored.length >= 3 ? "moderada" : "baixa";
  const mode = age < 14 ? "base-protegida" : age < 18 ? "desenvolvimento" : "rota-competitiva";
  const cycles = [2028, 2032, 2036, 2040].map((year) => ({ year, age: Math.floor(age + (year - new Date(input.performanceDate).getFullYear())) }));
  const threeKRoutes = input.event === 3000 ? [1500, 5000].map((distance) => {
    const vdot = calculateVDOT(3000, checked.seconds!);
    const riegel = calculateRiegelProjection(3000, checked.seconds!, distance);
    const daniels = solveEquivalentVDOTTime(distance, vdot);
    return { distance, riegelSeconds: riegel, danielsSeconds: daniels, divergencePercent: Math.abs(riegel - daniels) / ((riegel + daniels) / 2) * 100 };
  }) : [];
  return {
    compatibility,
    probabilityCalibrated: false,
    confidence,
    mode,
    comparisons,
    comparableSources: scored.length,
    totalSources: sources.length,
    cycles,
    threeKRoutes,
    metadata: { engineVersion: OLYMPIC_PATHWAY_VERSION, generatedAt, rankingSnapshot: generatedAt.slice(0, 10) }
  };
}
