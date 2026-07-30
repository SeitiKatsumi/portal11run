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
import { listBrazilRankings } from "@/lib/brazil-rankings";
import { listWorldAthleticsRankings } from "@/lib/world-athletics-rankings";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const countryValue = (params.get("country") ?? "NO").toUpperCase();
  if (!isInternationalCountry(countryValue)) {
    return NextResponse.json({ error: "País inválido." }, { status: 400 });
  }
  const country = countryValue as InternationalCountry;
  const genderValue = (params.get("gender") ?? "M").toUpperCase();
  const ageValue = params.get("age") ?? (
    country === "BR" ? "sub16"
      : country === "NO" ? "13"
        : country === "US" ? "8-under"
          : "u18"
  );
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
  const filters = {
    limit: Number(params.get("limit") ?? 100),
    search: params.get("search")?.trim() || undefined,
    team: params.get("team")?.trim() || undefined,
    region: params.get("region")?.trim() || undefined
  };
  if (country === "BR") {
    const data = await listBrazilRankings({
      season,
      gender: genderValue as InternationalGender,
      ageKey: ageValue as "sub16" | "sub18",
      event: eventValue as InternationalEvent,
      ...filters
    });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=45, stale-while-revalidate=180" }
    });
  }
  if (country === "KE" || country === "UG" || country === "WORLD") {
    const data = await listWorldAthleticsRankings({
      scope: country,
      season,
      gender: genderValue as InternationalGender,
      ageKey: ageValue as "u18" | "u20" | "senior",
      event: eventValue as InternationalEvent,
      ...filters
    });
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=45, stale-while-revalidate=180" }
    });
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
    ...filters,
    resultSource: params.get("source")?.trim() || undefined
  });
  if (data.config.available) setTimeout(() => queueInternationalRankingIfDue(coreQuery), 0);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "public, max-age=45, stale-while-revalidate=180" }
  });
}
