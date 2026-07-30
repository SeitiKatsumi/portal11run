export const japanEvents = [800, 1500, 3000, 5000] as const;
export const japanGenders = ["M", "F"] as const;
export const japanAges = [12, 13, 14, 15, 16, 17] as const;

export type JapanEvent = (typeof japanEvents)[number];
export type JapanGender = (typeof japanGenders)[number];
export type JapanAge = (typeof japanAges)[number];
export type JapanSchoolYear = 1 | 2 | 3;

export type JapanRankingQuery = {
  season: number;
  gender: JapanGender;
  age: JapanAge;
  event: JapanEvent;
  limit?: number;
  search?: string;
  team?: string;
  prefecture?: string;
};

export type ParsedJapanRanking = {
  sourceUpdatedAt?: string;
  rows: Array<{
    position: number;
    points?: number;
    performance: string;
    performanceMilliseconds?: number;
    athleteNameJapanese: string;
    prefectureJapanese?: string;
    teamJapanese?: string;
    schoolYear: JapanSchoolYear;
    performanceDateOriginal?: string;
    performanceDate?: string;
    proofImageUrl?: string;
    proofPdfUrl?: string;
  }>;
};

export const referenceAgeToSchoolYear = (age: JapanAge) => (
  age <= 14 ? age - 11 : age - 14
) as JapanSchoolYear;
export const schoolYearToReferenceAge = (year: JapanSchoolYear, level: "junior" | "high" = "junior") => (
  year + (level === "junior" ? 11 : 14)
) as JapanAge;

export const japanSchoolLevel = (age: JapanAge) => age <= 14 ? "junior" as const : "high" as const;

export function isJapanEvent(value: unknown): value is JapanEvent {
  return japanEvents.includes(Number(value) as JapanEvent);
}

export function isJapanAge(value: unknown): value is JapanAge {
  return japanAges.includes(Number(value) as JapanAge);
}

export function isJapanGender(value: unknown): value is JapanGender {
  return japanGenders.includes(String(value).toUpperCase() as JapanGender);
}

export function performanceToMilliseconds(value: string) {
  const normalized = value.trim();
  const match = normalized.match(/^(?:(\d+):)?(\d{1,2})\.(\d{1,2})$/);
  if (!match) return undefined;
  const minutes = Number(match[1] ?? 0);
  const seconds = Number(match[2]);
  const hundredths = Number(match[3].padEnd(2, "0").slice(0, 2));
  return (minutes * 60 + seconds) * 1000 + hundredths * 10;
}

export function jaafDateToIso(value: string | undefined, season: number) {
  if (!value) return undefined;
  const match = value.replace(/\s/g, "").match(/^(\d{1,2})月(\d{1,2})日$/);
  if (!match) return undefined;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  return `${season}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
