import { NextResponse } from "next/server";
import {
  deleteCircuitAdminOfficialResult,
  setCircuitAdminOfficialResultVisibility,
  updateCircuitAdminOfficialResult
} from "@/lib/virtual-circuit";
import { clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const actor = `admin:${process.env.ADMIN_USER || "admin"}`;
    if (body.action === "hide" || body.action === "restore") {
      const result = setCircuitAdminOfficialResultVisibility({ id, visible: body.action === "restore", actor, ip: clientIp(request) });
      return NextResponse.json({ ok: true, result });
    }
    const result = updateCircuitAdminOfficialResult({
      id,
      publicName: String(body.publicName ?? ""),
      categoryAge: Number(body.categoryAge),
      gender: String(body.gender ?? "") as "MALE" | "FEMALE",
      activityDate: String(body.activityDate ?? ""),
      time: String(body.time ?? ""),
      city: String(body.city ?? ""),
      state: String(body.state ?? ""),
      competitionName: String(body.competitionName ?? ""),
      actor,
      ip: clientIp(request)
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Falha ao atualizar resultado oficial." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    deleteCircuitAdminOfficialResult({ id, actor: `admin:${process.env.ADMIN_USER || "admin"}`, ip: clientIp(request) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Falha ao excluir resultado oficial." },
      { status: 400 }
    );
  }
}
