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
  queueInternationalRankingRefresh,
  sourceKeyForCountry
} from "@/lib/international-rankings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isInternationalCountry(body.country)) {
      return NextResponse.json({ error: "País inválido." }, { status: 400 });
    }
    const country = String(body.country).toUpperCase() as InternationalCountry;
    if (
      !Number.isInteger(Number(body.season))
      || !isInternationalGender(body.gender)
      || !isInternationalAgeKey(country, body.age)
      || !isInternationalEvent(body.event)
    ) {
      return NextResponse.json({ error: "Parâmetros de atualização inválidos." }, { status: 400 });
    }
    const result = queueInternationalRankingRefresh({
      country,
      sourceKey: sourceKeyForCountry(country),
      season: Number(body.season),
      gender: String(body.gender).toUpperCase() as InternationalGender,
      ageKey: String(body.age) as InternationalAgeKey,
      event: Number(body.event) as InternationalEvent
    }, request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "public");
    return NextResponse.json({
      jobId: result.job?.id,
      status: result.job?.status,
      recent: result.recent,
      message: result.recent ? "Este ranking já foi verificado recentemente." : result.job?.message
    }, { status: result.recent ? 200 : 202 });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Não foi possível iniciar a atualização."
    }, { status: 400 });
  }
}
