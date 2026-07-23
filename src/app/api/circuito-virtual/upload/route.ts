import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { assertRateLimit } from "@/lib/request-guard";
import { registerPrivateFile } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

const allowed = new Map([
  ["application/pdf", [0x25, 0x50, 0x44, 0x46]],
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/png", [0x89, 0x50, 0x4e, 0x47]]
]);

function privateRoot() {
  return path.resolve(process.cwd(), process.env.VIRTUAL_CIRCUIT_PRIVATE_UPLOAD_DIR ?? "data/virtual-circuit-private");
}

export async function POST(request: Request) {
  try {
    assertRateLimit(request, "circuit-upload", 12, 10 * 60_000);
    const form = await request.formData();
    if (String(form.get("website") ?? "")) return NextResponse.json({ ok: true });
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Selecione um arquivo." }, { status: 400 });
    if (file.size <= 0 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "O arquivo deve ter até 10 MB." }, { status: 400 });
    }
    const signature = allowed.get(file.type);
    if (!signature) return NextResponse.json({ ok: false, error: "Envie PDF, JPG, JPEG ou PNG." }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!signature.every((byte, index) => bytes[index] === byte)) {
      return NextResponse.json({ ok: false, error: "O conteúdo do arquivo não corresponde à extensão." }, { status: 400 });
    }
    const extension = file.type === "application/pdf" ? "pdf" : file.type === "image/png" ? "png" : "jpg";
    const storageName = `${randomUUID()}.${extension}`;
    await mkdir(privateRoot(), { recursive: true });
    await writeFile(path.join(privateRoot(), storageName), bytes, { flag: "wx", mode: 0o600 });
    const fileId = registerPrivateFile({
      storageName,
      originalName: file.name.slice(0, 180),
      mimeType: file.type,
      sizeBytes: file.size,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      purpose: "ATHLETE_DOCUMENT"
    });
    return NextResponse.json({ ok: true, fileId, fileName: file.name });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Falha no upload." }, { status: 400 });
  }
}
