import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getLeadById } from "@/lib/leads";

export const runtime = "nodejs";

type RouteProps = {
  params: Promise<{ id: string }>;
};

type ZipEntry = {
  name: string;
  bytes: Buffer<ArrayBufferLike>;
  crc: number;
  offset: number;
};

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function uploadRoot() {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? process.env.UPLOAD_PATH ?? "data/uploads");
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function crc32(bytes: Buffer) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeLocalHeader(entry: ZipEntry) {
  const name = Buffer.from(entry.name);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt32LE(entry.crc, 14);
  header.writeUInt32LE(entry.bytes.length, 18);
  header.writeUInt32LE(entry.bytes.length, 22);
  header.writeUInt16LE(name.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, name, entry.bytes]);
}

function writeCentralHeader(entry: ZipEntry) {
  const name = Buffer.from(entry.name);
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(0, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(entry.bytes.length, 20);
  header.writeUInt32LE(entry.bytes.length, 24);
  header.writeUInt16LE(name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.offset, 42);
  return Buffer.concat([header, name]);
}

function writeEndOfCentralDirectory(entryCount: number, centralSize: number, centralOffset: number) {
  const footer = Buffer.alloc(22);
  footer.writeUInt32LE(0x06054b50, 0);
  footer.writeUInt16LE(0, 4);
  footer.writeUInt16LE(0, 6);
  footer.writeUInt16LE(entryCount, 8);
  footer.writeUInt16LE(entryCount, 10);
  footer.writeUInt32LE(centralSize, 12);
  footer.writeUInt32LE(centralOffset, 16);
  footer.writeUInt16LE(0, 20);
  return footer;
}

function buildZip(files: Array<{ name: string; bytes: Buffer<ArrayBufferLike> }>) {
  let offset = 0;
  const entries = files.map((file) => {
    const entry: ZipEntry = {
      name: file.name,
      bytes: file.bytes,
      crc: crc32(file.bytes),
      offset
    };
    offset += 30 + Buffer.byteLength(entry.name) + entry.bytes.length;
    return entry;
  });

  const localParts = entries.map(writeLocalHeader);
  const centralOffset = localParts.reduce((sum, part) => sum + part.length, 0);
  const centralParts = entries.map(writeCentralHeader);
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  return Buffer.concat([...localParts, ...centralParts, writeEndOfCentralDirectory(entries.length, centralSize, centralOffset)]);
}

function safeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;
  const lead = getLeadById(id);
  if (!lead) {
    return NextResponse.json({ ok: false, error: "Cadastro não encontrado." }, { status: 404 });
  }

  const photos = parseJson<string[]>(lead.photos_json, []);
  if (photos.length === 0) {
    return NextResponse.json({ ok: false, error: "Cadastro sem fotos anexadas." }, { status: 404 });
  }

  const rawFiles: Array<{ name: string; bytes: Buffer<ArrayBufferLike> } | null> = await Promise.all(
      photos.map(async (photo, index) => {
        const fileName = path.basename(photo);
        const extension = path.extname(fileName) || ".jpg";
        try {
          return {
            name: `${String(index + 1).padStart(2, "0")}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "") || `foto${extension}`}`,
            bytes: Buffer.from(await readFile(path.join(uploadRoot(), fileName)))
          };
        } catch {
          return null;
        }
      })
    );
  const files = rawFiles.filter((file): file is { name: string; bytes: Buffer<ArrayBufferLike> } => file !== null);

  if (files.length === 0) {
    return NextResponse.json({ ok: false, error: "Fotos não encontradas no armazenamento." }, { status: 404 });
  }

  const zip = buildZip(files);
  const baseName = safeName(lead.athlete_name || lead.name || "cadastro");
  return new NextResponse(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"fotos-${baseName}.zip\"`,
      "Cache-Control": "private, no-store"
    }
  });
}
