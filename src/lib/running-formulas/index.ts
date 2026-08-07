import { PROJECTION_DISTANCES, SEGMENT_DISTANCES, TRAINING_ZONE_CONFIG, type TrainingZoneId } from "../../config/running-formulas.ts";

export type ConfidenceLevel = "good" | "moderate" | "exploratory";
export type FormulaInput = { distanceM: number; durationSec: number; riegelExponent: number; context?: string; surface?: string; audience?: string };

export function parseDuration(value: string) {
  if (!value || value.startsWith("-")) return null;
  const parts = value.trim().replace(",", ".").split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => part === "" || !/^\d+(\.\d+)?$/.test(part))) return null;
  const numbers = parts.map(Number);
  const seconds = numbers.at(-1)!;
  const minutes = numbers.at(-2)!;
  if (seconds >= 60 || (parts.length === 3 && minutes >= 60)) return null;
  const total = seconds + minutes * 60 + (parts.length === 3 ? numbers[0] * 3600 : 0);
  return total > 0 && Number.isFinite(total) ? total : null;
}

export function formatDuration(seconds: number, decimals = false) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const value = decimals && seconds < 600 ? Math.round(seconds * 10) / 10 : Math.round(seconds);
  const h = Math.floor(value / 3600); const m = Math.floor((value % 3600) / 60); const s = value - h * 3600 - m * 60;
  const ss = decimals && seconds < 600 ? s.toFixed(1).padStart(4, "0") : String(Math.round(s)).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export function calculateOxygenDemand(speedMMin: number) { return -4.6 + .182258 * speedMMin + .000104 * speedMMin ** 2; }
export function calculateSustainableFraction(minutes: number) { return .8 + .1894393 * Math.exp(-.012778 * minutes) + .2989558 * Math.exp(-.1932605 * minutes); }
export function calculateVDOT(distanceM: number, seconds: number) { const minutes = seconds / 60; return calculateOxygenDemand(distanceM / minutes) / calculateSustainableFraction(minutes); }
export function calculateRiegelProjection(sourceDistance: number, sourceSeconds: number, targetDistance: number, k = 1.06) { return sourceSeconds * (targetDistance / sourceDistance) ** k; }
export function calculateIndividualRiegelExponent(d1: number, t1: number, d2: number, t2: number) { return Math.log(t2 / t1) / Math.log(d2 / d1); }

export function solveSpeedFromOxygenDemand(oxygen: number) {
  return (-.182258 + Math.sqrt(.182258 ** 2 + 4 * .000104 * (oxygen + 4.6))) / (2 * .000104);
}

export function solveEquivalentVDOTTime(distanceM: number, targetVdot: number) {
  let low = Math.max(60, distanceM / 12); let high = Math.max(7200, distanceM * 3);
  for (let i = 0; i < 100 && high - low > .01; i++) { const mid = (low + high) / 2; if (calculateVDOT(distanceM, mid) > targetVdot) low = mid; else high = mid; }
  return (low + high) / 2;
}

function confidence(source: number, target: number): ConfidenceLevel { const ratio = Math.max(source, target) / Math.min(source, target); return ratio <= 2 ? "good" : ratio <= 4 ? "moderate" : "exploratory"; }

export function calculateFormulaResult(input: FormulaInput) {
  const paceSecKm = input.durationSec / (input.distanceM / 1000);
  const speedKmh = input.distanceM / input.durationSec * 3.6;
  const vdot = calculateVDOT(input.distanceM, input.durationSec);
  const vdotSpeedMMin = solveSpeedFromOxygenDemand(vdot);
  const projections = PROJECTION_DISTANCES.map((distanceM) => {
    const riegelSeconds = calculateRiegelProjection(input.distanceM, input.durationSec, distanceM, input.riegelExponent);
    const vdotSeconds = distanceM === input.distanceM ? input.durationSec : solveEquivalentVDOTTime(distanceM, vdot);
    return { distanceM, riegelSeconds, vdotSeconds, differencePercent: Math.abs(riegelSeconds - vdotSeconds) / ((riegelSeconds + vdotSeconds) / 2) * 100, confidence: confidence(input.distanceM, distanceM), isSource: distanceM === input.distanceM };
  });
  const zones = (Object.entries(TRAINING_ZONE_CONFIG) as [TrainingZoneId, typeof TRAINING_ZONE_CONFIG[TrainingZoneId]][]).map(([id, config]) => {
    const minV = config.basis === "oxygenFraction" ? solveSpeedFromOxygenDemand(vdot * config.min) : vdotSpeedMMin * config.min;
    const maxV = config.basis === "oxygenFraction" ? solveSpeedFromOxygenDemand(vdot * config.max) : vdotSpeedMMin * config.max;
    const segments = SEGMENT_DISTANCES.map((meters) => ({ meters, fast: meters / maxV * 60, slow: meters / minV * 60 }));
    return { id, ...config, fastPace: 60000 / maxV, slowPace: 60000 / minV, minSpeedKmh: minV * .06, maxSpeedKmh: maxV * .06, segments };
  });
  return { input, paceSecKm, speedKmh, vdot, vdotSpeedKmh: vdotSpeedMMin * .06, vdotPaceSecKm: 60000 / vdotSpeedMMin, projections, zones };
}
