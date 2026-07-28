import { createHash, randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { brandingPrivateRoot, createBrandingRequest } from "@/lib/branding";

export const runtime = "nodejs";

const MAX_FILES = 3;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const allowed = new Map([["application/pdf", ".pdf"], ["image/jpeg", ".jpg"], ["image/png", ".png"]]);
const attempts = new Map<string, number[]>();

function field(form: FormData, name: string, max: number) {
  return String(form.get(name) ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function validSignature(bytes: Uint8Array, type: string) {
  if (type === "application/pdf") return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  return false;
}

export async function POST(request: Request) {
  const saved: string[] = [];
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = createHash("sha256").update(`${process.env.BRANDING_IP_SALT || "11run-branding"}:${ip}`).digest("hex");
    const now = Date.now();
    const recent = (attempts.get(ipHash) || []).filter((time) => now - time < 3_600_000);
    if (recent.length >= 5) return NextResponse.json({ ok: false, error: "Limite de envios atingido. Tente novamente mais tarde." }, { status: 429 });
    recent.push(now);
    attempts.set(ipHash, recent);

    const form = await request.formData();
    if (field(form, "website", 100)) return NextResponse.json({ ok: true, id: "received" });
    if (field(form, "challenge", 4) !== "18") return NextResponse.json({ ok: false, error: "Validação de segurança incorreta." }, { status: 400 });
    if (field(form, "terms", 20) !== "accepted") return NextResponse.json({ ok: false, error: "É necessário aceitar os termos." }, { status: 400 });

    const requesterName = field(form, "name", 120);
    const requesterEmail = field(form, "email", 180).toLowerCase();
    const requesterPhone = field(form, "phone", 30);
    const organization = field(form, "organization", 160);
    const intendedUse = field(form, "intendedUse", 1500);
    const channels = field(form, "channels", 500);
    const notes = field(form, "notes", 1000);
    if (!requesterName || !requesterPhone || !organization || !intendedUse || !channels || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requesterEmail)) {
      return NextResponse.json({ ok: false, error: "Revise os campos obrigatórios." }, { status: 400 });
    }

    const files = form.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
    if (files.length > MAX_FILES) return NextResponse.json({ ok: false, error: `Envie no máximo ${MAX_FILES} anexos.` }, { status: 400 });
    await mkdir(brandingPrivateRoot(), { recursive: true });
    const metadata = [];
    for (const file of files) {
      const extension = allowed.get(file.type);
      if (!extension || file.size > MAX_FILE_SIZE) throw new Error("Anexo inválido. Use PDF, JPG ou PNG com até 8 MB.");
      const bytes = new Uint8Array(await file.arrayBuffer());
      if (!validSignature(bytes, file.type)) throw new Error("O conteúdo de um anexo não corresponde ao formato informado.");
      const storageName = `${randomUUID()}${extension}`;
      const target = path.join(brandingPrivateRoot(), storageName);
      await writeFile(target, bytes, { mode: 0o600 });
      saved.push(target);
      metadata.push({ original_name: path.basename(file.name).slice(0, 180), storage_name: storageName, mime_type: file.type, size_bytes: file.size, kind: "reference" });
    }
    const id = createBrandingRequest({ requesterName, requesterEmail, requesterPhone, organization, intendedUse, channels, notes, ipHash, files: metadata });
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    await Promise.all(saved.map((file) => rm(file, { force: true })));
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Não foi possível enviar a solicitação." }, { status: 400 });
  }
}
