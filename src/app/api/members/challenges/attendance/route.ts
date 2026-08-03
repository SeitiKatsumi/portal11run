import { NextResponse } from "next/server";
import { submitAttendanceChallenge } from "@/lib/member-challenges";
import { getMemberBySessionToken } from "@/lib/members";
import { assertRateLimit, clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "member-attendance-challenge", 6, 60 * 60_000);
    const token = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("member_session="))?.slice("member_session=".length);
    const account = getMemberBySessionToken(token);
    if (!account) return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
    const body = await request.json();
    const submissionId = submitAttendanceChallenge(account.id, {
      month: Number(body.month),
      year: Number(body.year),
      fileId: String(body.fileId ?? ""),
      attendance: Number(body.attendance),
      observation: body.observation,
      truthAccepted: body.truthAccepted === true
    }, clientIp(request));
    return NextResponse.json({ ok: true, submissionId });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao enviar assiduidade." }, { status: 400 });
  }
}
