import { NextResponse } from "next/server";
import { listMemberAccounts, upsertMemberAccount, type MemberRole } from "@/lib/members";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, accounts: listMemberAccounts() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      leadId?: string;
      role?: MemberRole;
      username?: string;
      password?: string;
      active?: boolean;
    };

    if (!body.leadId || !body.role || !body.username) {
      return NextResponse.json({ ok: false, error: "Cadastro, perfil e usuário são obrigatórios." }, { status: 400 });
    }

    const account = upsertMemberAccount({
      leadId: body.leadId,
      role: body.role,
      username: body.username,
      password: body.password,
      active: body.active
    });

    return NextResponse.json({ ok: true, account });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erro ao salvar acesso." }, { status: 400 });
  }
}
