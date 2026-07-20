import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ file: string }>;
};

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
}

function contentType(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  if (extension === ".mp3") return "audio/mpeg";
  if (extension === ".m4a" || extension === ".mp4") return "audio/mp4";
  if (extension === ".ogg") return "audio/ogg";
  if (extension === ".webm") return "audio/webm";
  if (extension === ".wav") return "audio/wav";
  return "image/jpeg";
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { file } = await params;
  const fileName = path.basename(file);

  try {
    const bytes = await readFile(path.join(uploadRoot(), fileName));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": contentType(fileName),
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Arquivo não encontrado." }, { status: 404 });
  }
}
