import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getMemberBySessionToken, updateMemberProfilePhoto } from "@/lib/members";

export const runtime = "nodejs";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
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
    const photo = form.get("photo");
    if (!(photo instanceof File)) throw new Error("Selecione uma foto.");
    const extension = allowedTypes.get(photo.type);
    if (!extension) throw new Error("Envie uma imagem JPG, PNG ou WebP.");
    if (photo.size > 5 * 1024 * 1024) throw new Error("A foto deve ter no máximo 5 MB.");

    await mkdir(uploadRoot(), { recursive: true });
    const fileName = `member-profile-${account.id}-${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadRoot(), fileName), Buffer.from(await photo.arrayBuffer()), { flag: "wx" });
    const photoUrl = updateMemberProfilePhoto(account.id, `/api/uploads/${fileName}`);
    return NextResponse.json({ ok: true, photoUrl });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Não foi possível atualizar a foto." },
      { status: 400 }
    );
  }
}
