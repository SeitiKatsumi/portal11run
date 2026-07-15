import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { createFinancialRecord, deleteFinancialRecord, listFinancialRecords, updateFinancialRecord } from "@/lib/finance";

export const runtime = "nodejs";

type FinancePayload = {
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

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
}

function safeFileName(name: string) {
  const extension = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".jpg";
  return `${crypto.randomUUID()}${extension}`;
}

function valueToString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : undefined;
}

async function persistFinanceImage(file?: File) {
  if (!file || file.size === 0) return undefined;
  if (!file.type.startsWith("image/")) {
    throw new Error("A imagem do item precisa ser uma imagem.");
  }

  const root = uploadRoot();
  await mkdir(root, { recursive: true });
  const fileName = safeFileName(file.name);
  await writeFile(path.join(root, fileName), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${fileName}`;
}

async function parseFinancePayload(request: Request): Promise<{ body: FinancePayload; image?: File }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return { body: (await request.json()) as FinancePayload };
  }

  const formData = await request.formData();
  const image = formData.get("image");
  return {
    body: {
      id: valueToString(formData.get("id")),
      lead_id: valueToString(formData.get("lead_id")),
      direction: valueToString(formData.get("direction")) as FinancePayload["direction"],
      type: valueToString(formData.get("type")),
      description: valueToString(formData.get("description")),
      amount: valueToString(formData.get("amount")),
      sponsor_name: valueToString(formData.get("sponsor_name")),
      due_date: valueToString(formData.get("due_date")),
      paid_date: valueToString(formData.get("paid_date")),
      status: valueToString(formData.get("status")),
      transparency_notes: valueToString(formData.get("transparency_notes"))
    },
    image: image instanceof File ? image : undefined
  };
}

export async function GET() {
  return NextResponse.json({ ok: true, records: listFinancialRecords() });
}

export async function POST(request: Request) {
  try {
    const { body, image } = await parseFinancePayload(request);

    if (!body.lead_id || !body.direction || !body.type || !body.description || !body.amount) {
      return NextResponse.json({ ok: false, error: "Cadastro, direção, tipo, descrição e valor são obrigatórios." }, { status: 400 });
    }

    const imageUrl = await persistFinanceImage(image);
    const record = createFinancialRecord({
      lead_id: body.lead_id,
      direction: body.direction,
      type: body.type,
      description: body.description,
      amount: body.amount,
      sponsor_name: body.sponsor_name,
      due_date: body.due_date,
      paid_date: body.paid_date,
      image_url: imageUrl,
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
    const { body, image } = await parseFinancePayload(request);

    if (!body.id || !body.lead_id || !body.direction || !body.type || !body.description || !body.amount) {
      return NextResponse.json(
        { ok: false, error: "ID, cadastro, direção, tipo, descrição e valor são obrigatórios." },
        { status: 400 }
      );
    }

    const imageUrl = await persistFinanceImage(image);
    const record = updateFinancialRecord(body.id, {
      lead_id: body.lead_id,
      direction: body.direction,
      type: body.type,
      description: body.description,
      amount: body.amount,
      sponsor_name: body.sponsor_name,
      due_date: body.due_date,
      paid_date: body.paid_date,
      ...(imageUrl ? { image_url: imageUrl } : {}),
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
