import { NextResponse } from "next/server";
import { editableLeadFields, listLeads, updateLead, updateLeadProfile, type EditableLeadField } from "@/lib/leads";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, leads: listLeads() });
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      pipeline_status?: string;
      receipts?: Record<string, boolean>;
      profile?: Record<string, unknown>;
    };

    if (!body.id) {
      return NextResponse.json({ ok: false, error: "ID do cadastro ausente." }, { status: 400 });
    }

    const profile = body.profile
      ? Object.fromEntries(
          Object.entries(body.profile)
            .filter(([key]) => editableLeadFields.includes(key as EditableLeadField))
            .map(([key, value]) => [key, String(value ?? "")])
        ) as Partial<Record<EditableLeadField, string>>
      : null;

    const lead = profile
      ? updateLeadProfile(body.id, profile)
      : updateLead(body.id, {
          pipeline_status: body.pipeline_status,
          receipts: body.receipts
        });

    if (!lead) {
      return NextResponse.json({ ok: false, error: "Cadastro não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, lead });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível atualizar o cadastro." }, { status: 500 });
  }
}
