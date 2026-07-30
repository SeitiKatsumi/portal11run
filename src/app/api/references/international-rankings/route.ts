import { NextRequest, NextResponse } from "next/server";
import {
  isInternationalAgeKey,
  isInternationalCountry,
  isInternationalEvent,
  isInternationalGender,
  type InternationalAgeKey,
  type InternationalCountry,
  type InternationalEvent,
  type InternationalGender
} from "@/lib/international-ranking-core";
import {
  listInternationalRankings,
  queueInternationalRankingIfDue,
  sourceKeyForCountry
} from "@/lib/international-rankings";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const countryValue = (params.get("country") ?? "NO").toUpperCase();
  if (!isInternationalCountry(countryValue)) {
    return NextResponse.json({ error: "País inválido." }, { status: 400 });
  }
  const country = countryValue as InternationalCountry;
  const genderValue = (params.get("gender") ?? "M").toUpperCase();
  const ageValue = params.get("age") ?? (country === "NO" ? "13" : "8-under");
  const eventValue = Number(params.get("event") ?? 800);
  const season = Number(params.get("season") ?? 2026);
  if (
    !Number.isInteger(season)
    || !isInternationalGender(genderValue)
    || !isInternationalAgeKey(country, ageValue)
    || !isInternationalEvent(eventValue)
  ) {
    return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });
  }
  const coreQuery = {
    country,
    sourceKey: sourceKeyForCountry(country),
    season,
    gender: genderValue as InternationalGender,
    ageKey: ageValue as InternationalAgeKey,
    event: eventValue as InternationalEvent
  };
  const data = listInternationalRankings({
    ...coreQuery,
    limit: Number(params.get("limit") ?? 100),
    search: params.get("search")?.trim() || undefined,
    team: params.get("team")?.trim() || undefined,
    region: params.get("region")?.trim() || undefined
  });
  if (data.config.available) setTimeout(() => queueInternationalRankingIfDue(coreQuery), 0);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=45, stale-while-revalidate=180" }
  });
}
