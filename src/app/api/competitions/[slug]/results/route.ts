import { NextResponse } from "next/server";
import { publicCompetitionResults } from "@/lib/competitions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    return NextResponse.json({ ok: true, ...publicCompetitionResults(slug), updatedAt: new Date().toISOString() }, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Competição não encontrada." }, { status: 404 });
  }
}

