import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import { supportInterestTypes, supportPlanOptions, supportProjects, supportStatuses } from "@/lib/support-options";
export { supportInterestTypes, supportPlanOptions, supportProjects, supportStatuses } from "@/lib/support-options";

export type SupportInterestPayload = {
  name?: string;
  whatsapp?: string;
  email?: string;
  interestPlan?: string;
  interestTypes?: string[];
  sponsoredProjects?: string[];
  message?: string;
};

export type SupportInterestRecord = {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  interest_plan: string;
  interest_types_json: string;
  sponsored_projects_json: string;
  message: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

const schemaColumns: Record<string, string> = {
  interest_plan: "TEXT NOT NULL DEFAULT ''",
  status: "TEXT NOT NULL DEFAULT 'Novo interesse'",
  updated_at: "TEXT NOT NULL DEFAULT ''"
};

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;

  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });

  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  assertColumns(database);
  return database;
}

function assertColumns(databaseInstance: DatabaseSync) {
  const existing = new Set(
    databaseInstance
      .prepare("PRAGMA table_info(support_interests)")
      .all()
      .map((column) => String((column as { name: string }).name))
  );

  for (const [column, definition] of Object.entries(schemaColumns)) {
    if (!existing.has(column)) {
      databaseInstance.exec(`ALTER TABLE support_interests ADD COLUMN ${column} ${definition}`);
    }
  }
}

function normalizeList(values: unknown, allowed: readonly string[]) {
  if (!Array.isArray(values)) return [];
  return values.map((value) => String(value).trim()).filter((value) => allowed.includes(value));
}

export function validateSupportInterest(payload: SupportInterestPayload) {
  const name = String(payload.name ?? "").trim();
  const whatsapp = String(payload.whatsapp ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const interestPlan = String(payload.interestPlan ?? "").trim();
  const interestTypes = normalizeList(payload.interestTypes, supportInterestTypes);
  const sponsoredProjects = normalizeList(payload.sponsoredProjects, supportProjects);

  if (!name || !whatsapp || !email) {
    return { ok: false, error: "Nome, WhatsApp e e-mail são obrigatórios." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  if (!supportPlanOptions.includes(interestPlan as (typeof supportPlanOptions)[number])) {
    return { ok: false, error: "Selecione um plano de interesse." };
  }

  if (interestTypes.length === 0) {
    return { ok: false, error: "Selecione pelo menos uma forma de apoio." };
  }

  if (interestTypes.includes("Quero Patrocinar o projeto") && sponsoredProjects.length === 0) {
    return { ok: false, error: "Selecione quais projetos deseja patrocinar." };
  }

  return { ok: true };
}

export function createSupportInterest(payload: SupportInterestPayload) {
  const validation = validateSupportInterest(payload);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const now = new Date().toISOString();
  const interestTypes = normalizeList(payload.interestTypes, supportInterestTypes);
  const sponsoredProjects = normalizeList(payload.sponsoredProjects, supportProjects);
  const record = {
    id: crypto.randomUUID(),
    name: String(payload.name ?? "").trim(),
    whatsapp: String(payload.whatsapp ?? "").trim(),
    email: String(payload.email ?? "").trim(),
    interest_plan: String(payload.interestPlan ?? "").trim(),
    interest_types_json: JSON.stringify(interestTypes),
    sponsored_projects_json: JSON.stringify(sponsoredProjects),
    message: String(payload.message ?? "").trim(),
    status: "Novo interesse",
    created_at: now,
    updated_at: now
  };

  getDatabase()
    .prepare(
      `INSERT INTO support_interests (
        id,
        name,
        whatsapp,
        email,
        interest_plan,
        interest_types_json,
        sponsored_projects_json,
        message,
        status,
        created_at,
        updated_at
      ) VALUES (
        $id,
        $name,
        $whatsapp,
        $email,
        $interest_plan,
        $interest_types_json,
        $sponsored_projects_json,
        $message,
        $status,
        $created_at,
        $updated_at
      )`
    )
    .run({
      $id: record.id,
      $name: record.name,
      $whatsapp: record.whatsapp,
      $email: record.email,
      $interest_plan: record.interest_plan,
      $interest_types_json: record.interest_types_json,
      $sponsored_projects_json: record.sponsored_projects_json,
      $message: record.message,
      $status: record.status,
      $created_at: record.created_at,
      $updated_at: record.updated_at
    });

  return record;
}

export function listSupportInterests() {
  return getDatabase()
    .prepare("SELECT * FROM support_interests ORDER BY datetime(created_at) DESC")
    .all() as SupportInterestRecord[];
}

export function updateSupportInterest(id: string, status: string) {
  if (!supportStatuses.includes(status as (typeof supportStatuses)[number])) {
    throw new Error("Status inválido.");
  }

  const updatedAt = new Date().toISOString();
  getDatabase()
    .prepare("UPDATE support_interests SET status = $status, updated_at = $updated_at WHERE id = $id")
    .run({ $id: id, $status: status, $updated_at: updatedAt });

  return getDatabase().prepare("SELECT * FROM support_interests WHERE id = ?").get(id) as SupportInterestRecord | undefined;
}
