import { NextResponse } from "next/server";
import { listSupportInterests, updateSupportInterest } from "@/lib/support";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, interests: listSupportInterests() });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { id?: string; status?: string };
    if (!body.id || !body.status) {
      return NextResponse.json({ ok: false, error: "ID e status são obrigatórios." }, { status: 400 });
    }

    const interest = updateSupportInterest(body.id, body.status);
    if (!interest) {
      return NextResponse.json({ ok: false, error: "Interesse não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, interest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o interesse.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
