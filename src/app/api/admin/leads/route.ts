import { NextResponse } from "next/server";
import { listLeads, updateLead } from "@/lib/leads";

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
    };

    if (!body.id) {
      return NextResponse.json({ ok: false, error: "ID do cadastro ausente." }, { status: 400 });
    }

    const lead = updateLead(body.id, {
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
