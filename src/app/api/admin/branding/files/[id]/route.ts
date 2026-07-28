import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { brandingPrivateRoot, getBrandingFile } from "@/lib/branding";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const file = getBrandingFile(id);
  if (!file) return NextResponse.json({ ok: false, error: "Arquivo não encontrado." }, { status: 404 });
  const root = path.resolve(brandingPrivateRoot());
  const target = path.resolve(root, file.storage_name);
  if (!target.startsWith(`${root}${path.sep}`)) return NextResponse.json({ ok: false, error: "Caminho inválido." }, { status: 400 });
  try {
    const body = await readFile(target);
    return new Response(new Uint8Array(body), {
      headers: {
        "Content-Type": file.mime_type,
        "Content-Length": String(file.size_bytes),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Arquivo indisponível." }, { status: 404 });
  }
}
