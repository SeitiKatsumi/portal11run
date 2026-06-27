import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export type LeadPayload = Record<string, string | boolean | undefined>;

export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  state: string | null;
  profile_type: string | null;
  project_type: string;
  athlete_name: string | null;
  birth_date: string | null;
  age: string | null;
  category: string | null;
  school: string | null;
  team: string | null;
  best_marks: string | null;
  competitions: string | null;
  social_link: string | null;
  language_english: string | null;
  language_japanese: string | null;
  country_interest: string | null;
  message: string | null;
  accepted_contact: number;
  accepted_terms: number;
  term_acceptor_name: string | null;
  term_acceptor_cpf: string | null;
  photos_json: string | null;
  pipeline_status: string;
  receipts_json: string | null;
  payload_json: string;
  created_at: string;
  updated_at: string | null;
};

export const pipelineStatuses = ["Cadastro recebido", "Em análise", "Aceitos", "Declinados", "Outros"] as const;

export const receiptItems = [
  "Uniforme",
  "Material esportivo",
  "Ajuda de custo",
  "Inscrição ou evento",
  "Outro recebimento"
] as const;

const requiredFields = ["name", "email", "phone", "project_type", "accepted_contact"];

const schemaColumns: Record<string, string> = {
  accepted_terms: "INTEGER NOT NULL DEFAULT 0",
  term_acceptor_name: "TEXT",
  term_acceptor_cpf: "TEXT",
  photos_json: "TEXT",
  pipeline_status: "TEXT NOT NULL DEFAULT 'Cadastro recebido'",
  receipts_json: "TEXT",
  updated_at: "TEXT"
};

let database: DatabaseSync | undefined;

export function cleanCpf(value: string) {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string) {
  const cpf = cleanCpf(value);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map(Number);
  const calcDigit = (factor: number) => {
    const total = digits.slice(0, factor - 1).reduce((sum, digit, index) => sum + digit * (factor - index), 0);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(10) === digits[9] && calcDigit(11) === digits[10];
}

function getAgeFromBirthDate(value: string, now = new Date()) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  const dayDiff = now.getDate() - date.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }
  return age;
}

function assertColumns(databaseInstance: DatabaseSync) {
  const existing = new Set(
    databaseInstance
      .prepare("PRAGMA table_info(leads)")
      .all()
      .map((column) => String((column as { name: string }).name))
  );

  for (const [column, definition] of Object.entries(schemaColumns)) {
    if (!existing.has(column)) {
      databaseInstance.exec(`ALTER TABLE leads ADD COLUMN ${column} ${definition}`);
    }
  }
}

function getDatabase() {
  if (database) {
    return database;
  }

  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });

  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  assertColumns(database);
  return database;
}

export function validateLead(payload: LeadPayload, options?: { photoCount?: number }) {
  const missing = requiredFields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === "" || value === false;
  });

  if (missing.length > 0) {
    return { ok: false, error: `Campos obrigatórios ausentes: ${missing.join(", ")}` };
  }

  const email = String(payload.email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "E-mail inválido." };
  }

  if (payload.project_type === "onze-futuro") {
    const requiredOnzeFuturoFields = [
      "athlete_name",
      "birth_date",
      "father_name",
      "mother_name",
      "address",
      "shoe_size",
      "height_cm",
      "weight_kg",
      "coach_name",
      "coach_phone",
      "coach_cref",
      "athlete_rg",
      "athlete_cpf",
      "guardian_rg",
      "guardian_cpf",
      "athlete_dream",
      "term_acceptor_name",
      "term_acceptor_cpf"
    ];

    const missingProjectFields = requiredOnzeFuturoFields.filter((field) => !payload[field]);
    if (missingProjectFields.length > 0) {
      return { ok: false, error: `Campos obrigatórios do Onze Futuro ausentes: ${missingProjectFields.join(", ")}` };
    }

    const age = getAgeFromBirthDate(String(payload.birth_date));
    if (age === null || age < 9 || age > 13) {
      return { ok: false, error: "A data de nascimento deve corresponder a idade entre 9 e 13 anos." };
    }

    if (!isValidCpf(String(payload.athlete_cpf))) {
      return { ok: false, error: "CPF do atleta inválido." };
    }

    if (!isValidCpf(String(payload.guardian_cpf))) {
      return { ok: false, error: "CPF do responsável inválido." };
    }

    if (!isValidCpf(String(payload.term_acceptor_cpf))) {
      return { ok: false, error: "CPF de quem aceitou o termo inválido." };
    }

    if (payload.accepted_terms !== true) {
      return { ok: false, error: "O termo de aceite do projeto precisa ser aceito." };
    }

    if (options?.photoCount !== 5) {
      return { ok: false, error: "Envie exatamente 5 fotos do atleta." };
    }
  }

  return { ok: true };
}

