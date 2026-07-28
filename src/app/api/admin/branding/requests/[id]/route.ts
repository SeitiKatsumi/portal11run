import { NextResponse } from "next/server";
import { brandingStatuses, updateBrandingRequest } from "@/lib/branding";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json() as { status?: string; adminNotes?: string; handledBy?: string };
    if (!brandingStatuses.includes(body.status as (typeof brandingStatuses)[number])) {
      return NextResponse.json({ ok: false, error: "Status inválido." }, { status: 400 });
    }
    updateBrandingRequest(id, {
      status: body.status as (typeof brandingStatuses)[number],
      adminNotes: String(body.adminNotes || "").trim().slice(0, 2000),
      handledBy: String(body.handledBy || "").trim().slice(0, 120)
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erro ao atualizar." }, { status: 400 });
  }
}
