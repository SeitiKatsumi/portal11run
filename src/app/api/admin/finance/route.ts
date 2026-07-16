import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { createFinancialRecord, deleteFinancialRecord, listFinancialRecords, updateFinancialRecord } from "@/lib/finance";
import { getSponsorById } from "@/lib/sponsors";

export const runtime = "nodejs";

type FinancePayload = {
  id?: string;
  lead_id?: string;
  lead_ids?: string[];
  direction?: "entrada" | "saida";
  type?: string;
  description?: string;
  amount?: string;
  sponsor_id?: string;
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

function valuesToStrings(values: FormDataEntryValue[]) {
  return values.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
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
      lead_ids: valuesToStrings(formData.getAll("lead_ids")),
      direction: valueToString(formData.get("direction")) as FinancePayload["direction"],
      type: valueToString(formData.get("type")),
      description: valueToString(formData.get("description")),
      amount: valueToString(formData.get("amount")),
      sponsor_id: valueToString(formData.get("sponsor_id")),
      sponsor_name: valueToString(formData.get("sponsor_name")),
      due_date: valueToString(formData.get("due_date")),
      paid_date: valueToString(formData.get("paid_date")),
      status: valueToString(formData.get("status")),
      transparency_notes: valueToString(formData.get("transparency_notes"))
    },
    image: image instanceof File ? image : undefined
  };
}

function sponsorFields(body: FinancePayload) {
  const sponsor = getSponsorById(body.sponsor_id);
  return {
    sponsor_id: sponsor?.id ?? body.sponsor_id,
    sponsor_name: sponsor?.name ?? body.sponsor_name
  };
}

export async function GET() {
  return NextResponse.json({ ok: true, records: listFinancialRecords() });
}

export async function POST(request: Request) {
  try {
    const { body, image } = await parseFinancePayload(request);
    const leadIds = Array.from(new Set(body.lead_ids?.length ? body.lead_ids : body.lead_id ? [body.lead_id] : []));

    if (leadIds.length === 0 || !body.direction || !body.type || !body.description || !body.amount) {
      return NextResponse.json(
        { ok: false, error: "Selecione ao menos um atleta. Direção, tipo, descrição e valor são obrigatórios." },
        { status: 400 }
      );
    }

    const imageUrl = await persistFinanceImage(image);
    const sponsor = sponsorFields(body);
    const records = leadIds.map((leadId) =>
      createFinancialRecord({
        lead_id: leadId,
        direction: body.direction!,
        type: body.type!,
        description: body.description!,
        amount: body.amount!,
        sponsor_id: sponsor.sponsor_id,
        sponsor_name: sponsor.sponsor_name,
        due_date: body.due_date,
        paid_date: body.paid_date,
        image_url: imageUrl,
        status: body.status,
        transparency_notes: body.transparency_notes
      })
    );

    return NextResponse.json({ ok: true, record: records[0], records });
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
    const sponsor = sponsorFields(body);
    const record = updateFinancialRecord(body.id, {
      lead_id: body.lead_id,
      direction: body.direction,
      type: body.type,
      description: body.description,
      amount: body.amount,
      sponsor_id: sponsor.sponsor_id,
      sponsor_name: sponsor.sponsor_name,
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
