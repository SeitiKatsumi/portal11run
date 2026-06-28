import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { saveLead, validateLead, type LeadPayload } from "@/lib/leads";

export const runtime = "nodejs";

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
}

function safeFileName(name: string) {
  const extension = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".jpg";
  return `${crypto.randomUUID()}${extension}`;
}

async function parsePayload(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return { payload: (await request.json()) as LeadPayload, photos: [] as File[], paymentReceipts: [] as File[] };
  }

  const formData = await request.formData();
  const payload: LeadPayload = {};
  const photos: File[] = [];
  const paymentReceipts: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (key === "athlete_photos" && value.size > 0) {
        photos.push(value);
      }
      if (key === "payment_receipt" && value.size > 0) {
        paymentReceipts.push(value);
      }
    } else {
      payload[key] = value;
    }
  }

  payload.accepted_contact = formData.get("accepted_contact") === "on" || formData.get("accepted_contact") === "true";
  payload.accepted_terms = formData.get("accepted_terms") === "on" || formData.get("accepted_terms") === "true";

  return { payload, photos, paymentReceipts };
}

async function persistFiles(files: File[], options: { imageOnly?: boolean } = {}) {
  if (files.length === 0) {
    return [];
  }

  const root = uploadRoot();
  await mkdir(root, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (options.imageOnly && !file.type.startsWith("image/")) {
      throw new Error("As fotos precisam ser imagens.");
    }

    const fileName = safeFileName(file.name);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(root, fileName), bytes);
    urls.push(`/api/uploads/${fileName}`);
  }

  return urls;
}

export async function POST(request: Request) {
  try {
    const { payload, photos, paymentReceipts } = await parsePayload(request);
    const validation = validateLead(payload, { photoCount: photos.length, paymentReceiptCount: paymentReceipts.length });

    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const photoUrls = await persistFiles(photos, { imageOnly: true });
    const paymentReceiptUrls = await persistFiles(paymentReceipts);
    if (paymentReceiptUrls[0]) {
      payload.payment_receipt_url = paymentReceiptUrls[0];
    }
    const lead = saveLead(payload, photoUrls);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o cadastro.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
