import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "node:crypto";
import path from "path";
import { NextResponse } from "next/server";
import { createSponsor, deleteSponsor, listSponsors, sponsorCategories, updateSponsor } from "@/lib/sponsors";

export const runtime = "nodejs";

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
}

function safeFileName(name: string) {
  const extension = path.extname(name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".png";
  return `${randomUUID()}${extension}`;
}

function valueToString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : undefined;
}

async function persistLogo(file?: File) {
  if (!file || file.size === 0) return undefined;
  if (!file.type.startsWith("image/")) {
    throw new Error("O logo precisa ser uma imagem.");
  }

  const root = uploadRoot();
  await mkdir(root, { recursive: true });
  const fileName = safeFileName(file.name);
  await writeFile(path.join(root, fileName), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${fileName}`;
}

async function parseSponsorPayload(request: Request) {
  const formData = await request.formData();
  const logo = formData.get("logo");
  return {
    body: {
      id: valueToString(formData.get("id")),
      name: valueToString(formData.get("name")) ?? "",
      description: valueToString(formData.get("description")),
      category: valueToString(formData.get("category")),
      sort_order: valueToString(formData.get("sort_order")),
      active: formData.get("active") !== null
    },
    logo: logo instanceof File ? logo : undefined
  };
}

export async function GET() {
  return NextResponse.json({ ok: true, sponsors: listSponsors({ activeOnly: false }), categories: sponsorCategories });
}

export async function POST(request: Request) {
  try {
    const { body, logo } = await parseSponsorPayload(request);
    const logoUrl = await persistLogo(logo);
    const sponsor = createSponsor({ ...body, logo_url: logoUrl });
    return NextResponse.json({ ok: true, sponsor });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erro ao salvar patrocinador." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { body, logo } = await parseSponsorPayload(request);
    if (!body.id) {
      return NextResponse.json({ ok: false, error: "ID ausente." }, { status: 400 });
    }

    const logoUrl = await persistLogo(logo);
    const sponsor = updateSponsor(body.id, {
      ...body,
      ...(logoUrl ? { logo_url: logoUrl } : {})
    });
    return NextResponse.json({ ok: true, sponsor });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao atualizar patrocinador." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "ID ausente." }, { status: 400 });
  deleteSponsor(id);
  return NextResponse.json({ ok: true });
}
