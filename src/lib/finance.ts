import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import type { LeadRecord } from "./leads";

export type FinancialDirection = "entrada" | "saida";

export type FinancialRecord = {
  id: string;
  lead_id: string;
  project_type: string | null;
  athlete_name: string | null;
  direction: FinancialDirection;
  type: string;
  description: string;
  amount_cents: number;
  sponsor_name: string | null;
  due_date: string | null;
  paid_date: string | null;
  status: string;
  transparency_notes: string | null;
  created_at: string;
  updated_at: string;
};

let database: DatabaseSync | undefined;

const financialColumns: Record<string, string> = {
  project_type: "TEXT",
  athlete_name: "TEXT",
  direction: "TEXT NOT NULL DEFAULT 'saida'",
  sponsor_name: "TEXT",
  transparency_notes: "TEXT"
};

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  assertFinancialColumns(database);
  return database;
}

function assertFinancialColumns(db: DatabaseSync) {
  const existing = new Set(
    db
      .prepare("PRAGMA table_info(financial_records)")
      .all()
      .map((column) => String((column as { name: string }).name))
  );

  for (const [column, definition] of Object.entries(financialColumns)) {
    if (!existing.has(column)) {
      db.exec(`ALTER TABLE financial_records ADD COLUMN ${column} ${definition}`);
    }
  }
}

function now() {
  return new Date().toISOString();
}

function toCents(value: string | number) {
  if (typeof value === "number") return Math.round(value * 100);
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100);
}

export function listFinancialRecords() {
  return getDatabase()
    .prepare("SELECT * FROM financial_records ORDER BY datetime(COALESCE(paid_date, due_date, created_at)) DESC")
    .all() as FinancialRecord[];
}

export function listTransparencyRecords() {
  return getDatabase()
    .prepare(
      `SELECT id, project_type, athlete_name, direction, type, description, amount_cents, sponsor_name, paid_date, status, transparency_notes, created_at, updated_at
       FROM financial_records
       ORDER BY datetime(COALESCE(paid_date, created_at)) DESC`
    )
    .all() as Omit<FinancialRecord, "lead_id" | "due_date">[];
}

export function createFinancialRecord(input: {
  lead_id: string;
  direction: FinancialDirection;
  type: string;
  description: string;
  amount: string | number;
  sponsor_name?: string;
  due_date?: string;
  paid_date?: string;
  status?: string;
  transparency_notes?: string;
}) {
  const db = getDatabase();
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(input.lead_id) as LeadRecord | undefined;
  if (!lead) throw new Error("Atleta/cadastro não encontrado.");

  const record: FinancialRecord = {
    id: randomUUID(),
    lead_id: lead.id,
    project_type: lead.project_type,
    athlete_name: lead.athlete_name || lead.name,
    direction: input.direction === "entrada" ? "entrada" : "saida",
    type: input.type.trim(),
    description: input.description.trim(),
    amount_cents: toCents(input.amount),
    sponsor_name: input.sponsor_name?.trim() || null,
    due_date: input.due_date || null,
    paid_date: input.paid_date || null,
    status: input.status?.trim() || "Previsto",
    transparency_notes: input.transparency_notes?.trim() || null,
    created_at: now(),
    updated_at: now()
  };

  if (!record.type || !record.description || record.amount_cents <= 0) {
    throw new Error("Tipo, descrição e valor são obrigatórios.");
  }

  db.prepare(
    `INSERT INTO financial_records (
      id, lead_id, project_type, athlete_name, direction, type, description, amount_cents, sponsor_name,
      due_date, paid_date, status, transparency_notes, created_at, updated_at
    ) VALUES (
      $id, $lead_id, $project_type, $athlete_name, $direction, $type, $description, $amount_cents, $sponsor_name,
      $due_date, $paid_date, $status, $transparency_notes, $created_at, $updated_at
    )`
  ).run({
    $id: record.id,
    $lead_id: record.lead_id,
    $project_type: record.project_type,
    $athlete_name: record.athlete_name,
    $direction: record.direction,
    $type: record.type,
    $description: record.description,
    $amount_cents: record.amount_cents,
    $sponsor_name: record.sponsor_name,
    $due_date: record.due_date,
    $paid_date: record.paid_date,
    $status: record.status,
    $transparency_notes: record.transparency_notes,
    $created_at: record.created_at,
    $updated_at: record.updated_at
  });

  return record;
}

export function updateFinancialRecord(
  id: string,
  input: {
    lead_id: string;
    direction: FinancialDirection;
    type: string;
    description: string;
    amount: string | number;
    sponsor_name?: string;
    due_date?: string;
    paid_date?: string;
    status?: string;
    transparency_notes?: string;
  }
) {
  const db = getDatabase();
  const existing = db.prepare("SELECT * FROM financial_records WHERE id = ?").get(id) as FinancialRecord | undefined;
  if (!existing) throw new Error("Lançamento financeiro não encontrado.");

  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(input.lead_id) as LeadRecord | undefined;
  if (!lead) throw new Error("Atleta/cadastro não encontrado.");

  const record: FinancialRecord = {
    ...existing,
    lead_id: lead.id,
    project_type: lead.project_type,
    athlete_name: lead.athlete_name || lead.name,
    direction: input.direction === "entrada" ? "entrada" : "saida",
    type: input.type.trim(),
    description: input.description.trim(),
    amount_cents: toCents(input.amount),
    sponsor_name: input.sponsor_name?.trim() || null,
    due_date: input.due_date || null,
    paid_date: input.paid_date || null,
    status: input.status?.trim() || "Previsto",
    transparency_notes: input.transparency_notes?.trim() || null,
    updated_at: now()
  };

  if (!record.type || !record.description || record.amount_cents <= 0) {
    throw new Error("Tipo, descrição e valor são obrigatórios.");
  }

  db.prepare(
    `UPDATE financial_records
     SET lead_id = $lead_id,
         project_type = $project_type,
         athlete_name = $athlete_name,
         direction = $direction,
         type = $type,
         description = $description,
         amount_cents = $amount_cents,
         sponsor_name = $sponsor_name,
         due_date = $due_date,
         paid_date = $paid_date,
         status = $status,
         transparency_notes = $transparency_notes,
         updated_at = $updated_at
     WHERE id = $id`
  ).run({
    $id: record.id,
    $lead_id: record.lead_id,
    $project_type: record.project_type,
    $athlete_name: record.athlete_name,
    $direction: record.direction,
    $type: record.type,
    $description: record.description,
    $amount_cents: record.amount_cents,
    $sponsor_name: record.sponsor_name,
    $due_date: record.due_date,
    $paid_date: record.paid_date,
    $status: record.status,
    $transparency_notes: record.transparency_notes,
    $updated_at: record.updated_at
  });

  return record;
}

export function deleteFinancialRecord(id: string) {
  getDatabase().prepare("DELETE FROM financial_records WHERE id = ?").run(id);
}
