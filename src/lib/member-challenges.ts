import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { parseMemberMarkTime } from "./member-mark-chart.ts";

export type ChallengeSubmissionStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CORRECTION_REQUESTED"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

export type ChallengeType = "SCHOOL" | "ATTENDANCE" | "EVOLUTION" | "IDEAS";

type ChallengeSettings = {
  aiConfidenceThreshold: number;
  schoolBands: Array<{ min: number; max: number; benefit: number; points: number }>;
  attendanceBands: Array<{ min: number; max: number; benefit: number; points: number }>;
  maximumCombinedBenefit: number;
  ideaLimitPerWeek: number;
  ideaCycle: "monthly" | "quarterly" | "semiannual" | "annual";
  retentionDays: number;
  scoreWeights: {
    submission: number;
    approval: number;
    validIdea: number;
    implementedIdea: number;
    validTest: number;
    personalEvolution: number;
    badge: number;
  };
};

const defaultSettings: ChallengeSettings = {
  aiConfidenceThreshold: 0.85,
  schoolBands: [
    { min: 0, max: 6.99, benefit: 0, points: 20 },
    { min: 7, max: 7.99, benefit: 5, points: 45 },
    { min: 8, max: 8.99, benefit: 10, points: 70 },
    { min: 9, max: 10, benefit: 20, points: 100 }
  ],
  attendanceBands: [
    { min: 0, max: 40, benefit: 0, points: 15 },
    { min: 50, max: 60, benefit: 5, points: 35 },
    { min: 70, max: 80, benefit: 10, points: 65 },
    { min: 90, max: 100, benefit: 15, points: 90 }
  ],
  maximumCombinedBenefit: 35,
  ideaLimitPerWeek: 5,
  ideaCycle: "quarterly",
  retentionDays: 730,
  scoreWeights: {
    submission: 15,
    approval: 25,
    validIdea: 20,
    implementedIdea: 50,
    validTest: 8,
    personalEvolution: 35,
    badge: 10
  }
};

const challengeSeeds = [
  ["challenge-school", "school", "Desafio Escolar", "Escola também é parte do sonho.", "SCHOOL"],
  ["challenge-attendance", "attendance", "Desafio de Assiduidade", "Compromisso com os treinos.", "ATTENDANCE"],
  ["challenge-evolution", "evolution", "Minha Evolução", "Sua principal competição é com você mesmo.", "EVOLUTION"],
  ["challenge-ideas", "ideas", "Ideias para o Projeto", "Sua voz constrói o projeto.", "IDEAS"]
] as const;

const badgeSeeds = [
  ["badge-first-report", "first-report", "Compromisso Escolar", "Envie o primeiro boletim.", "SCHOOL", "book-open"],
  ["badge-grade-7", "grade-7", "Média 7+", "Alcance média escolar a partir de 7.", "SCHOOL", "graduation-cap"],
  ["badge-academic-highlight", "academic-highlight", "Destaque Acadêmico", "Alcance média escolar a partir de 8.", "SCHOOL", "sparkles"],
  ["badge-golden-report", "golden-report", "Boletim de Ouro", "Alcance média escolar a partir de 9.", "SCHOOL", "award"],
  ["badge-first-plan", "first-plan", "Primeira Planilha", "Envie a primeira planilha de treinos.", "ATTENDANCE", "calendar-check"],
  ["badge-consistency-70", "consistency-70", "Constância 70+", "Alcance ao menos 70% de assiduidade.", "ATTENDANCE", "flame"],
  ["badge-discipline-90", "discipline-90", "Disciplina 90+", "Alcance ao menos 90% de assiduidade.", "ATTENDANCE", "shield-check"],
  ["badge-perfect-month", "perfect-month", "Mês Perfeito", "Alcance 100% de assiduidade.", "ATTENDANCE", "trophy"],
  ["badge-attendance-3", "attendance-3", "Sequência de 3 Meses", "Envie e valide três meses consecutivos.", "ATTENDANCE", "calendar-range"],
  ["badge-attendance-6", "attendance-6", "Sequência de 6 Meses", "Envie e valide seis meses consecutivos.", "ATTENDANCE", "calendar-heart"],
  ["badge-first-test", "first-test", "Primeiro Teste", "Registre o primeiro teste válido de 1.000 m.", "EVOLUTION", "timer"],
  ["badge-first-evolution", "first-evolution", "Primeira Evolução", "Melhore sua marca pessoal.", "EVOLUTION", "trending-up"],
  ["badge-evolution-5", "evolution-5", "Evolução de 5%", "Evolua ao menos 5% desde o primeiro teste.", "EVOLUTION", "zap"],
  ["badge-evolution-10", "evolution-10", "Evolução de 10%", "Evolua ao menos 10% desde o primeiro teste.", "EVOLUTION", "trending-up"],
  ["badge-personal-record", "personal-record", "Novo Recorde Pessoal", "Conquiste uma nova melhor marca nos 1.000 m.", "EVOLUTION", "trophy"],
  ["badge-five-tests", "five-tests", "Cinco Testes Concluídos", "Conclua cinco testes válidos.", "EVOLUTION", "medal"],
  ["badge-first-idea", "first-idea", "Voz do Projeto", "Envie sua primeira ideia.", "IDEAS", "lightbulb"],
  ["badge-valid-idea", "valid-idea", "Criador 11RUN", "Tenha uma ideia validada.", "IDEAS", "badge-check"],
  ["badge-five-ideas", "five-ideas", "Ideia em Movimento", "Tenha cinco ideias validadas.", "IDEAS", "sparkles"],
  ["badge-ten-ideas", "ten-ideas", "Transformador 11RUN", "Tenha dez ideias validadas.", "IDEAS", "rocket"],
  ["badge-implemented-idea", "implemented-idea", "Ideia que Virou Realidade", "Tenha uma ideia implementada.", "IDEAS", "rocket"]
] as const;

const ideaCategories = [
  "Treinamentos",
  "Competições",
  "Uniformes e materiais",
  "Painel e tecnologia",
  "Eventos",
  "Conteúdos",
  "Benefícios",
  "Comunidade",
  "Outra ideia"
] as const;

let database: DatabaseSync | undefined;

function db() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  seedChallengeData(database);
  return database;
}

function now() {
  return new Date().toISOString();
}

