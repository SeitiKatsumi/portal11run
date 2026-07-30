import { NextRequest, NextResponse } from "next/server";
import { getCurrentJapanSeason, queueAllJapanRankings } from "@/lib/japan-rankings";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const season = Number(body.season ?? getCurrentJapanSeason());
  if (!Number.isInteger(season)) return NextResponse.json({ error: "Temporada inválida." }, { status: 400 });
  const job = queueAllJapanRankings(season, "admin");
  return NextResponse.json({ jobId: job?.id, status: job?.status, total: job?.total }, { status: 202 });
}
