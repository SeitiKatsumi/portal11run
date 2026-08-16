import { calculateRiegelProjection, parseDuration, solveEquivalentVDOTTime, calculateVDOT } from "../running-formulas/index.ts";

export const OLYMPIC_PATHWAY_VERSION = "opi-2.3.0";
export const pathwayEvents = [800, 1000, 1500, 3000, 5000, 10000] as const;
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

export type PotentialBand = "starting" | "moving" | "international" | "promising" | "extraordinary";
export type PathwayBadge = { key: string; label: string; description: string; level: "bronze" | "silver" | "gold" };

export function potentialBandFor(score: number, hasInternationalTop30 = false): PotentialBand {
  if (score >= 75) return "extraordinary";
  if (score >= 55) return "promising";
  if (score >= 35 || hasInternationalTop30) return "international";
  if (score >= 15) return "moving";
  return "starting";
}

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
    return { ...source, ...ranking, score: percentile, top10GapMs: ranking.tenthMs ? markMs - ranking.tenthMs : null };
  });
  const scored = comparisons.filter((item) => item.score !== null && item.count >= 5);
  const totalWeight = scored.reduce((sum, item) => sum + alignmentWeight[item.alignment], 0);
  const baseScore = totalWeight ? Math.round(scored.reduce((sum, item) => sum + Number(item.score) * alignmentWeight[item.alignment], 0) / totalWeight) : null;
  const age = input.ageYears + input.ageMonths / 12;
  const youthProjection = age >= 9 && age < 15;
  const international = comparisons.filter((item) => ["US", "JP", "NO"].includes(item.key.split("-")[0]) && item.status === "available" && item.score !== null && item.position !== null);
  const nationalTop50 = comparisons.filter((item) => item.key !== "WORLD" && item.status === "available" && item.score !== null && item.position !== null && Number(item.position) <= 50);
  const topInternational = international.filter((item) => Number(item.position) <= 30);
  const bestInternational = international.reduce<(typeof international)[number] | null>((best, item) => !best || Number(item.position) < Number(best.position) ? item : best, null);
  const internationalFloor = topInternational.some((item) => Number(item.position) <= 3) ? 75 : topInternational.some((item) => Number(item.position) <= 10) ? 55 : topInternational.length ? 35 : 1;
  const developmentBonus = youthProjection && baseScore !== null ? age < 11 ? 8 : age < 13 ? 5 : 3 : 0;
  const youngEnduranceActive = age < 13 && (input.event === 3000 || input.event === 5000);
  const enduranceBonus = youngEnduranceActive ? Math.round((13 - age) * (input.event === 5000 ? 4 : 3)) : 0;
  const enduranceFloor = !youngEnduranceActive ? 1 : input.event === 5000
    ? age < 10 ? 35 : age < 11 ? 32 : age < 12 ? 29 : 26
    : age < 10 ? 30 : age < 11 ? 28 : age < 12 ? 25 : 22;
  const nationalFloor = nationalTop50.length ? 20 : 1;
  const projectedBase = baseScore === null ? youthProjection ? 5 : null : baseScore + developmentBonus + enduranceBonus;
  const potentialScore = projectedBase === null ? null : Math.min(100, Math.max(1, projectedBase, internationalFloor, nationalFloor, enduranceFloor));
  const badges: PathwayBadge[] = [];
  if (topInternational.length) badges.push({ key: "international-top-30", label: "Destaque internacional", description: `Top 30 em ${topInternational.map((item) => item.label).join(", ")}.`, level: "bronze" });
  if (nationalTop50.length) badges.push({ key: "national-top-50", label: "Sonho olímpico ativado", description: `Top 50 em ${nationalTop50.map((item) => item.label).join(", ")}: na teoria recreativa, existe uma chance.`, level: "bronze" });
  if (youngEnduranceActive) badges.push({ key: "young-endurance", label: "Pequena grande fundista", description: `${input.event.toLocaleString("pt-BR")} m antes dos 13 anos: uma distância avançada para essa fase da infância.`, level: "gold" });
  if (topInternational.some((item) => Number(item.position) <= 10)) badges.push({ key: "international-top-10", label: "Top 10 desbloqueado", description: "Sua marca entrou no Top 10 de uma referência internacional.", level: "silver" });
  if (topInternational.some((item) => Number(item.position) <= 3)) badges.push({ key: "international-top-3", label: "Pódio internacional", description: "Sua marca alcançou o Top 3 de uma referência internacional.", level: "gold" });
  if (topInternational.length >= 2) badges.push({ key: "multiple-countries", label: "Passaporte carimbado", description: `Destaque em ${topInternational.length} países de referência.`, level: "gold" });
  if (scored.filter((item) => item.position !== null && Number(item.position) <= 50).length >= 3) badges.push({ key: "consistent", label: "Consistência global", description: "Top 50 em pelo menos três bases comparáveis.", level: "silver" });
  badges.push({ key: "future-cycles", label: "Sonho em movimento", description: "Sua trajetória ainda pode atravessar novos ciclos olímpicos.", level: "bronze" });
  const potentialBand = potentialScore === null ? null : potentialBandFor(potentialScore, topInternational.length > 0);
  const confidence = youthProjection ? scored.length ? "projeção recreativa" : "projeção exploratória" : scored.length >= 5 && age >= 18 ? "moderada" : scored.length >= 3 ? "moderada" : "baixa";
  const mode = youthProjection ? "base-protegida" : age < 18 ? "desenvolvimento" : "rota-competitiva";
  const cycles = [2028, 2032, 2036, 2040].map((year) => ({ year, age: Math.floor(age + (year - new Date(input.performanceDate).getFullYear())) }));
  const worldSource = comparisons.find((item) => item.key === "WORLD" || item.key.startsWith("WORLD-"));
  const worldTop50 = age >= 23 && worldSource?.status === "available"
    ? worldSource.performancesMs.slice().filter(Number.isFinite).sort((a, b) => a - b).slice(0, 50).map((performanceMs, index) => ({ position: index + 1, performanceMs }))
    : [];
  const threeKRoutes = input.event === 3000 ? [1500, 5000].map((distance) => {
    const vdot = calculateVDOT(3000, checked.seconds!);
    const riegel = calculateRiegelProjection(3000, checked.seconds!, distance);
    const daniels = solveEquivalentVDOTTime(distance, vdot);
    return { distance, riegelSeconds: riegel, danielsSeconds: daniels, divergencePercent: Math.abs(riegel - daniels) / ((riegel + daniels) / 2) * 100 };
  }) : [];
  return {
    compatibility: potentialScore,
    potentialScore,
    potentialBand,
    bestInternational: bestInternational ? { key: bestInternational.key, label: bestInternational.label, position: bestInternational.position } : null,
    internationalHighlights: topInternational.map((item) => ({ key: item.key, label: item.label, position: item.position })),
    nationalTop50: nationalTop50.map((item) => ({ key: item.key, label: item.label, position: item.position })),
    projectionUsed: youthProjection,
    projectionBasis: baseScore === null ? "developmental-baseline" : developmentBonus ? "rankings-plus-development-coefficient" : "rankings",
    developmentBonus,
    youngEndurance: { active: youngEnduranceActive, bonus: enduranceBonus, floor: enduranceFloor, event: input.event, age },
    badges,
    probabilityCalibrated: false,
    confidence,
    mode,
    comparisons,
    comparableSources: scored.length,
    totalSources: sources.length,
    cycles,
    worldTop50,
    threeKRoutes,
    metadata: { engineVersion: OLYMPIC_PATHWAY_VERSION, generatedAt, rankingSnapshot: generatedAt.slice(0, 10) }
  };
}