function safeJson<T>(value: string | null | undefined, fallback: T): T {
  try {
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function clean(value: unknown, max = 1200) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

function seedChallengeData(database: DatabaseSync) {
  const timestamp = now();
  const definition = database.prepare(
    `INSERT INTO member_challenge_definitions
      (id, slug, name, description, type, active, configuration_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 1, '{}', ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, active = 1, updated_at = excluded.updated_at`
  );
  challengeSeeds.forEach((item) => definition.run(...item, timestamp, timestamp));
  const badge = database.prepare(
    `INSERT INTO member_challenge_badges
      (id, slug, name, description, challenge_type, icon, requirement_json, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, '{}', 1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at`
  );
  badgeSeeds.forEach((item) => badge.run(...item, timestamp, timestamp));
  database.prepare(
    `INSERT OR IGNORE INTO member_challenge_settings (id, configuration_json, updated_at, updated_by)
     VALUES ('default', ?, ?, 'system:seed')`
  ).run(JSON.stringify(defaultSettings), timestamp);
}

export function getChallengeSettings(): ChallengeSettings {
  const row = db().prepare("SELECT configuration_json FROM member_challenge_settings WHERE id = 'default'").get() as
    | { configuration_json: string }
    | undefined;
  const stored = safeJson<Partial<ChallengeSettings>>(row?.configuration_json, {});
  return {
    ...defaultSettings,
    ...stored,
    schoolBands: stored.schoolBands ?? defaultSettings.schoolBands,
    attendanceBands: stored.attendanceBands ?? defaultSettings.attendanceBands,
    scoreWeights: { ...defaultSettings.scoreWeights, ...(stored.scoreWeights ?? {}) }
  };
}

function accountOrThrow(accountId: string) {
  const row = db().prepare(
    `SELECT a.id, a.lead_id, a.role, l.name, l.athlete_name, l.project_type
     FROM member_accounts a JOIN leads l ON l.id = a.lead_id
     WHERE a.id = ? AND a.active = 1`
  ).get(accountId) as { id: string; lead_id: string; role: string; name: string; athlete_name: string | null; project_type: string } | undefined;
  if (!row) throw new Error("Conta de atleta não encontrada.");
  return row;
}

function audit(input: {
  actor: string;
  accountId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
  justification?: string;
  ip?: string;
}) {
  db().prepare(
    `INSERT INTO member_challenge_audit_logs
      (id, actor, account_id, entity_type, entity_id, action, previous_data_json, new_data_json, justification, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(), input.actor, input.accountId ?? null, input.entityType, input.entityId, input.action,
    input.before === undefined ? null : JSON.stringify(input.before),
    input.after === undefined ? null : JSON.stringify(input.after),
    input.justification ? clean(input.justification, 1200) : null,
    input.ip ?? null, now()
  );
}

function notify(accountId: string, type: string, title: string, message: string, entityType?: string, entityId?: string) {
  db().prepare(
    `INSERT INTO member_challenge_notifications
      (id, account_id, type, title, message, entity_type, entity_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), accountId, type, clean(title, 120), clean(message, 500), entityType ?? null, entityId ?? null, now());
}

function challengeKey(type: ChallengeType) {
  return {
    SCHOOL: "challenge-school",
    ATTENDANCE: "challenge-attendance",
    EVOLUTION: "challenge-evolution",
    IDEAS: "challenge-ideas"
  }[type];
}

function benefitFor(value: number, bands: ChallengeSettings["schoolBands"]) {
  return bands.find((band) => value >= band.min && value <= band.max) ?? { min: 0, max: 0, benefit: 0, points: 0 };
}

function challengeSecret() {
  const secret = process.env.CHALLENGE_DATA_KEY || process.env.VIRTUAL_CIRCUIT_DATA_KEY || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("A proteção dos documentos está temporariamente indisponível. Tente novamente mais tarde.");
  return createHash("sha256").update(secret).digest();
}

function privateRoot() {
  return path.resolve(process.cwd(), process.env.CHALLENGE_PRIVATE_UPLOAD_DIR ?? "data/private/member-challenges");
}

function assertNoActiveContent(bytes: Buffer<ArrayBufferLike>, mimeType: string) {
  const sample = bytes.toString("latin1").toLowerCase();
  if (mimeType === "application/pdf" && ["/javascript", "/openaction", "/launch", "/richmedia", "/embeddedfile"].some((token) => sample.includes(token))) {
    throw new Error("O PDF contém conteúdo ativo ou anexos incorporados e não pode ser aceito.");
  }
  if ((mimeType.includes("spreadsheet") || mimeType === "application/vnd.ms-excel") && ["vbaproject", "auto_open", "workbook_open"].some((token) => sample.includes(token))) {
    throw new Error("Planilhas com macros ou conteúdo executável não são permitidas.");
  }
}

function stripJpegMetadata(bytes: Buffer) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const output = [bytes.subarray(0, 2)];
  let offset = 2;
  while (offset + 4 <= bytes.length && bytes[offset] === 0xff) {
    const marker = bytes[offset + 1];
    if (marker === 0xda) { output.push(bytes.subarray(offset)); return Buffer.concat(output); }
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2 || offset + 2 + length > bytes.length) return bytes;
    if (marker !== 0xe1 && marker !== 0xed && marker !== 0xfe) output.push(bytes.subarray(offset, offset + 2 + length));
    offset += 2 + length;
  }
  return Buffer.concat([...output, bytes.subarray(offset)]);
}

function stripPngMetadata(bytes: Buffer) {
  const signature = bytes.subarray(0, 8);
  if (signature.toString("hex") !== "89504e470d0a1a0a") return bytes;
  const output = [signature];
  let offset = 8;
  const allowedAncillary = new Set(["tRNS"]);
  while (offset + 12 <= bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) return bytes;
    const type = bytes.subarray(offset + 4, offset + 8).toString("ascii");
    const critical = type[0] === type[0].toUpperCase();
    if (critical || allowedAncillary.has(type)) output.push(bytes.subarray(offset, end));
    offset = end;
    if (type === "IEND") break;
  }
  return Buffer.concat(output);
}

const allowedFiles = new Map([
  ["application/pdf", { extension: "pdf", signature: [0x25, 0x50, 0x44, 0x46] }],
  ["image/jpeg", { extension: "jpg", signature: [0xff, 0xd8, 0xff] }],
  ["image/png", { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] }],
  ["application/vnd.ms-excel", { extension: "xls", signature: [0xd0, 0xcf, 0x11, 0xe0] }],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", { extension: "xlsx", signature: [0x50, 0x4b, 0x03, 0x04] }],
  ["text/csv", { extension: "csv", signature: [] }]
]);

export async function saveChallengeFile(accountId: string, file: File, purpose: "SCHOOL_REPORT" | "ATTENDANCE_PLAN" | "IDEA_IMAGE") {
  accountOrThrow(accountId);
  const allowed = allowedFiles.get(file.type);
  const allowedForPurpose = purpose === "ATTENDANCE_PLAN" ? allowed : allowed && ["pdf", "jpg", "png"].includes(allowed.extension);
  if (!allowed || !allowedForPurpose) throw new Error(purpose === "ATTENDANCE_PLAN" ? "Envie PDF, JPG, PNG, XLS, XLSX ou CSV." : "Envie PDF, JPG, JPEG ou PNG.");
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) throw new Error("O arquivo deve ter até 10 MB.");
  let bytes: Buffer<ArrayBufferLike> = Buffer.from(await file.arrayBuffer());
  if (allowed.signature.length && !allowed.signature.every((byte, index) => bytes[index] === byte)) {
    throw new Error("O conteúdo do arquivo não corresponde ao formato informado.");
  }
  if (file.type === "text/csv" && (bytes.includes(0) || !bytes.toString("utf8", 0, Math.min(bytes.length, 4096)).trim())) {
    throw new Error("O arquivo CSV não contém texto válido.");
  }
  assertNoActiveContent(bytes, file.type);
  if (file.type === "image/jpeg") bytes = stripJpegMetadata(bytes);
  if (file.type === "image/png") bytes = stripPngMetadata(bytes);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", challengeSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(bytes), cipher.final()]);
  const tag = cipher.getAuthTag();
  const id = randomUUID();
  const storageName = `${randomUUID()}.enc`;
  await mkdir(privateRoot(), { recursive: true });
  await writeFile(path.join(privateRoot(), storageName), encrypted, { flag: "wx", mode: 0o600 });
  const retentionUntil = new Date(Date.now() + getChallengeSettings().retentionDays * 86_400_000).toISOString();
  db().prepare(
    `INSERT INTO member_challenge_files
      (id, account_id, storage_name, original_name, mime_type, size_bytes, sha256, purpose, encryption_iv, encryption_tag, scan_status, retention_until, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'BASIC_VALIDATED', ?, ?)`
  ).run(id, accountId, storageName, clean(file.name, 180), file.type, bytes.length, createHash("sha256").update(bytes).digest("hex"), purpose, iv.toString("base64url"), tag.toString("base64url"), retentionUntil, now());
  audit({ actor: `member:${accountId}`, accountId, entityType: "challenge_file", entityId: id, action: "FILE_UPLOADED", after: { purpose, mimeType: file.type, size: bytes.length } });
  return { id, name: clean(file.name, 180) };
}

export async function readChallengeFile(fileId: string) {
  const file = db().prepare("SELECT * FROM member_challenge_files WHERE id = ? AND deleted_at IS NULL").get(fileId) as Record<string, string | number | null> | undefined;
  if (!file) throw new Error("Arquivo não encontrado.");
  const encrypted = await readFile(path.join(privateRoot(), path.basename(String(file.storage_name))));
  const decipher = createDecipheriv("aes-256-gcm", challengeSecret(), Buffer.from(String(file.encryption_iv), "base64url"));
  decipher.setAuthTag(Buffer.from(String(file.encryption_tag), "base64url"));
  const bytes = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return { file, bytes };
}

