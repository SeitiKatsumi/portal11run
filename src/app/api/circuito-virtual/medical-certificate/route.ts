import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { assertRateLimit, clientIp } from "@/lib/request-guard";
import { attachCircuitMedicalCertificate } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "circuit-medical-certificate", 8, 10 * 60_000);
    const token = (await cookies()).get("circuit_guardian")?.value;
    const body = (await request.json()) as { submissionId?: string; fileId?: string; healthDataConsent?: boolean };
    if (!body.submissionId || !body.fileId) throw new Error("Atestado ou inscrição não informado.");
    attachCircuitMedicalCertificate(token, body.submissionId, body.fileId, body.healthDataConsent === true, clientIp(request));
    return NextResponse.json({ ok: true, message: "Atestado recebido. A marca já pode seguir para homologação." });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível anexar o atestado." },
      { status: 400 }
    );
  }
}
