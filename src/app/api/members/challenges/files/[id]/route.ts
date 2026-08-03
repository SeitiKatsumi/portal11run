import { NextResponse } from "next/server";
import { canMemberAccessChallengeFile, logChallengeFileAccess, readChallengeFile } from "@/lib/member-challenges";
import { getMemberBySessionToken } from "@/lib/members";
import { clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith("member_session="))?.slice("member_session=".length);
  const account = getMemberBySessionToken(token);
  if (!account) return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
  const { id } = await params;
  if (!canMemberAccessChallengeFile(account.id, id)) return NextResponse.json({ ok: false, error: "Arquivo não autorizado." }, { status: 403 });
  try {
    const { file, bytes } = await readChallengeFile(id);
    logChallengeFileAccess(id, account.id, `member:${account.id}`, clientIp(request));
    return new NextResponse(bytes, { headers: {
      "Content-Type": String(file.mime_type),
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(String(file.original_name))}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox"
    } });
  } catch {
    return NextResponse.json({ ok: false, error: "Arquivo indisponível." }, { status: 404 });
  }
}
