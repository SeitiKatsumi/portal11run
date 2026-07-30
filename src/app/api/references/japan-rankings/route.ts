import { NextRequest, NextResponse } from "next/server";
import {
  isJapanAge,
  isJapanEvent,
  isJapanGender,
  type JapanAge,
  type JapanEvent,
  type JapanGender
} from "@/lib/japan-ranking-core";
import { getCurrentJapanSeason, listJapanRankings, queueAutomaticJapanRankingsIfDue } from "@/lib/japan-rankings";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const season = Number(params.get("season") ?? getCurrentJapanSeason());
  const genderValue = (params.get("gender") ?? "M").toUpperCase();
  const ageValue = Number(params.get("age") ?? 12);
  const eventValue = Number(params.get("event") ?? 800);
  if (!Number.isInteger(season) || !isJapanGender(genderValue) || !isJapanAge(ageValue) || !isJapanEvent(eventValue)) {
    return NextResponse.json({ error: "Filtros inválidos." }, { status: 400 });
  }

  const data = listJapanRankings({
    season,
    gender: genderValue as JapanGender,
    age: ageValue as JapanAge,
    event: eventValue as JapanEvent,
    limit: Number(params.get("limit") ?? 100),
    search: params.get("search")?.trim() || undefined,
    team: params.get("team")?.trim() || undefined,
    prefecture: params.get("prefecture")?.trim() || undefined
  });
  setTimeout(() => queueAutomaticJapanRankingsIfDue(), 0);
  return NextResponse.json(data, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
