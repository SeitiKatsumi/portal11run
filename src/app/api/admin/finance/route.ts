import { NextResponse } from "next/server";
import { createFinancialRecord, deleteFinancialRecord, listFinancialRecords, updateFinancialRecord } from "@/lib/finance";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, records: listFinancialRecords() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      lead_id?: string;
      direction?: "entrada" | "saida";
      type?: string;
      description?: string;
      amount?: string;
      sponsor_name?: string;
      due_date?: string;
      paid_date?: string;
      status?: string;
      transparency_notes?: string;
    };

    if (!body.lead_id || !body.direction || !body.type || !body.description || !body.amount) {
      return NextResponse.json({ ok: false, error: "Cadastro, direção, tipo, descrição e valor são obrigatórios." }, { status: 400 });
    }

    const record = createFinancialRecord({
      lead_id: body.lead_id,
      direction: body.direction,
      type: body.type,
      description: body.description,
      amount: body.amount,
      sponsor_name: body.sponsor_name,
      due_date: body.due_date,
      paid_date: body.paid_date,
      status: body.status,
      transparency_notes: body.transparency_notes
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erro ao salvar lançamento." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      id?: string;
      lead_id?: string;
      direction?: "entrada" | "saida";
      type?: string;
      description?: string;
      amount?: string;
      sponsor_name?: string;
      due_date?: string;
      paid_date?: string;
      status?: string;
      transparency_notes?: string;
    };

    if (!body.id || !body.lead_id || !body.direction || !body.type || !body.description || !body.amount) {
      return NextResponse.json(
        { ok: false, error: "ID, cadastro, direção, tipo, descrição e valor são obrigatórios." },
        { status: 400 }
      );
    }

    const record = updateFinancialRecord(body.id, {
      lead_id: body.lead_id,
      direction: body.direction,
      type: body.type,
      description: body.description,
      amount: body.amount,
      sponsor_name: body.sponsor_name,
      due_date: body.due_date,
      paid_date: body.paid_date,
      status: body.status,
      transparency_notes: body.transparency_notes
    });

    return NextResponse.json({ ok: true, record });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao atualizar lançamento." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "ID ausente." }, { status: 400 });
  deleteFinancialRecord(id);
  return NextResponse.json({ ok: true });
}
