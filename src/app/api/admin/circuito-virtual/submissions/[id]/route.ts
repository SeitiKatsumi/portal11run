import { NextResponse } from "next/server";
import { getCircuitAdminSubmission, updateCircuitSubmissionStatus } from "@/lib/virtual-circuit";
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
    const body = (await request.json()) as { status?: string; reason?: string; verifiedTime?: string };
    const result = updateCircuitSubmissionStatus({
      id,
      status: String(body.status ?? ""),
      reason: String(body.reason ?? ""),
      verifiedTime: body.verifiedTime,
      actor: `admin:${process.env.ADMIN_USER || "admin"}`,
      ip: clientIp(request)
    });
    return NextResponse.json({ ok: true, submission: result });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao atualizar." }, { status: 400 });
  }
}
