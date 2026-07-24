import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getSupportPrivateFile } from "@/lib/support-hub";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = getSupportPrivateFile(id);
  if (!file) return NextResponse.json({ ok: false, error: "Arquivo não encontrado." }, { status: 404 });
  try {
    return new Response(await readFile(file.absolutePath), {
      headers: {
        "Content-Type": file.mime_type,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
        "Cache-Control": "private, no-store"
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Arquivo indisponível." }, { status: 404 });
  }
}
