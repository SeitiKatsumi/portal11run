import { NextResponse } from "next/server";
import { processSchoolSubmissionWithAi } from "@/lib/member-challenge-ai";
import { submitSchoolChallenge } from "@/lib/member-challenges";
import { getMemberBySessionToken } from "@/lib/members";
import { assertRateLimit, clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "member-school-challenge", 4, 60 * 60_000);
    const token = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("member_session="))?.slice("member_session=".length);
    const account = getMemberBySessionToken(token);
    if (!account) return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
    const body = await request.json();
    const submissionId = submitSchoolChallenge(account.id, {
      quarter: Number(body.quarter),
      year: Number(body.year),
      fileId: String(body.fileId ?? ""),
      observation: body.observation,
      guardianAccepted: body.guardianAccepted === true
    }, clientIp(request));
    const analysis = await processSchoolSubmissionWithAi(submissionId);
    return NextResponse.json({ ok: true, submissionId, analysis });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao enviar boletim." }, { status: 400 });
  }
}
