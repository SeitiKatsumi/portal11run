import { NextResponse } from "next/server";
import { editableLeadFields, updateLeadProfile, type EditableLeadField } from "@/lib/leads";
import { getMemberBySessionToken } from "@/lib/members";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("member_session="))
      ?.slice("member_session=".length);
    const account = getMemberBySessionToken(token);

    if (!account) {
      return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const allowed = new Set<string>(editableLeadFields);
    const updates: Partial<Record<EditableLeadField, string>> = {};

    for (const [key, value] of Object.entries(body)) {
      if (allowed.has(key)) {
        updates[key as EditableLeadField] = String(value ?? "");
      }
    }

    const lead = updateLeadProfile(account.lead_id, updates);
    if (!lead) {
      return NextResponse.json({ ok: false, error: "Cadastro não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível atualizar o cadastro." },
      { status: 400 }
    );
  }
}
