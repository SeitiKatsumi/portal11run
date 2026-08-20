import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { createHash, pbkdf2Sync, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import { listEventsForLead, type MemberEvent } from "./events";
import type { LeadRecord } from "./leads";
import type { RankingRecord } from "./rankings";
import { normalizeMemberMarkEvent } from "./member-mark-options";
import { cleanCpf, isValidCpf } from "./leads";
import { ONZE_FUTURO_TERM_VERSION, onzeFuturoTermSnapshot } from "./onze-futuro-policy";

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
  profile_photo_url: string | null;
  medical_certificate_file_id: string | null;
  medical_certificate_name: string | null;
  created_at: string;
  updated_at: string;
};

export type MemberAccountPublic = Omit<MemberAccount, "password_hash" | "password_salt">;

export type MemberTermAcceptance = {
  id: string;
  account_id: string;
  lead_id: string;
  document_type: string;
  document_version: string;
  document_hash: string;
  acceptor_name: string;
  acceptor_cpf: string;
  accepted_at: string;
};

export type FinancialRecord = {
  id: string;
  lead_id: string;
  direction: "entrada" | "saida";
  type: string;
  description: string;
  amount_cents: number;
  due_date: string | null;
  paid_date: string | null;
  image_url: string | null;
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

export type MemberPerformanceMark = Pick<MemberMark, "id" | "event" | "time" | "date" | "location"> & {
  editable: boolean;
  source: "MEMBER" | "RANKING";
};

export type MemberDashboardData = {
  account: MemberAccountPublic;
  lead: LeadRecord;
  financialRecords: FinancialRecord[];
  creativeAssets: CreativeAsset[];
  marks: MemberMark[];
  performanceMarks: MemberPerformanceMark[];
  rankings: RankingRecord[];
  events: MemberEvent[];
  termAcceptances: MemberTermAcceptance[];
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
  const accountColumns = new Set(
    (database.prepare("PRAGMA table_info(member_accounts)").all() as Array<{ name: string }>).map((column) => column.name)
  );
  if (!accountColumns.has("profile_photo_url")) {
    database.exec("ALTER TABLE member_accounts ADD COLUMN profile_photo_url TEXT");
  }
  if (!accountColumns.has("medical_certificate_file_id")) {
    database.exec("ALTER TABLE member_accounts ADD COLUMN medical_certificate_file_id TEXT");
  }
  if (!accountColumns.has("medical_certificate_name")) {
    database.exec("ALTER TABLE member_accounts ADD COLUMN medical_certificate_name TEXT");
  }
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

function normalizeAthleteName(value?: string | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLocaleLowerCase("pt-BR");
}

function normalizeMarkTime(value: string) {
  return value.trim().replace(",", ".").replace(/[^\d:.]/g, "");
}

function performanceMarkKey(mark: Pick<MemberPerformanceMark, "event" | "time" | "date" | "location">) {
  return [
    normalizeMemberMarkEvent(mark.event),
    normalizeMarkTime(mark.time),
    mark.date.trim(),
    mark.location.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("pt-BR").trim()
  ].join("|");
}

export function mergeMemberPerformanceMarks(groups: MemberPerformanceMark[][]) {
  const unique = new Map<string, MemberPerformanceMark>();
  groups.flat().forEach((mark) => {
    if (normalizeMemberMarkEvent(mark.event) !== "1000m") return;
    const key = performanceMarkKey(mark);
    const existing = unique.get(key);
    if (!existing || (!existing.editable && mark.editable)) unique.set(key, mark);
  });
  return [...unique.values()].sort((a, b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));
}

export function updateMemberProfilePhoto(accountId: string, photoUrl: string) {
  const cleanUrl = photoUrl.trim();
  if (!cleanUrl.startsWith("/api/uploads/")) throw new Error("Foto de perfil inválida.");
  getDatabase()
    .prepare("UPDATE member_accounts SET profile_photo_url = ?, updated_at = ? WHERE id = ?")
    .run(cleanUrl, now(), accountId);
  return cleanUrl;
}

export function updateMemberMedicalCertificate(accountId: string, fileId: string, originalName: string) {
  getDatabase()
    .prepare(
      "UPDATE member_accounts SET medical_certificate_file_id = ?, medical_certificate_name = ?, updated_at = ? WHERE id = ?"
    )
    .run(fileId, originalName.trim(), now(), accountId);
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

  const savedAccount = db
    .prepare("SELECT id, lead_id, role, username, active, created_at, updated_at FROM member_accounts WHERE lead_id = ?")
    .get(input.leadId) as MemberAccountPublic;
  if (lead.project_type === "onze-futuro" && lead.term_version === ONZE_FUTURO_TERM_VERSION && lead.term_snapshot && lead.term_hash) {
    db.prepare(
      `INSERT OR IGNORE INTO member_term_acceptances
       (id, account_id, lead_id, document_type, document_version, document_hash, document_snapshot,
        acceptor_name, acceptor_cpf, ip_address, user_agent, accepted_at)
       VALUES (?, ?, ?, 'ONZE_FUTURO', ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(randomUUID(), savedAccount.id, lead.id, lead.term_version, lead.term_hash, lead.term_snapshot,
      lead.term_acceptor_name ?? "Responsável legal", lead.term_acceptor_cpf ?? "",
      lead.term_ip_address ?? "", lead.term_user_agent ?? "", lead.term_accepted_at || lead.created_at);
  }
  return savedAccount;
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

export function hasCurrentOnzeFuturoTerm(accountId: string) {
  const account = getDatabase()
    .prepare("SELECT role FROM member_accounts WHERE id = ? AND active = 1")
    .get(accountId) as { role: MemberRole } | undefined;
  if (!account || account.role !== "atleta_onze_futuro") return true;
  return Boolean(
    getDatabase()
      .prepare("SELECT id FROM member_term_acceptances WHERE account_id = ? AND document_type = 'ONZE_FUTURO' AND document_version = ?")
      .get(accountId, ONZE_FUTURO_TERM_VERSION)
  );
}

export function acceptCurrentOnzeFuturoTerm(input: {
  accountId: string;
  acceptorName: string;
  acceptorCpf: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = getDatabase();
  const row = db.prepare(
    `SELECT a.id AS account_id, a.lead_id, a.role, l.payload_json, l.term_acceptor_cpf
     FROM member_accounts a JOIN leads l ON l.id = a.lead_id
     WHERE a.id = ? AND a.active = 1`
  ).get(input.accountId) as {
    account_id: string; lead_id: string; role: MemberRole; payload_json: string;
    term_acceptor_cpf: string | null;
  } | undefined;
  if (!row || row.role !== "atleta_onze_futuro") throw new Error("Conta do Onze Futuro não encontrada.");

  const name = input.acceptorName.trim();
  const cpf = cleanCpf(input.acceptorCpf);
  if (name.length < 3) throw new Error("Informe o nome completo do responsável.");
  if (!isValidCpf(cpf)) throw new Error("CPF do responsável inválido.");
  const payload = JSON.parse(row.payload_json || "{}") as Record<string, unknown>;
  const knownCpfs = [row.term_acceptor_cpf, payload.guardian_cpf, payload.term_acceptor_cpf]
    .map((value) => cleanCpf(String(value ?? "")))
    .filter(Boolean);
  if (knownCpfs.length && !knownCpfs.includes(cpf)) throw new Error("O CPF deve corresponder ao responsável registrado.");

  const snapshot = onzeFuturoTermSnapshot();
  const hash = createHash("sha256").update(snapshot).digest("hex");
  const acceptedAt = now();
  db.prepare(
    `INSERT OR IGNORE INTO member_term_acceptances
     (id, account_id, lead_id, document_type, document_version, document_hash, document_snapshot,
      acceptor_name, acceptor_cpf, ip_address, user_agent, accepted_at)
     VALUES (?, ?, ?, 'ONZE_FUTURO', ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), row.account_id, row.lead_id, ONZE_FUTURO_TERM_VERSION, hash, snapshot, name, cpf,
    input.ipAddress?.slice(0, 100) ?? "", input.userAgent?.slice(0, 500) ?? "", acceptedAt);
  return db.prepare(
    "SELECT id, account_id, lead_id, document_type, document_version, document_hash, acceptor_name, acceptor_cpf, accepted_at FROM member_term_acceptances WHERE account_id = ? AND document_type = 'ONZE_FUTURO' AND document_version = ?"
  ).get(row.account_id, ONZE_FUTURO_TERM_VERSION) as MemberTermAcceptance;
}

export function listMemberTermAcceptances(accountId: string) {
  return getDatabase().prepare(
    "SELECT id, account_id, lead_id, document_type, document_version, document_hash, acceptor_name, acceptor_cpf, accepted_at FROM member_term_acceptances WHERE account_id = ? ORDER BY datetime(accepted_at) DESC"
  ).all(accountId) as MemberTermAcceptance[];
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
    .prepare("SELECT * FROM rankings ORDER BY age_group ASC, event ASC, time ASC")
    .all() as RankingRecord[];
  const athleteNames = new Set([lead.athlete_name, lead.name].map(normalizeAthleteName).filter(Boolean));
  const matchingRankings = rankings.filter((mark) => athleteNames.has(normalizeAthleteName(mark.athlete_name)));
  const performanceMarks = mergeMemberPerformanceMarks([
    marks.map((mark) => ({
      id: mark.id,
      event: mark.event,
      time: mark.time,
      date: mark.date,
      location: mark.location,
      editable: true,
      source: "MEMBER" as const
    })),
    matchingRankings.map((mark) => ({
        id: `ranking:${mark.id}`,
        event: mark.event,
        time: mark.time,
        date: mark.date,
        location: mark.location,
        editable: false,
        source: "RANKING" as const
      }))
  ]);
  const events = listEventsForLead(lead.id, lead.project_type);
  const termAcceptances = listMemberTermAcceptances(account.id);

  return {
    account: publicAccount(account),
    lead,
    financialRecords,
    creativeAssets,
    marks,
    performanceMarks,
    rankings: matchingRankings,
    events,
    termAcceptances
  };
}

export function getMemberDashboardByLeadId(leadId: string): MemberDashboardData | null {
  const account = getDatabase()
    .prepare("SELECT id FROM member_accounts WHERE lead_id = ? AND active = 1")
    .get(leadId) as { id: string } | undefined;

  return account ? getMemberDashboard(account.id) : null;
}

type MemberMarkInput = { event: string; time: string; date: string; location: string };

function cleanMemberMarkInput(input: MemberMarkInput) {
  const event = normalizeMemberMarkEvent(input.event);
  if (!event) throw new Error("Selecione uma prova válida.");
  if (event !== "1000m") throw new Error("O painel aceita somente marcas de 1.000 m.");
  const clean = {
    event,
    time: input.time.trim(),
    date: input.date.trim(),
    location: input.location.trim()
  };
  if (Object.values(clean).some((value) => !value)) throw new Error("Preencha todos os campos da marca.");
  return clean;
}

export function createMemberMark(accountId: string, input: MemberMarkInput) {
  const db = getDatabase();
  const account = db.prepare("SELECT * FROM member_accounts WHERE id = ? AND active = 1").get(accountId) as MemberAccount | undefined;
  if (!account) throw new Error("Conta não encontrada.");
  const clean = cleanMemberMarkInput(input);
  const createdAt = now();
  const record: MemberMark = {
    id: randomUUID(),
    account_id: account.id,
    lead_id: account.lead_id,
    age_group: "",
    status: "Registrada",
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

export function updateMemberMark(accountId: string, markId: string, input: MemberMarkInput) {
  const db = getDatabase();
  const existing = db
    .prepare("SELECT * FROM member_marks WHERE id = ? AND account_id = ?")
    .get(markId, accountId) as MemberMark | undefined;
  if (!existing) throw new Error("Atividade não encontrada.");

  const clean = cleanMemberMarkInput(input);
  const updatedAt = now();
  db.prepare(
    `UPDATE member_marks
     SET event = $event, time = $time, date = $date, location = $location, status = 'Registrada', updated_at = $updated_at
     WHERE id = $id AND account_id = $account_id`
  ).run({
    $id: markId,
    $account_id: accountId,
    $event: clean.event,
    $time: clean.time,
    $date: clean.date,
    $location: clean.location,
    $updated_at: updatedAt
  });

  return db.prepare("SELECT * FROM member_marks WHERE id = ? AND account_id = ?").get(markId, accountId) as MemberMark;
}
