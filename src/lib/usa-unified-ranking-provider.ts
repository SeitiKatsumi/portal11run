import { AauRankingProvider } from "./aau-ranking-provider.ts";
import {
  ageLabels,
  type InternationalEvent,
  type InternationalGender,
  type ParsedInternationalRanking,
  type UsaAgeKey
} from "./international-ranking-core.ts";
import { UsaRankingProvider } from "./usa-ranking-provider.ts";

const usaProvider = new UsaRankingProvider();
const aauProvider = new AauRankingProvider();

type UsaUnifiedInput = {
  season: number;
  gender: InternationalGender;
  ageKey: UsaAgeKey;
  event: InternationalEvent;
};

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

function likelySameAthlete(
  first: ParsedInternationalRanking["rows"][number],
  second: ParsedInternationalRanking["rows"][number]
) {
  if (first.athleteAge && second.athleteAge && first.athleteAge !== second.athleteAge) return false;
  const firstName = normalized(first.athleteName);
  const secondName = normalized(second.athleteName);
  const sameName = firstName === secondName
    || (Math.min(firstName.length, secondName.length) >= 14
      && (firstName.startsWith(secondName) || secondName.startsWith(firstName)));
  if (!sameName) return false;
  const firstTeam = normalized(first.teamName ?? "");
  const secondTeam = normalized(second.teamName ?? "");
  return !firstTeam || !secondTeam || firstTeam === secondTeam
    || (Math.min(firstTeam.length, secondTeam.length) >= 8
      && (firstTeam.startsWith(secondTeam) || secondTeam.startsWith(firstTeam)));
}

export function unifyUsaRankingResults(
  collections: ParsedInternationalRanking[],
  input: UsaUnifiedInput
): ParsedInternationalRanking {
  const merged: ParsedInternationalRanking["rows"] = [];
  for (const collection of collections) {
    for (const candidate of collection.rows) {
      const existingIndex = merged.findIndex((row) => likelySameAthlete(row, candidate));
      if (existingIndex < 0) {
        merged.push(candidate);
        continue;
      }
      const existing = merged[existingIndex];
      if (Number(candidate.performanceMilliseconds ?? Number.POSITIVE_INFINITY)
        < Number(existing.performanceMilliseconds ?? Number.POSITIVE_INFINITY)) {
        merged[existingIndex] = candidate;
      }
    }
  }

  const rows = merged
    .sort((a, b) => Number(a.performanceMilliseconds ?? Number.POSITIVE_INFINITY)
      - Number(b.performanceMilliseconds ?? Number.POSITIVE_INFINITY))
    .slice(0, 100)
    .map((row, index) => ({ ...row, position: index + 1 }));
  const latestUpdate = collections
    .map((collection) => collection.sourceUpdatedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return {
    sourceUrl: "https://11run.com.br/referencias/ranking-eua",
    sourceUpdatedAt: latestUpdate,
    ageLabel: ageLabels[input.ageKey],
    roundLabel: "Top 100 unificado",
    sourceStatus: `${collections.length} fontes oficiais unificadas`,
    rows
  };
}

export class UsaUnifiedRankingProvider {
  async fetchRanking(input: UsaUnifiedInput): Promise<ParsedInternationalRanking> {
    const attempts = await Promise.allSettled([
      usaProvider.fetchRanking(input),
      aauProvider.fetchRanking(input)
    ]);
    const collections = attempts
      .filter((attempt): attempt is PromiseFulfilledResult<ParsedInternationalRanking> => attempt.status === "fulfilled")
      .map((attempt) => attempt.value);

    if (!collections.length) {
      const diagnostics = attempts
        .filter((attempt): attempt is PromiseRejectedResult => attempt.status === "rejected")
        .map((attempt) => attempt.reason instanceof Error ? attempt.reason.message : String(attempt.reason))
        .join(" | ");
      throw new Error(`Nenhuma fonte oficial respondeu. ${diagnostics}`.trim());
    }
    return unifyUsaRankingResults(collections, input);
  }
}
