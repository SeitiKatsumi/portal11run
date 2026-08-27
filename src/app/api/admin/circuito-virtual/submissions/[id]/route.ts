import { NextResponse } from "next/server";
import {
  deleteCircuitAdminSubmission,
  getCircuitAdminSubmission,
  setCircuitAdminSubmissionVisibility,
  updateCircuitAdminSubmissionDetails,
  updateCircuitSubmissionStatus
} from "@/lib/virtual-circuit";
import { clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = getCircuitAdminSubmission(id);
  if (!submission) return NextResponse.json({ ok: false, error: "Inscrição não encontrada." }, { status: 404 });
  return NextResponse.json({ ok: true, submission });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const actor = `admin:${process.env.ADMIN_USER || "admin"}`;
    if (body.action === "hide" || body.action === "restore") {
      const result = setCircuitAdminSubmissionVisibility({ id, visible: body.action === "restore", actor, ip: clientIp(request) });
      return NextResponse.json({ ok: true, submission: result });
    }
    if (body.action === "edit") {
      const result = updateCircuitAdminSubmissionDetails({
        id,
        publicName: String(body.publicName ?? ""),
        categoryAge: Number(body.categoryAge),
        gender: String(body.gender ?? "") as "MALE" | "FEMALE",
        activityDate: String(body.activityDate ?? ""),
        time: String(body.time ?? ""),
        city: String(body.city ?? ""),
        state: String(body.state ?? ""),
        submissionType: String(body.submissionType ?? "") as "OFFICIAL_COMPETITION" | "TRACK_400M" | "OPEN_COURSE",
        actor,
        ip: clientIp(request)
      });
      return NextResponse.json({ ok: true, submission: result });
    }
    const result = updateCircuitSubmissionStatus({
      id,
      status: String(body.status ?? ""),
      reason: String(body.reason ?? ""),
      verifiedTime: body.verifiedTime ? String(body.verifiedTime) : undefined,
      actor,
      ip: clientIp(request)
    });
    return NextResponse.json({ ok: true, submission: result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao atualizar." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    deleteCircuitAdminSubmission({ id, actor: `admin:${process.env.ADMIN_USER || "admin"}`, ip: clientIp(request) });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao excluir." }, { status: 400 });
  }
}
