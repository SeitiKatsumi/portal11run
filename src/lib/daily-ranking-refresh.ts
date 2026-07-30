import {
  norwayAgeKeys,
  usaAgeKeys,
  type InternationalAgeKey,
  type InternationalCountry,
  type InternationalEvent
} from "@/lib/international-ranking-core";
import {
  internationalCategoryConfig,
  queueInternationalRankingRefresh,
  sourceKeyForCountry
} from "@/lib/international-rankings";
import { queueAllJapanRankings } from "@/lib/japan-rankings";
import { refreshAllBrazilRankings } from "@/lib/brazil-rankings";
import { refreshAllWorldAthleticsRankings } from "@/lib/world-athletics-rankings";

type InternationalRefresh = {
  country: Extract<InternationalCountry, "NO" | "US">;
  ageKey: InternationalAgeKey;
  event: InternationalEvent;
  gender: "M" | "F";
};

function internationalRefreshes() {
  const refreshes: InternationalRefresh[] = [];
  for (const gender of ["M", "F"] as const) {
    for (const ageKey of norwayAgeKeys) {
      for (const event of [800, 1500, 3000, 5000] as const) {
        refreshes.push({ country: "NO", ageKey, event, gender });
      }
    }
    for (const ageKey of usaAgeKeys) {
      for (const event of [800, 1500, 3000] as const) {
        const candidate = { country: "US" as const, ageKey, event, gender };
        if (internationalCategoryConfig(candidate).available) refreshes.push(candidate);
      }
    }
  }
  return refreshes;
}

export function startDailyRankingRefresh() {
  const japanJob = queueAllJapanRankings(2026, "daily-cron");
  const refreshes = internationalRefreshes();

  refreshes.forEach((refresh, index) => {
    setTimeout(() => {
      try {
        queueInternationalRankingRefresh({
          ...refresh,
          sourceKey: sourceKeyForCountry(refresh.country),
          season: 2026
        }, "daily-cron");
      } catch {
        // A falha individual fica registrada pela própria fila sem interromper os demais países.
      }
    }, index * 2_000);
  });

  setTimeout(() => {
    void refreshAllBrazilRankings().catch(() => undefined);
  }, 0);
  setTimeout(() => {
    void refreshAllWorldAthleticsRankings().catch(() => undefined);
  }, 5_000);

  return {
    japanJobId: japanJob?.id,
    brazilCombinations: 20,
    worldAthleticsCombinations: 62,
    internationalCombinations: refreshes.length,
    totalPlanned: 82 + refreshes.length + Number(japanJob?.total ?? 0)
  };
}
