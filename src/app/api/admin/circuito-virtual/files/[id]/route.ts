import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getPrivateFile } from "@/lib/virtual-circuit";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = getPrivateFile(id);
  if (!file) return NextResponse.json({ ok: false, error: "Arquivo não encontrado." }, { status: 404 });
  try {
    const root = path.resolve(process.cwd(), process.env.VIRTUAL_CIRCUIT_PRIVATE_UPLOAD_DIR ?? "data/virtual-circuit-private");
    const bytes = await readFile(path.join(root, path.basename(file.storage_name)));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": file.mime_type,
        "Content-Disposition": `attachment; filename="documento-${file.id}.${file.mime_type === "application/pdf" ? "pdf" : file.mime_type === "image/png" ? "png" : "jpg"}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Arquivo indisponível." }, { status: 404 });
  }
}
