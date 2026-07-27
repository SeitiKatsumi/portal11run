import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getMemberBySessionToken, updateMemberMedicalCertificate } from "@/lib/members";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["application/pdf", "pdf"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"]
]);

function privateRoot() {
  return path.resolve(process.cwd(), process.env.PRIVATE_UPLOAD_DIR ?? "data/private/member-medical");
}

export async function POST(request: Request) {
  try {
    const token = request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("member_session="))
      ?.slice("member_session=".length);
    const account = getMemberBySessionToken(token);
    if (!account) return NextResponse.json({ ok: false, error: "Sessão expirada." }, { status: 401 });

    const form = await request.formData();
    const certificate = form.get("certificate");
    if (!(certificate instanceof File)) throw new Error("Selecione o atestado.");
    const extension = allowedTypes.get(certificate.type);
    if (!extension) throw new Error("Envie um arquivo PDF, JPG ou PNG.");
    if (certificate.size > 10 * 1024 * 1024) throw new Error("O atestado deve ter no máximo 10 MB.");

    await mkdir(privateRoot(), { recursive: true });
    const fileId = `${account.id}-${randomUUID()}.${extension}`;
    await writeFile(path.join(privateRoot(), fileId), Buffer.from(await certificate.arrayBuffer()), {
      flag: "wx",
      mode: 0o600
    });
    updateMemberMedicalCertificate(account.id, fileId, certificate.name);
    return NextResponse.json({ ok: true, fileName: certificate.name });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível enviar o atestado." },
      { status: 400 }
    );
  }
}
