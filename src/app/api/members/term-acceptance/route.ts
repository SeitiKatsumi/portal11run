import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { acceptCurrentOnzeFuturoTerm, getMemberBySessionToken } from "@/lib/members";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const account = getMemberBySessionToken((await cookies()).get("member_session")?.value);
  if (!account) return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
  try {
    const body = await request.json() as { acceptorName?: string; acceptorCpf?: string; accepted?: boolean };
    if (body.accepted !== true) return NextResponse.json({ ok: false, error: "Confirme o aceite integral do termo." }, { status: 400 });
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const acceptance = acceptCurrentOnzeFuturoTerm({
      accountId: account.id,
      acceptorName: body.acceptorName ?? "",
      acceptorCpf: body.acceptorCpf ?? "",
      ipAddress: forwardedFor || request.headers.get("x-real-ip") || "",
      userAgent: request.headers.get("user-agent") || ""
    });
    return NextResponse.json({ ok: true, acceptance });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível registrar o aceite." }, { status: 400 });
  }
}
