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
    return { payload: (await request.json()) as LeadPayload, photos: [] as File[] };
  }

  const formData = await request.formData();
  const payload: LeadPayload = {};
  const photos: File[] = [];

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (key === "athlete_photos" && value.size > 0) {
        photos.push(value);
      }
    } else {
      payload[key] = value;
    }
  }

  payload.accepted_contact = formData.get("accepted_contact") === "on" || formData.get("accepted_contact") === "true";
  payload.accepted_terms = formData.get("accepted_terms") === "on" || formData.get("accepted_terms") === "true";

  return { payload, photos };
}

async function persistPhotos(files: File[]) {
  if (files.length === 0) {
    return [];
  }

  const root = uploadRoot();
  await mkdir(root, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
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
    const { payload, photos } = await parsePayload(request);
    const validation = validateLead(payload, { photoCount: photos.length });

    if (!validation.ok) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const photoUrls = await persistPhotos(photos);
    const lead = saveLead(payload, photoUrls);
    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o cadastro.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