export function saveLead(payload: LeadPayload, photos: string[] = []) {
  const now = new Date().toISOString();
  const record = {
    id: crypto.randomUUID(),
    created_at: now,
    photos,
    ...payload
  };

  getDatabase()
    .prepare(
      `INSERT INTO leads (
        id,
        name,
        email,
        phone,
        city,
        state,
        profile_type,
        project_type,
        athlete_name,
        birth_date,
        age,
        category,
        school,
        team,
        best_marks,
        competitions,
        social_link,
        language_english,
        language_japanese,
        country_interest,
        message,
        accepted_contact,
        accepted_terms,
        term_acceptor_name,
        term_acceptor_cpf,
        photos_json,
        pipeline_status,
        receipts_json,
        payload_json,
        created_at,
        updated_at
      ) VALUES (
        $id,
        $name,
        $email,
        $phone,
        $city,
        $state,
        $profile_type,
        $project_type,
        $athlete_name,
        $birth_date,
        $age,
        $category,
        $school,
        $team,
        $best_marks,
        $competitions,
        $social_link,
        $language_english,
        $language_japanese,
        $country_interest,
        $message,
        $accepted_contact,
        $accepted_terms,
        $term_acceptor_name,
        $term_acceptor_cpf,
        $photos_json,
        $pipeline_status,
        $receipts_json,
        $payload_json,
        $created_at,
        $updated_at
      )`
    )
    .run({
      $id: record.id,
      $name: String(payload.name ?? ""),
      $email: String(payload.email ?? ""),
      $phone: String(payload.phone ?? ""),
      $city: String(payload.city ?? ""),
      $state: String(payload.state ?? ""),
      $profile_type: String(payload.profile_type ?? ""),
      $project_type: String(payload.project_type ?? ""),
      $athlete_name: String(payload.athlete_name ?? ""),
      $birth_date: String(payload.birth_date ?? ""),
      $age: String(payload.age ?? getAgeFromBirthDate(String(payload.birth_date ?? "")) ?? ""),
      $category: String(payload.category ?? ""),
      $school: String(payload.school ?? ""),
      $team: String(payload.team ?? ""),
      $best_marks: String(payload.best_marks ?? ""),
      $competitions: String(payload.competitions ?? ""),
      $social_link: String(payload.social_link ?? ""),
      $language_english: String(payload.language_english ?? ""),
      $language_japanese: String(payload.language_japanese ?? ""),
      $country_interest: String(payload.country_interest ?? ""),
      $message: String(payload.message ?? ""),
      $accepted_contact: payload.accepted_contact === true ? 1 : 0,
      $accepted_terms: payload.accepted_terms === true ? 1 : 0,
      $term_acceptor_name: String(payload.term_acceptor_name ?? ""),
      $term_acceptor_cpf: cleanCpf(String(payload.term_acceptor_cpf ?? "")),
      $photos_json: JSON.stringify(photos),
      $pipeline_status: "Cadastro recebido",
      $receipts_json: JSON.stringify({}),
      $payload_json: JSON.stringify(record),
      $created_at: record.created_at,
      $updated_at: now
    });

  return record;
}

export function listLeads() {
  return getDatabase()
    .prepare("SELECT * FROM leads ORDER BY datetime(created_at) DESC")
    .all() as LeadRecord[];
}

export function updateLead(id: string, updates: { pipeline_status?: string; receipts?: Record<string, boolean> }) {
  const current = getDatabase().prepare("SELECT receipts_json FROM leads WHERE id = ?").get(id) as
    | { receipts_json?: string }
    | undefined;

  if (!current) {
    return null;
  }

  const currentReceipts = current.receipts_json ? (JSON.parse(current.receipts_json) as Record<string, boolean>) : {};
  const nextStatus =
    updates.pipeline_status && pipelineStatuses.includes(updates.pipeline_status as (typeof pipelineStatuses)[number])
      ? updates.pipeline_status
      : undefined;
  const nextReceipts = updates.receipts ? { ...currentReceipts, ...updates.receipts } : currentReceipts;
  const updatedAt = new Date().toISOString();

  getDatabase()
    .prepare(
      `UPDATE leads
       SET pipeline_status = COALESCE($pipeline_status, pipeline_status),
           receipts_json = $receipts_json,
           updated_at = $updated_at
       WHERE id = $id`
    )
    .run({
      $id: id,
      $pipeline_status: nextStatus ?? null,
      $receipts_json: JSON.stringify(nextReceipts),
      $updated_at: updatedAt
    });

  return getDatabase().prepare("SELECT * FROM leads WHERE id = ?").get(id) as LeadRecord;
}
