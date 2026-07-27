import { NextResponse } from "next/server";
import { updateCircuitAdminOfficialResult } from "@/lib/virtual-circuit";
import { clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
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
      actor: `admin:${process.env.ADMIN_USER || "admin"}`,
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
