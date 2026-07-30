import { NextRequest, NextResponse } from "next/server";
import { isCronAuthorized } from "@/lib/cron-auth";
import { startDailyRankingRefresh } from "@/lib/daily-ranking-refresh";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!await isCronAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const plan = startDailyRankingRefresh();
  return NextResponse.json({
    queued: true,
    message: "Atualização diária dos rankings nacionais, juvenis e mundial iniciada.",
    ...plan
  }, { status: 202 });
}
