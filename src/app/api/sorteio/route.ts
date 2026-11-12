import { NextResponse } from "next/server";
import { getRaffleStats, playRaffle } from "@/lib/raffle";
import { assertRateLimit } from "@/lib/request-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ stats: getRaffleStats() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "raffle-play", 120, 10 * 60 * 1000);
    const body = await request.json().catch(() => null) as { number?: unknown } | null;
    const result = playRaffle(body?.number);
    return NextResponse.json({ ok: true, result, stats: getRaffleStats() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível realizar o sorteio." },
      { status: 400 }
    );
  }
}
