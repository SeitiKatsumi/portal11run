import { NextResponse } from "next/server";
import { createCircuitAdminOfficialResult } from "@/lib/virtual-circuit";
import { clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = createCircuitAdminOfficialResult({
      publicName: String(body.publicName ?? ""),
      categoryAge: Number(body.categoryAge),
      gender: String(body.gender ?? "") as "MALE" | "FEMALE",
      activityDate: String(body.activityDate ?? ""),
      time: String(body.time ?? ""),
      city: String(body.city ?? ""),
      state: String(body.state ?? ""),
      competitionName: String(body.competitionName ?? ""),
      submissionType: String(body.submissionType ?? "") as "OFFICIAL_COMPETITION" | "TRACK_400M" | "OPEN_COURSE",
      actor: `admin:${process.env.ADMIN_USER || "admin"}`,
      ip: clientIp(request)
    });
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Falha ao adicionar atleta." },
      { status: 400 }
    );
  }
}
