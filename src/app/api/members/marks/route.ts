import { NextRequest, NextResponse } from "next/server";
import { createMemberMark, getMemberBySessionToken, updateMemberMark } from "@/lib/members";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const account = getMemberBySessionToken(request.cookies.get("member_session")?.value);
    if (!account) {
      return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
    }

    const body = (await request.json()) as {
      event?: string;
      time?: string;
      date?: string;
      location?: string;
    };

    const mark = createMemberMark(account.id, {
      event: body.event ?? "",
      time: body.time ?? "",
      date: body.date ?? "",
      location: body.location ?? ""
    });

    return NextResponse.json({ ok: true, mark });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erro ao salvar marca." }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const account = getMemberBySessionToken(request.cookies.get("member_session")?.value);
    if (!account) {
      return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
    }

    const body = (await request.json()) as {
      id?: string;
      event?: string;
      time?: string;
      date?: string;
      location?: string;
    };
    if (!body.id) return NextResponse.json({ ok: false, error: "Atividade não encontrada." }, { status: 400 });

    const mark = updateMemberMark(account.id, body.id, {
      event: body.event ?? "",
      time: body.time ?? "",
      date: body.date ?? "",
      location: body.location ?? ""
    });
    return NextResponse.json({ ok: true, mark });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erro ao atualizar atividade." }, { status: 400 });
  }
}
