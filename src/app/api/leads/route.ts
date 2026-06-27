import { NextResponse } from "next/server";
import { saveLead, validateLead, type LeadPayload } from "@/lib/leads";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LeadPayload;
    const validation = validateLead(payload);

    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const lead = saveLead(payload);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível salvar o cadastro." }, { status: 500 });
  }
}
