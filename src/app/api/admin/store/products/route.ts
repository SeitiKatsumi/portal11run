import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "node:crypto";
import path from "path";
import { NextResponse } from "next/server";
import {
  createProduct,
  deactivateProduct,
  listProducts,
  storeSizes,
  updateProduct,
  type StoreSize
} from "@/lib/store";

export const runtime = "nodejs";

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
}

async function persistImage(file?: File) {
  if (!file || file.size === 0) return undefined;
  if (!file.type.startsWith("image/")) throw new Error("A foto do produto precisa ser uma imagem.");
  if (file.size > 8 * 1024 * 1024) throw new Error("A imagem deve ter no máximo 8 MB.");
  const extension = path.extname(file.name).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".jpg";
  const fileName = `${randomUUID()}${extension}`;
  const root = uploadRoot();
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, fileName), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${fileName}`;
}

function priceToCents(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  return Math.round(Number(normalized) * 100);
}

async function parseProduct(request: Request) {
  const form = await request.formData();
  const image = form.get("image");
  const inventory = Object.fromEntries(
    storeSizes.map((size) => [size, Number(form.get(`stock_${size}`) ?? 0)])
  ) as Record<StoreSize, number>;
  return {
    id: String(form.get("id") ?? ""),
    image: image instanceof File ? image : undefined,
    input: {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      price_cents: priceToCents(form.get("price")),
      active: form.get("active") !== null,
      inventory
    }
  };
}

export async function GET() {
  return NextResponse.json({ ok: true, products: listProducts({ activeOnly: false }), sizes: storeSizes });
}

export async function POST(request: Request) {
  try {
    const { image, input } = await parseProduct(request);
    const imageUrl = await persistImage(image);
    const product = createProduct({ ...input, image_url: imageUrl });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao salvar produto." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, image, input } = await parseProduct(request);
    if (!id) throw new Error("ID do produto ausente.");
    const imageUrl = await persistImage(image);
    const product = updateProduct(id, { ...input, ...(imageUrl ? { image_url: imageUrl } : {}) });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Erro ao atualizar produto." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "ID ausente." }, { status: 400 });
  deactivateProduct(id);
  return NextResponse.json({ ok: true });
}
