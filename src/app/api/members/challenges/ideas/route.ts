import { NextResponse } from "next/server";
import { submitChallengeIdea } from "@/lib/member-challenges";
import { getMemberBySessionToken } from "@/lib/members";
import { assertRateLimit, clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "member-challenge-idea", 8, 7 * 24 * 60 * 60_000);
    const token = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("member_session="))?.slice("member_session=".length);
    const account = getMemberBySessionToken(token);
    if (!account) return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
    const body = await request.json();
    const ideaId = submitChallengeIdea(account.id, {
      title: body.title,
      category: body.category,
      description: body.description,
      problem: body.problem,
      expectedImprovement: body.expectedImprovement,
      imageFileId: body.imageFileId
    }, clientIp(request));
    return NextResponse.json({ ok: true, ideaId });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha ao enviar ideia." }, { status: 400 });
  }
}
