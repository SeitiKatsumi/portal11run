import { NextRequest, NextResponse } from "next/server";
import { isJapanAge, isJapanEvent, isJapanGender, type JapanAge, type JapanEvent } from "@/lib/japan-ranking-core";
import { queueJapanRankingRefresh } from "@/lib/japan-rankings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Number.isInteger(Number(body.season)) || !isJapanGender(body.gender) || !isJapanAge(body.age) || !isJapanEvent(body.event)) {
      return NextResponse.json({ error: "Parâmetros de atualização inválidos." }, { status: 400 });
    }
    const result = queueJapanRankingRefresh({
      season: Number(body.season),
      gender: body.gender,
      age: Number(body.age) as JapanAge,
      event: Number(body.event) as JapanEvent
    }, request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "public");
    return NextResponse.json({
      jobId: result.job?.id,
      status: result.job?.status,
      recent: result.recent,
      message: result.recent ? "Este ranking já foi verificado recentemente." : result.job?.message
    }, { status: result.recent ? 200 : 202 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível iniciar a atualização." }, { status: 400 });
  }
}
