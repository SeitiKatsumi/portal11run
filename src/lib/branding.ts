import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  brandingStatuses,
  type BrandingFile,
  type BrandingRequest,
  type BrandingStatus
} from "@/lib/branding-shared";

export { brandingStatuses };
export type { BrandingFile, BrandingRequest, BrandingStatus };

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS branding_requests (
      id TEXT PRIMARY KEY,
      requester_name TEXT NOT NULL,
      requester_email TEXT NOT NULL,
      requester_phone TEXT NOT NULL,
      organization TEXT NOT NULL,
      intended_use TEXT NOT NULL,
      channels TEXT NOT NULL,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'RECEIVED',
      admin_notes TEXT,
      handled_by TEXT,
      handled_at TEXT,
      ip_hash TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS branding_request_files (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES branding_requests(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      storage_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      kind TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_branding_requests_status ON branding_requests(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_branding_files_request ON branding_request_files(request_id);
  `);
  database.exec("UPDATE branding_requests SET status = 'RECEIVED' WHERE status = 'PENDING';");
  return database;
}

export function createBrandingRequest(input: {
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  organization: string;
  intendedUse: string;
  channels: string;
  notes?: string;
  ipHash?: string;
  files: Array<Omit<BrandingFile, "id" | "request_id" | "created_at">>;
}) {
  const db = getDatabase();
  const id = randomUUID();
  const now = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`
      INSERT INTO branding_requests (
        id, requester_name, requester_email, requester_phone, organization,
        intended_use, channels, notes, status, ip_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RECEIVED', ?, ?, ?)
    `).run(
      id, input.requesterName, input.requesterEmail, input.requesterPhone, input.organization,
      input.intendedUse, input.channels, input.notes || null, input.ipHash || null, now, now
    );
    const insertFile = db.prepare(`
      INSERT INTO branding_request_files
        (id, request_id, original_name, storage_name, mime_type, size_bytes, kind, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const file of input.files) {
      insertFile.run(randomUUID(), id, file.original_name, file.storage_name, file.mime_type, file.size_bytes, file.kind, now);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return id;
}

export function listBrandingRequests() {
  const db = getDatabase();
  const requests = db.prepare("SELECT * FROM branding_requests ORDER BY created_at DESC").all() as BrandingRequest[];
  const filesQuery = db.prepare("SELECT * FROM branding_request_files WHERE request_id = ? ORDER BY created_at");
  return requests.map((request) => ({
    ...request,
    files: filesQuery.all(request.id) as BrandingFile[]
  }));
}

export function getBrandingFile(id: string) {
  return getDatabase().prepare("SELECT * FROM branding_request_files WHERE id = ?").get(id) as BrandingFile | undefined;
}

export function updateBrandingRequest(id: string, input: { status: BrandingStatus; adminNotes?: string; handledBy?: string }) {
  if (!brandingStatuses.includes(input.status)) throw new Error("Status inválido.");
  const now = new Date().toISOString();
  const result = getDatabase().prepare(`
    UPDATE branding_requests
    SET status = ?, admin_notes = ?, handled_by = ?, handled_at = ?, updated_at = ?
    WHERE id = ?
  `).run(input.status, input.adminNotes || null, input.handledBy || null, now, now, id);
  if (!result.changes) throw new Error("Solicitação não encontrada.");
}

export function brandingPrivateRoot() {
  return path.resolve(process.cwd(), process.env.BRANDING_PRIVATE_UPLOAD_DIR ?? "data/branding-private");
}
