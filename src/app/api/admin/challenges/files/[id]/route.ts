import { NextResponse } from "next/server";
import { logChallengeFileAccess, readChallengeFile } from "@/lib/member-challenges";
import { clientIp } from "@/lib/request-guard";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { file, bytes } = await readChallengeFile(id);
    logChallengeFileAccess(id, String(file.account_id), `admin:${process.env.ADMIN_USER || "admin"}`, clientIp(request));
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
