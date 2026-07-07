import { NextResponse } from "next/server";
import { createSupportInterest } from "@/lib/support";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const interest = createSupportInterest(payload);
    return NextResponse.json({ ok: true, id: interest.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o interesse.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
