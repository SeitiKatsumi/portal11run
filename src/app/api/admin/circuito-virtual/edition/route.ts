import { NextResponse } from "next/server";
import { getCircuitEdition, updateCircuitEdition } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, edition: getCircuitEdition() });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Parameters<typeof updateCircuitEdition>[0];
    const edition = updateCircuitEdition({ ...body, actor: `admin:${process.env.ADMIN_USER || "admin"}` });
    return NextResponse.json({ ok: true, edition });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao salvar edição." }, { status: 400 });
  }
}
