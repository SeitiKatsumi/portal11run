import { NextResponse } from "next/server";
import { saveChallengeFile } from "@/lib/member-challenges";
import { getMemberBySessionToken } from "@/lib/members";
import { assertRateLimit } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "member-challenge-upload", 12, 10 * 60_000);
    const token = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("member_session="))?.slice("member_session=".length);
    const account = getMemberBySessionToken(token);
    if (!account) return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
    const form = await request.formData();
    if (String(form.get("website") ?? "")) return NextResponse.json({ ok: true });
    const file = form.get("file");
    const purpose = String(form.get("purpose") ?? "");
    if (!(file instanceof File)) throw new Error("Selecione um arquivo.");
    if (!["SCHOOL_REPORT", "ATTENDANCE_PLAN", "IDEA_IMAGE"].includes(purpose)) throw new Error("Finalidade de arquivo inválida.");
    const saved = await saveChallengeFile(account.id, file, purpose as "SCHOOL_REPORT" | "ATTENDANCE_PLAN" | "IDEA_IMAGE");
    const response = NextResponse.json({ ok: true, file: saved });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha no upload." }, { status: 400 });
  }
}
