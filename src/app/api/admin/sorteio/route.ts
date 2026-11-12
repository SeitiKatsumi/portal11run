import { NextResponse } from "next/server";
import { createRafflePrize, deleteRafflePrize, getRaffleStats, listRafflePrizes } from "@/lib/raffle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function state() {
  return { prizes: listRafflePrizes(), stats: getRaffleStats() };
}

export async function GET() {
  return NextResponse.json(state(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null) as { name?: unknown; description?: unknown } | null;
    createRafflePrize({ name: body?.name, description: body?.description });
    return NextResponse.json({ ok: true, ...state() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível cadastrar o prêmio." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();
    if (!id) throw new Error("Prêmio não informado.");
    deleteRafflePrize(id);
    return NextResponse.json({ ok: true, ...state() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível remover o prêmio." }, { status: 400 });
  }
}
