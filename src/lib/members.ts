import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import type { LeadRecord } from "./leads";
import type { RankingRecord } from "./rankings";

export type MemberRole = "atleta_onze_futuro" | "atleta_11_regional" | "atleta_11_bolsista" | "atleta_circuito_futuro";

export const memberRoleLabels: Record<MemberRole, string> = {
  atleta_onze_futuro: "Atleta 11 Futuro",
  atleta_11_regional: "Atleta 11 Master",
  atleta_11_bolsista: "Atleta 11 Bolsista",
  atleta_circuito_futuro: "Atleta Circuito do Futuro"
};

export const eligibleMemberRolesByProject: Record<string, MemberRole | undefined> = {
  "onze-futuro": "atleta_onze_futuro",
  "11-regional": "atleta_11_regional"
};

export type MemberAccount = {
  id: string;
  lead_id: string;
  role: MemberRole;
  username: string;
  password_hash: string;
  password_salt: string;
  active: number;
  created_at: string;
  updated_at: string;
};

export type MemberAccountPublic = Omit<MemberAccount, "password_hash" | "password_salt">;

export type FinancialRecord = {
  id: string;
  lead_id: string;
  type: string;
  description: string;
  amount_cents: number;
  due_date: string | null;
  paid_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CreativeAsset = {
  id: string;
  project_type: string;
  title: string;
  description: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberMark = {
  id: string;
  account_id: string;
  lead_id: string;
  age_group: string;
  event: string;
  time: string;
  date: string;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type MemberDashboardData = {
  account: MemberAccountPublic;
  lead: LeadRecord;
  financialRecords: FinancialRecord[];
  creativeAssets: CreativeAsset[];
  marks: MemberMark[];
  rankings: RankingRecord[];
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
  return database;
}

function now() {
  return new Date().toISOString();
}

function publicAccount(account: MemberAccount): MemberAccountPublic {
  const { password_hash: _passwordHash, password_salt: _passwordSalt, ...safe } = account;
  return safe;
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex")
  };
}

function verifyPassword(password: string, account: MemberAccount) {
  const { hash } = hashPassword(password, account.password_salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(account.password_hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function listMemberAccounts() {
  return getDatabase()
    .prepare("SELECT id, lead_id, role, username, active, created_at, updated_at FROM member_accounts ORDER BY datetime(updated_at) DESC")
    .all() as MemberAccountPublic[];
}

export function upsertMemberAccount(input: { leadId: string; role: MemberRole; username: string; password?: string; active?: boolean }) {
  const cleanUsername = input.username.trim();
  if (!cleanUsername) throw new Error("Usuário obrigatório.");
  if (!memberRoleLabels[input.role]) throw new Error("Perfil inválido.");

  const db = getDatabase();
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(input.leadId) as LeadRecord | undefined;
  if (!lead) throw new Error("Cadastro não encontrado.");
  if (!["Aceitos", "Aceitas"].includes(lead.pipeline_status)) throw new Error("O cadastro precisa estar aceito para liberar acesso.");
  if (!eligibleMemberRolesByProject[lead.project_type]) throw new Error("Este projeto ainda não tem dashboard de membro ativo.");

  const existing = db.prepare("SELECT * FROM member_accounts WHERE lead_id = ?").get(input.leadId) as MemberAccount | undefined;
  const updatedAt = now();

  if (existing) {
    const passwordParts = input.password ? hashPassword(input.password) : null;
    db.prepare(
      `UPDATE member_accounts
       SET role = $role,
           username = $username,
           password_hash = COALESCE($password_hash, password_hash),
           password_salt = COALESCE($password_salt, password_salt),
           active = $active,
           updated_at = $updated_at
       WHERE lead_id = $lead_id`
    ).run({
      $lead_id: input.leadId,
      $role: input.role,
      $username: cleanUsername,
      $password_hash: passwordParts?.hash ?? null,
      $password_salt: passwordParts?.salt ?? null,
      $active: input.active === false ? 0 : 1,
      $updated_at: updatedAt
    });
  } else {
    if (!input.password || input.password.length < 6) throw new Error("Senha inicial obrigatória com pelo menos 6 caracteres.");
    const passwordParts = hashPassword(input.password);
    db.prepare(
      `INSERT INTO member_accounts (id, lead_id, role, username, password_hash, password_salt, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(randomUUID(), input.leadId, input.role, cleanUsername, passwordParts.hash, passwordParts.salt, input.active === false ? 0 : 1, updatedAt, updatedAt);
  }

  return db
    .prepare("SELECT id, lead_id, role, username, active, created_at, updated_at FROM member_accounts WHERE lead_id = ?")
    .get(input.leadId) as MemberAccountPublic;
}

export function authenticateMember(username: string, password: string) {
  const account = getDatabase().prepare("SELECT * FROM member_accounts WHERE username = ? AND active = 1").get(username.trim()) as
    | MemberAccount
    | undefined;
  if (!account || !verifyPassword(password, account)) return null;
  return publicAccount(account);
}

export function createMemberSession(accountId: string) {
  const token = randomBytes(32).toString("hex");
  const createdAt = now();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
  getDatabase()
    .prepare("INSERT INTO member_sessions (id, account_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), accountId, hashToken(token), expiresAt, createdAt);
  return { token, expiresAt };
}

export function getMemberBySessionToken(token?: string | null) {
  if (!token) return null;
  const db = getDatabase();
  const row = db
    .prepare(
      `SELECT member_accounts.*
       FROM member_sessions
       JOIN member_accounts ON member_accounts.id = member_sessions.account_id
       WHERE member_sessions.token_hash = ? AND datetime(member_sessions.expires_at) > datetime('now') AND member_accounts.active = 1`
    )
    .get(hashToken(token)) as MemberAccount | undefined;
  return row ? publicAccount(row) : null;
}

export function deleteMemberSession(token?: string | null) {
  if (!token) return;
  getDatabase().prepare("DELETE FROM member_sessions WHERE token_hash = ?").run(hashToken(token));
}

export function getMemberDashboard(accountId: string): MemberDashboardData | null {
  const db = getDatabase();
  const account = db.prepare("SELECT * FROM member_accounts WHERE id = ? AND active = 1").get(accountId) as MemberAccount | undefined;
  if (!account) return null;
  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(account.lead_id) as LeadRecord | undefined;
  if (!lead) return null;

  const financialRecords = db
    .prepare("SELECT * FROM financial_records WHERE lead_id = ? ORDER BY datetime(COALESCE(due_date, created_at)) DESC")
    .all(lead.id) as FinancialRecord[];
  const creativeAssets = db
    .prepare("SELECT * FROM creative_assets WHERE project_type IN (?, 'todos') ORDER BY datetime(created_at) DESC")
    .all(lead.project_type) as CreativeAsset[];
  const marks = db
    .prepare("SELECT * FROM member_marks WHERE account_id = ? ORDER BY datetime(date) DESC, datetime(created_at) DESC")
    .all(account.id) as MemberMark[];
  const rankings = db
    .prepare("SELECT * FROM rankings WHERE lower(athlete_name) = lower(?) ORDER BY age_group ASC, event ASC, time ASC")
    .all(lead.athlete_name || lead.name) as RankingRecord[];

  return { account: publicAccount(account), lead, financialRecords, creativeAssets, marks, rankings };
}

export function createMemberMark(accountId: string, input: { age_group: string; event: string; time: string; date: string; location: string }) {
  const db = getDatabase();
  const account = db.prepare("SELECT * FROM member_accounts WHERE id = ? AND active = 1").get(accountId) as MemberAccount | undefined;
  if (!account) throw new Error("Conta não encontrada.");
  const clean = {
    age_group: input.age_group.trim(),
    event: input.event.trim(),
    time: input.time.trim(),
    date: input.date.trim(),
    location: input.location.trim()
  };
  if (Object.values(clean).some((value) => !value)) throw new Error("Preencha todos os campos da marca.");
  const createdAt = now();
  const record: MemberMark = {
    id: randomUUID(),
    account_id: account.id,
    lead_id: account.lead_id,
    status: "Pendente de validação",
    created_at: createdAt,
    updated_at: createdAt,
    ...clean
  };
  db.prepare(
    `INSERT INTO member_marks (id, account_id, lead_id, age_group, event, time, date, location, status, created_at, updated_at)
     VALUES ($id, $account_id, $lead_id, $age_group, $event, $time, $date, $location, $status, $created_at, $updated_at)`
  ).run({
    $id: record.id,
    $account_id: record.account_id,
    $lead_id: record.lead_id,
    $age_group: record.age_group,
    $event: record.event,
    $time: record.time,
    $date: record.date,
    $location: record.location,
    $status: record.status,
    $created_at: record.created_at,
    $updated_at: record.updated_at
  });
  return record;
}