export function canMemberAccessChallengeFile(accountId: string, fileId: string) {
  return Boolean(db().prepare("SELECT id FROM member_challenge_files WHERE id = ? AND account_id = ? AND deleted_at IS NULL").get(fileId, accountId));
}

export function logChallengeFileAccess(fileId: string, accountId: string | null, actor: string, ip?: string) {
  audit({ actor, accountId, entityType: "challenge_file", entityId: fileId, action: "FILE_ACCESSED", ip });
}

function assertOwnedFile(accountId: string, fileId: string, purpose: string) {
  const row = db().prepare("SELECT id FROM member_challenge_files WHERE id = ? AND account_id = ? AND purpose = ? AND deleted_at IS NULL").get(fileId, accountId, purpose);
  if (!row) throw new Error("Arquivo inválido ou não autorizado.");
}

function upsertSubmission(input: { accountId: string; type: "SCHOOL" | "ATTENDANCE"; period: string; data: Record<string, unknown>; fileId: string; ip?: string }) {
  accountOrThrow(input.accountId);
  const database = db();
  const challengeId = challengeKey(input.type);
  const existing = database.prepare("SELECT * FROM member_challenge_submissions WHERE challenge_id = ? AND account_id = ? AND period_reference = ?").get(challengeId, input.accountId, input.period) as Record<string, unknown> | undefined;
  if (existing && ["APPROVED", "COMPLETED"].includes(String(existing.status))) throw new Error("Já existe uma submissão aprovada para este período.");
  const timestamp = now();
  const id = existing ? String(existing.id) : randomUUID();
  database.exec("BEGIN IMMEDIATE;");
  try {
    if (existing) {
      database.prepare(
        `UPDATE member_challenge_submissions SET status = 'SUBMITTED', submitted_data_json = ?, file_id = ?, submitted_at = ?,
         reviewed_at = NULL, reviewed_by = NULL, review_notes = NULL, updated_at = ? WHERE id = ?`
      ).run(JSON.stringify(input.data), input.fileId, timestamp, timestamp, id);
      database.prepare("DELETE FROM member_challenge_ai_analyses WHERE submission_id = ?").run(id);
    } else {
      database.prepare(
        `INSERT INTO member_challenge_submissions
          (id, challenge_id, account_id, period_reference, status, submitted_data_json, file_id, submitted_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'SUBMITTED', ?, ?, ?, ?, ?)`
      ).run(id, challengeId, input.accountId, input.period, JSON.stringify(input.data), input.fileId, timestamp, timestamp, timestamp);
    }
    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
  audit({ actor: `member:${input.accountId}`, accountId: input.accountId, entityType: "challenge_submission", entityId: id, action: existing ? "SUBMISSION_REPLACED" : "SUBMISSION_CREATED", before: existing, after: input.data, ip: input.ip });
  notify(input.accountId, "DOCUMENT_RECEIVED", "Documento recebido", input.type === "SCHOOL" ? "Seu boletim foi recebido e seguirá para análise." : "Sua planilha de assiduidade foi recebida e seguirá para validação.", "challenge_submission", id);
  awardBadge(input.accountId, input.type === "SCHOOL" ? "badge-first-report" : "badge-first-plan", "submission", id);
  syncScore(input.accountId, "submission");
  return id;
}

export function submitSchoolChallenge(accountId: string, input: { quarter: number; year: number; fileId: string; observation?: string; guardianAccepted: boolean }, ip?: string) {
  if (!Number.isInteger(input.quarter) || input.quarter < 1 || input.quarter > 4) throw new Error("Selecione um trimestre válido.");
  if (!Number.isInteger(input.year) || input.year < 2025 || input.year > 2030) throw new Error("Selecione um ano letivo válido.");
  if (!input.guardianAccepted) throw new Error("O responsável deve autorizar a análise do boletim.");
  assertOwnedFile(accountId, input.fileId, "SCHOOL_REPORT");
  const period = `${input.year}-T${input.quarter}`;
  return upsertSubmission({ accountId, type: "SCHOOL", period, fileId: input.fileId, data: { quarter: input.quarter, year: input.year, observation: clean(input.observation, 800), guardianAcceptedAt: now() }, ip });
}

export function submitAttendanceChallenge(accountId: string, input: { month: number; year: number; fileId: string; attendance: number; observation?: string; truthAccepted: boolean }, ip?: string) {
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) throw new Error("Selecione um mês válido.");
  if (!Number.isInteger(input.year) || input.year < 2025 || input.year > 2030) throw new Error("Selecione um ano válido.");
  if (!Number.isInteger(input.attendance) || input.attendance < 0 || input.attendance > 100 || input.attendance % 10 !== 0) throw new Error("A assiduidade deve ser informada em intervalos de 10%.");
  if (!input.truthAccepted) throw new Error("Confirme que as informações são verdadeiras.");
  assertOwnedFile(accountId, input.fileId, "ATTENDANCE_PLAN");
  const period = `${input.year}-${String(input.month).padStart(2, "0")}`;
  const band = benefitFor(input.attendance, getChallengeSettings().attendanceBands);
  return upsertSubmission({ accountId, type: "ATTENDANCE", period, fileId: input.fileId, data: { month: input.month, year: input.year, attendance: input.attendance, observation: clean(input.observation, 800), truthAcceptedAt: now(), suggestedBenefitPercent: band.benefit }, ip });
}

export function submitChallengeIdea(accountId: string, input: { title: string; category: string; description: string; problem: string; expectedImprovement: string; imageFileId?: string }, ip?: string) {
  accountOrThrow(accountId);
  if (!ideaCategories.includes(input.category as (typeof ideaCategories)[number])) throw new Error("Selecione uma categoria válida.");
  const values = {
    title: clean(input.title, 120),
    category: input.category,
    description: clean(input.description, 1800),
    problem: clean(input.problem, 1200),
    expectedImprovement: clean(input.expectedImprovement, 1200)
  };
  if (values.title.length < 5 || values.description.length < 20 || values.problem.length < 10 || values.expectedImprovement.length < 10) throw new Error("Detalhe melhor sua ideia, o problema e a melhoria esperada.");
  if (input.imageFileId) assertOwnedFile(accountId, input.imageFileId, "IDEA_IMAGE");
  const settings = getChallengeSettings();
  const recent = db().prepare("SELECT COUNT(*) AS total FROM member_challenge_ideas WHERE account_id = ? AND datetime(created_at) >= datetime('now', '-7 days')").get(accountId) as { total: number };
  if (recent.total >= settings.ideaLimitPerWeek) throw new Error(`Limite de ${settings.ideaLimitPerWeek} ideias por semana atingido.`);
  const id = randomUUID();
  const timestamp = now();
  db().prepare(
    `INSERT INTO member_challenge_ideas
      (id, account_id, title, category, description, problem, expected_improvement, image_file_id, status, score_valid, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', 0, ?, ?)`
  ).run(id, accountId, values.title, values.category, values.description, values.problem, values.expectedImprovement, input.imageFileId || null, timestamp, timestamp);
  audit({ actor: `member:${accountId}`, accountId, entityType: "challenge_idea", entityId: id, action: "IDEA_SUBMITTED", after: values, ip });
  notify(accountId, "IDEA_SUBMITTED", "Ideia enviada", "Sua contribuição foi recebida e será analisada pela equipe.", "challenge_idea", id);
  awardBadge(accountId, "badge-first-idea", "idea", id);
  syncScore(accountId, "idea-submitted");
  return id;
}

function normalizeName(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLocaleLowerCase("pt-BR");
}

