import { createHash } from "node:crypto";

export const CIRCUIT_SUBMISSION_TYPES = ["OFFICIAL_COMPETITION", "TRACK_400M", "OPEN_COURSE"] as const;
export type CircuitSubmissionType = (typeof CIRCUIT_SUBMISSION_TYPES)[number];
export type CircuitGender = "FEMALE" | "MALE";
export type CircuitPeriod = "month" | "quarter" | "edition";

export const validationPriority: Record<CircuitSubmissionType, number> = {
  OFFICIAL_COMPETITION: 3,
  TRACK_400M: 2,
  OPEN_COURSE: 1
};

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function validateCpf(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calculate = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const digit = (sum * 10) % 11;
    return digit === 10 ? 0 : digit;
  };

  return calculate(9) === Number(cpf[9]) && calculate(10) === Number(cpf[10]);
}

export function parseCircuitTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):([0-5]\d)\.(\d{2})$/);
  if (!match) throw new Error("Use o formato MM:SS.CC, por exemplo 03:42.18.");
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const centiseconds = Number(match[3]);
  const milliseconds = minutes * 60_000 + seconds * 1_000 + centiseconds * 10;
  if (milliseconds < 60_000 || milliseconds > 30 * 60_000) throw new Error("Informe uma marca válida para 1.000 metros.");
  return milliseconds;
}

export function formatCircuitTime(milliseconds: number) {
  const safe = Math.max(0, Math.round(milliseconds / 10) * 10);
  const minutes = Math.floor(safe / 60_000);
  const seconds = Math.floor((safe % 60_000) / 1_000);
  const centiseconds = Math.floor((safe % 1_000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function categoryForBirthDate(birthDate: string, editionYear: number, minAge = 9, maxAge = 13) {
  const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error("Data de nascimento inválida.");
  const year = Number(match[1]);
  const date = new Date(`${birthDate}T12:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== birthDate) throw new Error("Data de nascimento inválida.");
  const age = editionYear - year;
  if (age < minAge || age > maxAge) throw new Error(`Nesta edição, a categoria deve estar entre ${minAge} e ${maxAge} anos.`);
  return { age, birthYear: year };
}

export function normalizePublicName(value: string) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/[{}[\]\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export function normalizeState(value: string) {
  const state = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(state)) throw new Error("Selecione um estado válido.");
  return state;
}

export function normalizeEvidenceUrl(value: string, allowedHosts: string[]) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Informe um link público válido.");
  }
  if (url.protocol !== "https:") throw new Error("O link precisa utilizar HTTPS.");
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)
  ) {
    throw new Error("Endereço privado não permitido.");
  }
  if (allowedHosts.length && !allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`))) {
    throw new Error("Este provedor de evidência não é aceito.");
  }
  url.hash = "";
  return url.toString();
}

export function elevationDecision(startMeters: number, endMeters: number, toleranceMeters = 2) {
  const delta = endMeters - startMeters;
  if (delta >= 0) return { status: "PASS" as const, delta };
  if (delta >= -Math.abs(toleranceMeters)) return { status: "REVIEW" as const, delta };
  return { status: "FAIL" as const, delta };
}

export function activityFingerprint(input: {
  athleteId: string;
  activityDate: string;
  declaredTimeMs: number;
  type: CircuitSubmissionType;
}) {
  return createHash("sha256")
    .update(`${input.athleteId}|${input.activityDate}|${input.declaredTimeMs}|${input.type}`)
    .digest("hex");
}

export type RankableSubmission = {
  id: string;
  athleteId: string;
  publicName: string;
  categoryAge: number;
  gender: CircuitGender;
  city: string;
  state: string;
  activityDate: string;
  timeMs: number;
  type: CircuitSubmissionType;
  badge: string;
};

export function selectBestMarks(items: RankableSubmission[]) {
  const best = new Map<string, RankableSubmission>();
  for (const item of items) {
    const current = best.get(item.athleteId);
    if (
      !current ||
      item.timeMs < current.timeMs ||
      (item.timeMs === current.timeMs && validationPriority[item.type] > validationPriority[current.type]) ||
      (item.timeMs === current.timeMs &&
        validationPriority[item.type] === validationPriority[current.type] &&
        item.activityDate < current.activityDate)
    ) {
      best.set(item.athleteId, item);
    }
  }
  return [...best.values()].sort(
    (a, b) =>
      a.timeMs - b.timeMs ||
      validationPriority[b.type] - validationPriority[a.type] ||
      a.activityDate.localeCompare(b.activityDate) ||
      a.publicName.localeCompare(b.publicName, "pt-BR")
  );
}

export function periodBounds(period: CircuitPeriod, anchor: string, editionStart: string, editionEnd: string) {
  const date = new Date(`${anchor}T12:00:00.000Z`);
  if (Number.isNaN(date.valueOf())) throw new Error("Período inválido.");
  if (period === "edition") return { start: editionStart, end: editionEnd };
  if (period === "month") {
    const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }
  const editionDate = new Date(`${editionStart}T12:00:00.000Z`);
  const elapsedMonths =
    (date.getUTCFullYear() - editionDate.getUTCFullYear()) * 12 + date.getUTCMonth() - editionDate.getUTCMonth();
  const cycleOffset = Math.max(0, Math.floor(elapsedMonths / 3) * 3);
  const start = new Date(Date.UTC(editionDate.getUTCFullYear(), editionDate.getUTCMonth() + cycleOffset, 1));
  const end = new Date(Date.UTC(editionDate.getUTCFullYear(), editionDate.getUTCMonth() + cycleOffset + 3, 0));
  return {
    start: start.toISOString().slice(0, 10) < editionStart ? editionStart : start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10) > editionEnd ? editionEnd : end.toISOString().slice(0, 10)
  };
}
