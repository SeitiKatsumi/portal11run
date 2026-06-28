import { NextResponse } from "next/server";
import { authenticateMember, createMemberSession } from "@/lib/members";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    if (!body.username || !body.password) {
      return NextResponse.json({ ok: false, error: "Informe usuário e senha." }, { status: 400 });
    }

    const account = authenticateMember(body.username, body.password);
    if (!account) {
      return NextResponse.json({ ok: false, error: "Usuário ou senha inválidos." }, { status: 401 });
    }

    const session = createMemberSession(account.id);
    const response = NextResponse.json({ ok: true, account });
    response.cookies.set("member_session", session.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(session.expiresAt)
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível entrar." }, { status: 500 });
  }
}