function validEvolutionMarks(accountId: string) {
  const database = db();
  const account = accountOrThrow(accountId);
  const memberRows = database.prepare(
    `SELECT id, time, date, location FROM member_marks
     WHERE account_id = ? AND lower(replace(replace(event, '.', ''), ' ', '')) IN ('1000m', '1000')
       AND lower(status) NOT LIKE '%reprov%' AND lower(status) NOT LIKE '%invalid%' AND lower(status) NOT LIKE '%duplic%' AND lower(status) NOT LIKE '%exclu%'`
  ).all(accountId) as Array<{ id: string; time: string; date: string; location: string }>;
  const targetNames = new Set([account.name, account.athlete_name || ""].map(normalizeName).filter(Boolean));
  const rankingRows = (database.prepare("SELECT id, athlete_name, time, date, location FROM rankings WHERE lower(replace(replace(event, '.', ''), ' ', '')) IN ('1000m', '1000')").all() as Array<{ id: string; athlete_name: string; time: string; date: string; location: string }>).filter((row) => targetNames.has(normalizeName(row.athlete_name)));
  const unique = new Map<string, { id: string; time: string; date: string; location: string; seconds: number }>();
  [...memberRows, ...rankingRows].forEach((row) => {
    const seconds = parseMemberMarkTime(row.time);
    if (seconds === null || seconds <= 0) return;
    const key = `${seconds}|${row.date}|${normalizeName(row.location)}`;
    if (!unique.has(key)) unique.set(key, { ...row, seconds });
  });
  return [...unique.values()].sort((a, b) => a.date.localeCompare(b.date) || a.seconds - b.seconds);
}

function evolutionSummary(accountId: string) {
  const marks = validEvolutionMarks(accountId);
  if (!marks.length) return { marks: [], totalTests: 0, firstTime: null, latestTime: null, bestTime: null, bestDate: null, evolutionFromFirst: null, evolutionLastTwo: null, differenceSeconds: null, trend: "EMPTY" };
  const first = marks[0];
  const latest = marks[marks.length - 1];
  const previous = marks.length > 1 ? marks[marks.length - 2] : null;
  const best = [...marks].sort((a, b) => a.seconds - b.seconds)[0];
  const percent = (from: number, to: number) => Number((((from - to) / from) * 100).toFixed(2));
  return {
    marks,
    totalTests: marks.length,
    firstTime: first.time,
    latestTime: latest.time,
    bestTime: best.time,
    bestDate: best.date,
    evolutionFromFirst: marks.length > 1 ? percent(first.seconds, best.seconds) : null,
    evolutionLastTwo: previous ? percent(previous.seconds, latest.seconds) : null,
    differenceSeconds: previous ? Number((previous.seconds - latest.seconds).toFixed(2)) : null,
    trend: marks.length < 2 ? "FIRST" : latest.seconds < previous!.seconds ? "IMPROVING" : latest.seconds === previous!.seconds ? "STABLE" : "CONSISTENT"
  };
}

function awardBadge(accountId: string, badgeId: string, sourceType: string, sourceId?: string) {
  const exists = db().prepare("SELECT id FROM member_athlete_badges WHERE account_id = ? AND badge_id = ?").get(accountId, badgeId);
  if (exists) return false;
  const badge = db().prepare("SELECT name FROM member_challenge_badges WHERE id = ? AND active = 1").get(badgeId) as { name: string } | undefined;
  if (!badge) return false;
  const id = randomUUID();
  db().prepare("INSERT INTO member_athlete_badges (id, account_id, badge_id, source_type, source_id, earned_at) VALUES (?, ?, ?, ?, ?, ?)").run(id, accountId, badgeId, sourceType, sourceId ?? null, now());
  notify(accountId, "BADGE_EARNED", "Nova conquista", `Você desbloqueou o badge ${badge.name}.`, "athlete_badge", id);
  audit({ actor: "system:challenges", accountId, entityType: "athlete_badge", entityId: id, action: "BADGE_AWARDED", after: { badgeId, sourceType, sourceId } });
  return true;
}

function syncEvolutionBadges(accountId: string) {
  const evolution = evolutionSummary(accountId);
  if (evolution.totalTests >= 1) awardBadge(accountId, "badge-first-test", "evolution");
  if ((evolution.evolutionFromFirst ?? 0) > 0) awardBadge(accountId, "badge-first-evolution", "evolution");
  if ((evolution.evolutionFromFirst ?? 0) >= 5) awardBadge(accountId, "badge-evolution-5", "evolution");
  if ((evolution.evolutionFromFirst ?? 0) >= 10) awardBadge(accountId, "badge-evolution-10", "evolution");
  if (evolution.totalTests >= 2 && evolution.bestTime === evolution.latestTime) awardBadge(accountId, "badge-personal-record", "evolution");
  if (evolution.totalTests >= 5) awardBadge(accountId, "badge-five-tests", "evolution");
  return evolution;
}

function attendanceStats(accountId: string) {
  const rows = db().prepare(
    `SELECT period_reference, submitted_data_json FROM member_challenge_submissions
     WHERE account_id=? AND challenge_id='challenge-attendance' AND status IN ('APPROVED','COMPLETED')
     ORDER BY period_reference ASC`
  ).all(accountId) as Array<{ period_reference: string; submitted_data_json: string }>;
  const entries = rows.map((row) => {
    const submitted = safeJson<Record<string, unknown>>(row.submitted_data_json, {});
    return { period: row.period_reference, attendance: Number(submitted.approvedValue ?? submitted.attendance ?? 0) };
  });
  let streak = entries.length ? 1 : 0;
  for (let index = entries.length - 1; index > 0; index -= 1) {
    const current = new Date(`${entries[index].period}-01T12:00:00Z`);
    const previous = new Date(`${entries[index - 1].period}-01T12:00:00Z`);
    const distance = (current.getUTCFullYear() - previous.getUTCFullYear()) * 12 + current.getUTCMonth() - previous.getUTCMonth();
    if (distance !== 1) break;
    streak += 1;
  }
  return { approvedMonths: entries.length, currentStreak: streak, bestAttendance: entries.length ? Math.max(...entries.map((entry) => entry.attendance)) : null };
}

function scoreLevel(score: number) {
  const levels = [
    { min: 0, name: "Começando a Jornada" },
    { min: 100, name: "Atleta em Evolução" },
    { min: 250, name: "Compromisso 11RUN" },
    { min: 450, name: "Destaque do Projeto" },
    { min: 700, name: "Inspiração 11RUN" }
  ];
  const index = levels.findLastIndex((level) => score >= level.min);
  const current = levels[Math.max(index, 0)];
  const next = levels[index + 1];
  return { name: current.name, next: next?.name ?? null, pointsToNext: next ? Math.max(0, next.min - score) : 0 };
}

function calculateScore(accountId: string) {
  const settings = getChallengeSettings();
  const database = db();
  const submissions = database.prepare("SELECT status FROM member_challenge_submissions WHERE account_id = ?").all(accountId) as Array<{ status: string }>;
  const ideas = database.prepare("SELECT score_valid, status FROM member_challenge_ideas WHERE account_id = ?").all(accountId) as Array<{ score_valid: number; status: string }>;
  const badges = (database.prepare("SELECT COUNT(*) AS total FROM member_athlete_badges WHERE account_id = ?").get(accountId) as { total: number }).total;
  const evolution = evolutionSummary(accountId);
  const submitted = submissions.length;
  const approved = submissions.filter((row) => ["APPROVED", "COMPLETED"].includes(row.status)).length;
  const validIdeas = ideas.filter((row) => row.score_valid).length;
  const implemented = ideas.filter((row) => row.status === "IMPLEMENTED").length;
  const raw = submitted * settings.scoreWeights.submission
    + approved * settings.scoreWeights.approval
    + validIdeas * settings.scoreWeights.validIdea
    + implemented * settings.scoreWeights.implementedIdea
    + Math.min(evolution.totalTests, 5) * settings.scoreWeights.validTest
    + ((evolution.evolutionFromFirst ?? 0) > 0 ? settings.scoreWeights.personalEvolution : 0)
    + Math.min(badges, 10) * settings.scoreWeights.badge;
  const score = Math.min(1000, Math.round(raw));
  return { score, ...scoreLevel(score) };
}

