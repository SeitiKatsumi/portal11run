export const internationalEvents = [800, 1500, 3000] as const;
export const internationalGenders = ["M", "F"] as const;
export const internationalCountries = ["NO", "US"] as const;
export const norwayAgeKeys = ["13", "14", "15", "16"] as const;
export const usaAgeKeys = ["8-under", "9-10", "11-12", "13-14", "15-16", "17-18"] as const;

export type InternationalEvent = (typeof internationalEvents)[number];
export type InternationalGender = (typeof internationalGenders)[number];
export type InternationalCountry = (typeof internationalCountries)[number];
export type NorwayAgeKey = (typeof norwayAgeKeys)[number];
export type UsaAgeKey = (typeof usaAgeKeys)[number];
export type InternationalAgeKey = NorwayAgeKey | UsaAgeKey;

export type InternationalRankingQuery = {
  country: InternationalCountry;
  sourceKey: string;
  season: number;
  gender: InternationalGender;
  ageKey: InternationalAgeKey;
  event: InternationalEvent;
  limit?: number;
  search?: string;
  team?: string;
  region?: string;
};

export type ParsedInternationalRanking = {
  sourceUrl: string;
  sourceUpdatedAt?: string;
  ageLabel: string;
  roundLabel?: string;
  sourceStatus?: string;
  rows: Array<{
    position: number;
    performance: string;
    performanceMilliseconds?: number;
    athleteName: string;
    athleteAge?: number;
    teamName?: string;
    regionName?: string;
    birthDate?: string;
    birthDateOriginal?: string;
    meetName?: string;
    meetLocation?: string;
    performanceDate?: string;
    performanceDateOriginal?: string;
    roundLabel?: string;
    sourceStatus?: string;
  }>;
};

export const countryAgeKeys: Record<InternationalCountry, readonly InternationalAgeKey[]> = {
  NO: norwayAgeKeys,
  US: usaAgeKeys
};

export const ageLabels: Record<InternationalAgeKey, string> = {
  "13": "13 anos",
  "14": "14 anos",
  "15": "15 anos",
  "16": "16 anos",
  "8-under": "8 anos e abaixo",
  "9-10": "9–10 anos",
  "11-12": "11–12 anos",
  "13-14": "13–14 anos",
  "15-16": "15–16 anos",
  "17-18": "17–18 anos"
};

export function isInternationalCountry(value: unknown): value is InternationalCountry {
  return internationalCountries.includes(String(value).toUpperCase() as InternationalCountry);
}

export function isInternationalGender(value: unknown): value is InternationalGender {
  return internationalGenders.includes(String(value).toUpperCase() as InternationalGender);
}

export function isInternationalEvent(value: unknown): value is InternationalEvent {
  return internationalEvents.includes(Number(value) as InternationalEvent);
}

export function isInternationalAgeKey(country: InternationalCountry, value: unknown): value is InternationalAgeKey {
  return countryAgeKeys[country].includes(String(value) as InternationalAgeKey);
}

export function runningPerformanceToMilliseconds(value: string) {
  const normalized = value.trim().replace(",", ".");
  const match = normalized.match(/^(?:(\d+):)?(\d{1,2})\.(\d{1,3})$/);
  if (!match) return undefined;
  const minutes = Number(match[1] ?? 0);
  const seconds = Number(match[2]);
  const fraction = Number(match[3].padEnd(3, "0").slice(0, 3));
  return (minutes * 60 + seconds) * 1000 + fraction;
}
