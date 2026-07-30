import { NextRequest, NextResponse } from "next/server";
import { queueAutomaticJapanRankingsIfDue } from "@/lib/japan-rankings";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const job = queueAutomaticJapanRankingsIfDue();
  return NextResponse.json(job ? { queued: true, jobId: job.id } : { queued: false, message: "Rotina diária já verificada." });
}