function syncScore(accountId: string, source: string) {
  const score = calculateScore(accountId);
  const latest = db().prepare("SELECT score, level FROM member_challenge_score_history WHERE account_id = ? ORDER BY datetime(created_at) DESC LIMIT 1").get(accountId) as { score: number; level: string } | undefined;
  if (!latest || latest.score !== score.score || latest.level !== score.name) {
    db().prepare("INSERT INTO member_challenge_score_history (id, account_id, score, level, source, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(randomUUID(), accountId, score.score, score.name, source, JSON.stringify({ pointsToNext: score.pointsToNext }), now());
  }
  return score;
}

function currentAidValue(accountId: string) {
  const account = accountOrThrow(accountId);
  const row = db().prepare(
    `SELECT amount_cents FROM financial_records
     WHERE lead_id = ? AND direction = 'saida' AND (lower(type) LIKE '%ajuda%' OR lower(type) LIKE '%bolsa%')
     ORDER BY datetime(COALESCE(paid_date, due_date, created_at)) DESC LIMIT 1`
  ).get(account.lead_id) as { amount_cents: number } | undefined;
  return row?.amount_cents ?? 0;
}

function benefitProjection(accountId: string) {
  const current = currentAidValue(accountId);
  const approved = db().prepare(
    `SELECT * FROM member_challenge_benefits WHERE account_id = ? AND status = 'APPROVED'
     AND (valid_until IS NULL OR date(valid_until) >= date('now')) ORDER BY datetime(created_at) DESC`
  ).all(accountId) as Array<Record<string, string | number | null>>;
  const latestByType = new Map<string, Record<string, string | number | null>>();
  approved.forEach((row) => { if (!latestByType.has(String(row.source_type))) latestByType.set(String(row.source_type), row); });
  const school = Number(latestByType.get("SCHOOL")?.percentage ?? 0);
  const attendance = Number(latestByType.get("ATTENDANCE")?.percentage ?? 0);
  const total = Math.min(getChallengeSettings().maximumCombinedBenefit, school + attendance);
  return { currentValueCents: current, schoolPercent: school, attendancePercent: attendance, totalPercent: total, projectedValueCents: Math.round(current * (1 + total / 100)), applicationDate: approved.find((row) => row.valid_from)?.valid_from ?? null };
}

function ideaStats(accountId: string) {
  const rows = db().prepare("SELECT id, title, category, status, score_valid, admin_response, implemented_at, created_at FROM member_challenge_ideas WHERE account_id = ? ORDER BY datetime(created_at) DESC").all(accountId) as Array<Record<string, string | number | null>>;
  const count = (status: string) => rows.filter((row) => row.status === status).length;
  const ranking = db().prepare(
    `SELECT account_id, COUNT(*) AS total FROM member_challenge_ideas WHERE score_valid=1
     GROUP BY account_id ORDER BY total DESC, MIN(datetime(created_at)) ASC`
  ).all() as Array<{ account_id: string; total: number }>;
  const rankingIndex = ranking.findIndex((row) => row.account_id === accountId);
  return { rows, total: rows.length, valid: rows.filter((row) => row.score_valid).length, approved: count("APPROVED"), developing: count("IN_DEVELOPMENT"), implemented: count("IMPLEMENTED"), position: rankingIndex >= 0 ? rankingIndex + 1 : null };
}

function challengeStatus(latest: Record<string, unknown> | undefined) {
  return latest ? String(latest.status) : "NOT_STARTED";
}

export function getMemberChallengesDashboard(accountId: string) {
  accountOrThrow(accountId);
  const evolution = syncEvolutionBadges(accountId);
  const score = syncScore(accountId, "dashboard-sync");
  const submissions = db().prepare(
    `SELECT s.*, d.type, d.name, a.confidence_score, a.normalized_data_json, a.suggested_benefit_percent, a.processing_status
     FROM member_challenge_submissions s
     JOIN member_challenge_definitions d ON d.id = s.challenge_id
     LEFT JOIN member_challenge_ai_analyses a ON a.submission_id = s.id
     WHERE s.account_id = ? ORDER BY datetime(s.submitted_at) DESC`
  ).all(accountId) as Array<Record<string, unknown>>;
  const school = submissions.find((row) => row.type === "SCHOOL");
  const attendance = submissions.find((row) => row.type === "ATTENDANCE");
  const ideas = ideaStats(accountId);
  const earnedBadges = db().prepare(
    `SELECT b.id, b.slug, b.name, b.description, b.challenge_type, b.icon, ab.earned_at
     FROM member_athlete_badges ab JOIN member_challenge_badges b ON b.id = ab.badge_id
     WHERE ab.account_id = ? ORDER BY datetime(ab.earned_at) DESC`
  ).all(accountId);
  const allBadges = db().prepare("SELECT id, slug, name, description, challenge_type, icon FROM member_challenge_badges WHERE active = 1 ORDER BY challenge_type, name").all();
  const notifications = db().prepare("SELECT * FROM member_challenge_notifications WHERE account_id = ? ORDER BY datetime(created_at) DESC LIMIT 20").all(accountId);
  const history = db().prepare("SELECT score, level, source, created_at FROM member_challenge_score_history WHERE account_id = ? ORDER BY datetime(created_at) DESC LIMIT 12").all(accountId);
  return {
    score,
    benefit: benefitProjection(accountId),
    settings: { maximumCombinedBenefit: getChallengeSettings().maximumCombinedBenefit, ideaLimitPerWeek: getChallengeSettings().ideaLimitPerWeek, ideaCycle: getChallengeSettings().ideaCycle },
    cards: {
      school: { status: challengeStatus(school), latest: school ? { ...school, submitted_data: safeJson(String(school.submitted_data_json ?? "{}"), {}), normalized_data: safeJson(String(school.normalized_data_json ?? "{}"), {}) } : null },
      attendance: { status: challengeStatus(attendance), latest: attendance ? { ...attendance, submitted_data: safeJson(String(attendance.submitted_data_json ?? "{}"), {}) } : null, ...attendanceStats(accountId) },
      evolution: { status: evolution.totalTests ? (evolution.totalTests > 1 ? "IN_PROGRESS" : "SUBMITTED") : "NOT_STARTED", ...evolution },
      ideas: { status: ideas.total ? "IN_PROGRESS" : "NOT_STARTED", ...ideas }
    },
    badges: { earned: earnedBadges, all: allBadges },
    notifications,
    history,
    submissions: submissions.map((row) => ({ ...row, submitted_data: safeJson(String(row.submitted_data_json ?? "{}"), {}) })),
    ideaRanking: challengeIdeasPublicRanking(),
    ideaCategories: [...ideaCategories]
  };
}

export function saveSchoolAiAnalysis(submissionId: string, input: { model: string; extracted: unknown; normalized: unknown; confidence: number; warnings: string[]; suggestedScore: number; suggestedBenefit: number; status: string }) {
  const submission = db().prepare("SELECT account_id FROM member_challenge_submissions WHERE id = ?").get(submissionId) as { account_id: string } | undefined;
  if (!submission) throw new Error("Submissão não encontrada.");
  const id = randomUUID();
  db().prepare(
    `INSERT INTO member_challenge_ai_analyses
      (id, submission_id, model, extracted_data_json, normalized_data_json, confidence_score, warnings_json, suggested_score, suggested_benefit_percent, rules_version, processing_status, processed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'challenge-rules-1.0', ?, ?)
     ON CONFLICT(submission_id) DO UPDATE SET model=excluded.model, extracted_data_json=excluded.extracted_data_json,
       normalized_data_json=excluded.normalized_data_json, confidence_score=excluded.confidence_score, warnings_json=excluded.warnings_json,
       suggested_score=excluded.suggested_score, suggested_benefit_percent=excluded.suggested_benefit_percent,
       rules_version=excluded.rules_version, processing_status=excluded.processing_status, processed_at=excluded.processed_at`
  ).run(id, submissionId, input.model, JSON.stringify(input.extracted), JSON.stringify(input.normalized), input.confidence, JSON.stringify(input.warnings), input.suggestedScore, input.suggestedBenefit, input.status, now());
  const reviewStatus = input.confidence >= getChallengeSettings().aiConfidenceThreshold && input.status === "COMPLETED" ? "UNDER_REVIEW" : "UNDER_REVIEW";
  db().prepare("UPDATE member_challenge_submissions SET status = ?, updated_at = ? WHERE id = ?").run(reviewStatus, now(), submissionId);
  audit({ actor: "system:openai", accountId: submission.account_id, entityType: "challenge_submission", entityId: submissionId, action: "AI_ANALYSIS_COMPLETED", after: { confidence: input.confidence, warnings: input.warnings, suggestedBenefit: input.suggestedBenefit } });
  notify(submission.account_id, "DOCUMENT_ANALYZED", "Análise concluída", input.confidence >= getChallengeSettings().aiConfidenceThreshold ? "A leitura assistiva foi concluída e aguarda aprovação da equipe." : "A leitura precisa de revisão humana antes da aprovação.", "challenge_submission", submissionId);
}

export function markSchoolAiFailure(submissionId: string, model: string, message: string) {
  const submission = db().prepare("SELECT account_id FROM member_challenge_submissions WHERE id = ?").get(submissionId) as { account_id: string } | undefined;
  if (!submission) return;
  saveSchoolAiAnalysis(submissionId, { model, extracted: {}, normalized: {}, confidence: 0, warnings: [clean(message, 300)], suggestedScore: 0, suggestedBenefit: 0, status: "FAILED" });
}

export function getSchoolSubmissionForAi(submissionId: string) {
  return db().prepare(
    `SELECT s.id, s.account_id, s.file_id, s.period_reference, s.submitted_data_json, f.mime_type, f.original_name
     FROM member_challenge_submissions s JOIN member_challenge_files f ON f.id = s.file_id
     WHERE s.id = ? AND s.challenge_id = 'challenge-school'`
  ).get(submissionId) as { id: string; account_id: string; file_id: string; period_reference: string; submitted_data_json: string; mime_type: string; original_name: string } | undefined;
}

function createOrUpdateBenefit(accountId: string, sourceType: "SCHOOL" | "ATTENDANCE", sourceId: string, percentage: number) {
  const current = currentAidValue(accountId);
  const timestamp = now();
  const submission = db().prepare("SELECT period_reference FROM member_challenge_submissions WHERE id=?").get(sourceId) as { period_reference: string } | undefined;
  let validFrom: string | null = timestamp.slice(0, 10);
  let validUntil: string | null = null;
  if (submission && sourceType === "SCHOOL") {
    const match = /^(\d{4})-T([1-4])$/.exec(submission.period_reference);
    if (match) {
      const end = new Date(Date.UTC(Number(match[1]), Number(match[2]) * 3 + 3, 0));
      validUntil = end.toISOString().slice(0, 10);
    }
  } else if (submission) {
    const [year, month] = submission.period_reference.split("-").map(Number);
    validFrom = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
    validUntil = new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
  }
  db().prepare(
    `INSERT INTO member_challenge_benefits
      (id, account_id, source_type, source_id, percentage, previous_value_cents, projected_value_cents, status, valid_from, valid_until, rule_snapshot_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_APPROVAL', ?, ?, ?, ?, ?)
     ON CONFLICT(source_type, source_id) DO UPDATE SET percentage=excluded.percentage, previous_value_cents=excluded.previous_value_cents,
        projected_value_cents=excluded.projected_value_cents, status='PENDING_APPROVAL', approved_by=NULL, approved_at=NULL,
        valid_from=excluded.valid_from, valid_until=excluded.valid_until, rule_snapshot_json=excluded.rule_snapshot_json, updated_at=excluded.updated_at`
  ).run(randomUUID(), accountId, sourceType, sourceId, percentage, current, Math.round(current * (1 + percentage / 100)), validFrom, validUntil, JSON.stringify(getChallengeSettings()), timestamp, timestamp);
}

function awardSubmissionBadges(accountId: string, type: string, value: number, sourceId: string) {
  if (type === "SCHOOL") {
    if (value >= 7) awardBadge(accountId, "badge-grade-7", "submission", sourceId);
    if (value >= 8) awardBadge(accountId, "badge-academic-highlight", "submission", sourceId);
    if (value >= 9) awardBadge(accountId, "badge-golden-report", "submission", sourceId);
  } else {
    if (value >= 70) awardBadge(accountId, "badge-consistency-70", "submission", sourceId);
    if (value >= 90) awardBadge(accountId, "badge-discipline-90", "submission", sourceId);
    if (value >= 100) awardBadge(accountId, "badge-perfect-month", "submission", sourceId);
    const attendance = attendanceStats(accountId);
    if (attendance.currentStreak >= 3) awardBadge(accountId, "badge-attendance-3", "submission", sourceId);
    if (attendance.currentStreak >= 6) awardBadge(accountId, "badge-attendance-6", "submission", sourceId);
  }
}

export function getChallengeAdminData(filters: { status?: string; type?: string; accountId?: string } = {}) {
  const where = ["1=1"];
  const params: string[] = [];
  if (filters.status) { where.push("s.status = ?"); params.push(filters.status); }
  if (filters.type) { where.push("d.type = ?"); params.push(filters.type); }
  if (filters.accountId) { where.push("s.account_id = ?"); params.push(filters.accountId); }
  const submissions = db().prepare(
    `SELECT s.*, d.type, d.name AS challenge_name, a.username, COALESCE(l.athlete_name, l.name) AS athlete_name,
            f.original_name, f.mime_type, ai.model, ai.extracted_data_json, ai.normalized_data_json,
            ai.confidence_score, ai.warnings_json, ai.suggested_score, ai.suggested_benefit_percent, ai.processing_status
     FROM member_challenge_submissions s
     JOIN member_challenge_definitions d ON d.id=s.challenge_id
     JOIN member_accounts a ON a.id=s.account_id
     JOIN leads l ON l.id=a.lead_id
     LEFT JOIN member_challenge_files f ON f.id=s.file_id
     LEFT JOIN member_challenge_ai_analyses ai ON ai.submission_id=s.id
     WHERE ${where.join(" AND ")} ORDER BY datetime(s.submitted_at) DESC`
  ).all(...params).map((row) => {
    const item = row as Record<string, unknown>;
    return { ...item, submitted_data: safeJson(String(item.submitted_data_json ?? "{}"), {}), normalized_data: safeJson(String(item.normalized_data_json ?? "{}"), {}), warnings: safeJson(String(item.warnings_json ?? "[]"), []) };
  });
  const ideas = db().prepare(
    `SELECT i.*, a.username, COALESCE(l.athlete_name, l.name) AS athlete_name
     FROM member_challenge_ideas i JOIN member_accounts a ON a.id=i.account_id JOIN leads l ON l.id=a.lead_id
     ORDER BY datetime(i.created_at) DESC`
  ).all();
  const benefits = db().prepare(
    `SELECT b.*, COALESCE(l.athlete_name, l.name) AS athlete_name
     FROM member_challenge_benefits b JOIN member_accounts a ON a.id=b.account_id JOIN leads l ON l.id=a.lead_id
     ORDER BY datetime(b.created_at) DESC`
  ).all();
  const accounts = db().prepare("SELECT a.id, a.username, COALESCE(l.athlete_name, l.name) AS athlete_name FROM member_accounts a JOIN leads l ON l.id=a.lead_id WHERE a.active=1 ORDER BY athlete_name").all() as Array<{ id: string; username: string; athlete_name: string }>;
  const athleteOverview = accounts.map((account) => ({
    ...account,
    score: calculateScore(account.id),
    evolution: evolutionSummary(account.id),
    benefit: benefitProjection(account.id),
  }));
  const audits = db().prepare("SELECT * FROM member_challenge_audit_logs ORDER BY datetime(created_at) DESC LIMIT 300").all();
  const metrics = {
    pending: (db().prepare("SELECT COUNT(*) AS total FROM member_challenge_submissions WHERE status IN ('SUBMITTED','UNDER_REVIEW','CORRECTION_REQUESTED')").get() as { total: number }).total,
    approved: (db().prepare("SELECT COUNT(*) AS total FROM member_challenge_submissions WHERE status IN ('APPROVED','COMPLETED')").get() as { total: number }).total,
    ideas: (db().prepare("SELECT COUNT(*) AS total FROM member_challenge_ideas").get() as { total: number }).total,
    benefitsPending: (db().prepare("SELECT COUNT(*) AS total FROM member_challenge_benefits WHERE status='PENDING_APPROVAL'").get() as { total: number }).total
  };
  return { metrics, submissions, ideas, benefits, accounts, athleteOverview, audits, settings: getChallengeSettings(), badges: db().prepare("SELECT * FROM member_challenge_badges ORDER BY challenge_type,name").all() };
}

export function reviewChallengeSubmission(input: { id: string; status: string; correctedValue?: number; notes?: string; actor: string; ip?: string }) {
  const allowed = ["UNDER_REVIEW", "CORRECTION_REQUESTED", "APPROVED", "REJECTED", "COMPLETED"];
  if (!allowed.includes(input.status)) throw new Error("Status de revisão inválido.");
  const database = db();
  const current = database.prepare(
    `SELECT s.*, d.type, ai.normalized_data_json, ai.suggested_benefit_percent FROM member_challenge_submissions s
     JOIN member_challenge_definitions d ON d.id=s.challenge_id LEFT JOIN member_challenge_ai_analyses ai ON ai.submission_id=s.id WHERE s.id=?`
  ).get(input.id) as Record<string, unknown> | undefined;
  if (!current) throw new Error("Submissão não encontrada.");
  const data = safeJson<Record<string, unknown>>(String(current.submitted_data_json ?? "{}"), {});
  let value = Number(input.correctedValue);
  if (!Number.isFinite(value)) {
    if (current.type === "SCHOOL") value = Number(safeJson<Record<string, unknown>>(String(current.normalized_data_json ?? "{}"), {}).average ?? 0);
    else value = Number(data.attendance ?? 0);
  }
  if (current.type === "SCHOOL" && (value < 0 || value > 10)) throw new Error("Informe uma média entre 0 e 10.");
  if (current.type === "ATTENDANCE" && (value < 0 || value > 100 || value % 10 !== 0)) throw new Error("Informe assiduidade entre 0 e 100, em intervalos de 10%.");
  const settings = getChallengeSettings();
  const band = benefitFor(value, current.type === "SCHOOL" ? settings.schoolBands : settings.attendanceBands);
  const updatedData = { ...data, approvedValue: value, approvedBenefitPercent: band.benefit };
  const timestamp = now();
  database.exec("BEGIN IMMEDIATE;");
  try {
    database.prepare("UPDATE member_challenge_submissions SET status=?, submitted_data_json=?, reviewed_at=?, reviewed_by=?, review_notes=?, updated_at=? WHERE id=?")
      .run(input.status, JSON.stringify(updatedData), timestamp, input.actor, clean(input.notes, 1200) || null, timestamp, input.id);
    if (["APPROVED", "COMPLETED"].includes(input.status)) createOrUpdateBenefit(String(current.account_id), current.type as "SCHOOL" | "ATTENDANCE", input.id, band.benefit);
    database.exec("COMMIT;");
  } catch (error) {
    database.exec("ROLLBACK;");
    throw error;
  }
  audit({ actor: input.actor, accountId: String(current.account_id), entityType: "challenge_submission", entityId: input.id, action: `STATUS_${input.status}`, before: current, after: updatedData, justification: input.notes, ip: input.ip });
  if (["APPROVED", "COMPLETED"].includes(input.status)) {
    notify(String(current.account_id), "DOCUMENT_APPROVED", "Desafio aprovado", `Sua entrega foi aprovada. Benefício sugerido: ${band.benefit}%. A aplicação financeira ainda depende de aprovação final.`, "challenge_submission", input.id);
    awardSubmissionBadges(String(current.account_id), String(current.type), value, input.id);
  } else if (input.status === "CORRECTION_REQUESTED") {
    notify(String(current.account_id), "CORRECTION_REQUESTED", "Correção solicitada", clean(input.notes, 500) || "A equipe solicitou uma nova versão do documento.", "challenge_submission", input.id);
  } else if (input.status === "REJECTED") {
    notify(String(current.account_id), "DOCUMENT_REJECTED", "Entrega revisada", clean(input.notes, 500) || "A entrega não pôde ser aprovada neste ciclo.", "challenge_submission", input.id);
  }
  syncScore(String(current.account_id), "submission-review");
  return database.prepare("SELECT * FROM member_challenge_submissions WHERE id=?").get(input.id);
}

export function reviewChallengeIdea(input: { id: string; status: string; response?: string; actor: string; ip?: string }) {
  const allowed = ["SUBMITTED", "UNDER_REVIEW", "APPROVED", "PLANNING", "IN_DEVELOPMENT", "IMPLEMENTED", "REJECTED", "DUPLICATE"];
  if (!allowed.includes(input.status)) throw new Error("Status da ideia inválido.");
  const current = db().prepare("SELECT * FROM member_challenge_ideas WHERE id=?").get(input.id) as Record<string, unknown> | undefined;
  if (!current) throw new Error("Ideia não encontrada.");
  const valid = ["APPROVED", "PLANNING", "IN_DEVELOPMENT", "IMPLEMENTED"].includes(input.status) ? 1 : 0;
  const timestamp = now();
  db().prepare("UPDATE member_challenge_ideas SET status=?, score_valid=?, admin_response=?, implemented_at=?, updated_at=? WHERE id=?")
    .run(input.status, valid, clean(input.response, 1200) || null, input.status === "IMPLEMENTED" ? timestamp : typeof current.implemented_at === "string" ? current.implemented_at : null, timestamp, input.id);
  audit({ actor: input.actor, accountId: String(current.account_id), entityType: "challenge_idea", entityId: input.id, action: `IDEA_${input.status}`, before: current, after: { status: input.status, valid, response: input.response }, justification: input.response, ip: input.ip });
  notify(String(current.account_id), input.status === "IMPLEMENTED" ? "IDEA_IMPLEMENTED" : "IDEA_UPDATED", input.status === "IMPLEMENTED" ? "Sua ideia virou realidade" : "Sua ideia foi atualizada", clean(input.response, 500) || `Novo status: ${input.status}.`, "challenge_idea", input.id);
  if (valid) {
    awardBadge(String(current.account_id), "badge-valid-idea", "idea", input.id);
    const total = (db().prepare("SELECT COUNT(*) AS total FROM member_challenge_ideas WHERE account_id=? AND score_valid=1").get(String(current.account_id)) as { total: number }).total;
    if (total >= 5) awardBadge(String(current.account_id), "badge-five-ideas", "idea", input.id);
    if (total >= 10) awardBadge(String(current.account_id), "badge-ten-ideas", "idea", input.id);
  }
  if (input.status === "IMPLEMENTED") awardBadge(String(current.account_id), "badge-implemented-idea", "idea", input.id);
  syncScore(String(current.account_id), "idea-review");
}

export function reviewChallengeBenefit(input: { id: string; approved: boolean; validFrom?: string; validUntil?: string; notes?: string; actor: string; ip?: string }) {
  const current = db().prepare("SELECT * FROM member_challenge_benefits WHERE id=?").get(input.id) as Record<string, unknown> | undefined;
  if (!current) throw new Error("Benefício não encontrado.");
  const status = input.approved ? "APPROVED" : "REJECTED";
  const timestamp = now();
  db().prepare("UPDATE member_challenge_benefits SET status=?, valid_from=?, valid_until=?, approved_by=?, approved_at=?, updated_at=? WHERE id=?")
    .run(status, input.validFrom || (typeof current.valid_from === "string" ? current.valid_from : null), input.validUntil || (typeof current.valid_until === "string" ? current.valid_until : null), input.actor, input.approved ? timestamp : null, timestamp, input.id);
  audit({ actor: input.actor, accountId: String(current.account_id), entityType: "challenge_benefit", entityId: input.id, action: `BENEFIT_${status}`, before: current, after: { status, validFrom: input.validFrom, validUntil: input.validUntil }, justification: input.notes, ip: input.ip });
  notify(String(current.account_id), input.approved ? "BENEFIT_APPROVED" : "BENEFIT_REJECTED", input.approved ? "Benefício aprovado" : "Benefício revisado", input.approved ? `Benefício de ${current.percentage}% aprovado. Consulte a projeção no painel.` : clean(input.notes, 500) || "O benefício não foi aplicado neste ciclo.", "challenge_benefit", input.id);
}

export function updateChallengeSettings(configuration: Partial<ChallengeSettings>, actor: string, ip?: string) {
  const previous = getChallengeSettings();
  const next: ChallengeSettings = {
    ...previous,
    ...configuration,
    schoolBands: configuration.schoolBands ?? previous.schoolBands,
    attendanceBands: configuration.attendanceBands ?? previous.attendanceBands,
    scoreWeights: { ...previous.scoreWeights, ...(configuration.scoreWeights ?? {}) }
  };
  if (next.aiConfidenceThreshold < 0.5 || next.aiConfidenceThreshold > 1) throw new Error("A confiança da IA deve ficar entre 0,50 e 1,00.");
  if (next.maximumCombinedBenefit < 0 || next.maximumCombinedBenefit > 100) throw new Error("O limite acumulado é inválido.");
  if (next.ideaLimitPerWeek < 1 || next.ideaLimitPerWeek > 50) throw new Error("O limite semanal de ideias é inválido.");
  if (!["monthly", "quarterly", "semiannual", "annual"].includes(next.ideaCycle)) throw new Error("O ciclo de ideias é inválido.");
  if (next.retentionDays < 30 || next.retentionDays > 3650) throw new Error("A retenção deve ficar entre 30 e 3.650 dias.");
  const bandsAreValid = (bands: ChallengeSettings["schoolBands"]) => Array.isArray(bands) && bands.length > 0 && bands.every((band) => [band.min, band.max, band.benefit, band.points].every(Number.isFinite) && band.min <= band.max && band.benefit >= 0 && band.benefit <= 100 && band.points >= 0);
  if (!bandsAreValid(next.schoolBands) || !bandsAreValid(next.attendanceBands)) throw new Error("Revise as faixas: todos os valores precisam ser numéricos e coerentes.");
  if (Object.values(next.scoreWeights).some((value) => !Number.isFinite(value) || value < 0 || value > 1000)) throw new Error("Os pesos do score precisam ficar entre 0 e 1.000.");
  db().prepare("UPDATE member_challenge_settings SET configuration_json=?, updated_at=?, updated_by=? WHERE id='default'").run(JSON.stringify(next), now(), actor);
  audit({ actor, entityType: "challenge_settings", entityId: "default", action: "SETTINGS_UPDATED", before: previous, after: next, ip });
  return next;
}

export function updateChallengeBadge(input: { id: string; name?: string; description?: string; icon?: string; active?: boolean }, actor: string, ip?: string) {
  const current = db().prepare("SELECT * FROM member_challenge_badges WHERE id=?").get(input.id) as Record<string, unknown> | undefined;
  if (!current) throw new Error("Conquista não encontrada.");
  const next = {
    name: clean(input.name, 100) || String(current.name),
    description: clean(input.description, 300) || String(current.description),
    icon: clean(input.icon, 40) || String(current.icon),
    active: input.active === undefined ? Number(current.active) : input.active ? 1 : 0,
  };
  db().prepare("UPDATE member_challenge_badges SET name=?, description=?, icon=?, active=? WHERE id=?")
    .run(next.name, next.description, next.icon, next.active, input.id);
  audit({ actor, entityType: "challenge_badge", entityId: input.id, action: "BADGE_UPDATED", before: current, after: next, ip });
  return next;
}

export function createChallengeBadge(input: { name: string; description: string; icon?: string; challengeType: string; requirement?: string }, actor: string, ip?: string) {
  const name = clean(input.name, 100);
  const description = clean(input.description, 300);
  const allowedTypes = ["SCHOOL", "ATTENDANCE", "EVOLUTION", "IDEAS", "GENERAL"];
  if (name.length < 3 || description.length < 8) throw new Error("Informe nome e descrição da conquista.");
  if (!allowedTypes.includes(input.challengeType)) throw new Error("Tipo de conquista inválido.");
  const id = randomUUID();
  const slugBase = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "conquista";
  const slug = `${slugBase}-${id.slice(0, 8)}`;
  const timestamp = now();
  db().prepare(`INSERT INTO member_challenge_badges (id,slug,name,description,challenge_type,icon,requirement_json,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,?,?)`)
    .run(id, slug, name, description, input.challengeType, clean(input.icon, 40) || "award", JSON.stringify({ description: clean(input.requirement, 300) }), timestamp, timestamp);
  audit({ actor, entityType: "challenge_badge", entityId: id, action: "BADGE_CREATED", after: { slug, name, description, challengeType: input.challengeType }, ip });
  return id;
}

export function markChallengeNotificationRead(accountId: string, notificationId: string) {
  db().prepare("UPDATE member_challenge_notifications SET read_at=? WHERE id=? AND account_id=?").run(now(), notificationId, accountId);
}

export function softDeleteChallengeFile(fileId: string, actor: string, ip?: string) {
  const current = db().prepare("SELECT account_id FROM member_challenge_files WHERE id=? AND deleted_at IS NULL").get(fileId) as { account_id: string } | undefined;
  if (!current) throw new Error("Arquivo não encontrado.");
  db().prepare("UPDATE member_challenge_files SET deleted_at=? WHERE id=?").run(now(), fileId);
  audit({ actor, accountId: current.account_id, entityType: "challenge_file", entityId: fileId, action: "FILE_DELETED", ip });
}

export function challengeIdeasPublicRanking() {
  const current = new Date();
  const cycle = getChallengeSettings().ideaCycle;
  const startMonth = cycle === "monthly" ? current.getUTCMonth() : cycle === "quarterly" ? Math.floor(current.getUTCMonth() / 3) * 3 : cycle === "semiannual" ? Math.floor(current.getUTCMonth() / 6) * 6 : 0;
  const cycleStart = new Date(Date.UTC(current.getUTCFullYear(), startMonth, 1)).toISOString();
  const rows = db().prepare(
    `SELECT i.account_id, COALESCE(l.athlete_name,l.name) AS athlete_name, COUNT(*) AS valid_ideas,
            SUM(CASE WHEN i.status='IMPLEMENTED' THEN 1 ELSE 0 END) AS implemented
     FROM member_challenge_ideas i JOIN member_accounts a ON a.id=i.account_id JOIN leads l ON l.id=a.lead_id
     WHERE i.score_valid=1 AND datetime(i.created_at) >= datetime(?) GROUP BY i.account_id ORDER BY valid_ideas DESC, implemented DESC LIMIT 20`
  ).all(cycleStart) as Array<{ account_id: string; athlete_name: string; valid_ideas: number; implemented: number }>;
  return rows.map((row, index) => {
    const parts = row.athlete_name.trim().split(/\s+/);
    return { position: index + 1, displayName: `${parts[0] ?? "Atleta"}${parts[1] ? ` ${parts[1][0]}.` : ""}`, validIdeas: row.valid_ideas, implemented: row.implemented };
  });
}

export { ideaCategories };

export function closeMemberChallengesDatabase() {
  database?.close();
  database = undefined;
}
