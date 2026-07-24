import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import {
  categoryForBirthDate,
  formatCircuitTime,
  normalizeEvidenceUrl,
  normalizePublicName,
  normalizeState,
  parseCircuitTime,
  selectBestMarks,
  validateCircuitActivityDate,
  validateCpf,
  type CircuitGender,
  type CircuitSubmissionType,
  type RankableSubmission
} from "./virtual-circuit-core";
import { circuitFaq, circuitRegulations, mandatoryConsents } from "./virtual-circuit-content";

export const CIRCUIT_SLUG = "desafio-virtual-1km-11run-futuro-2026";
export const CIRCUIT_EDITION_ID = "virtual-circuit-2026";
export const CIRCUIT_ACTIVITY_START = "2026-07-01";

let database: DatabaseSync | undefined;

export function getCircuitDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  seedCircuitEdition(database);
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

function seedCircuitEdition(db: DatabaseSync) {
  const timestamp = now();
  const existing = db
    .prepare("SELECT start_date, regulations_text, faq_json FROM virtual_circuit_editions WHERE id = ?")
    .get(CIRCUIT_EDITION_ID) as { start_date: string; regulations_text: string; faq_json: string } | undefined;
  if (existing) {
    const currentRegulations = safeJson<string[][]>(existing.regulations_text, []);
    const currentFaq = safeJson<string[][]>(existing.faq_json, []);
    const updatedRegulations = currentRegulations.map(([title, text]) => {
      const replacement = circuitRegulations.find(([currentTitle]) => currentTitle === title);
      return title === "2. Do período" || title === "3. Dos participantes" ? [...(replacement ?? [title, text])] : [title, text];
    });
    const updatedFaq = currentFaq.map(([question, answer]) => {
      const replacement = circuitFaq.find(([currentQuestion]) => currentQuestion === question);
      return question === "Quem pode participar?" ? [...(replacement ?? [question, answer])] : [question, answer];
    });
    db.prepare(
      `UPDATE virtual_circuit_editions
       SET start_date = ?, regulations_text = ?, faq_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      existing.start_date > CIRCUIT_ACTIVITY_START ? CIRCUIT_ACTIVITY_START : existing.start_date,
      JSON.stringify(updatedRegulations),
      JSON.stringify(updatedFaq),
      timestamp,
      CIRCUIT_EDITION_ID
    );
    return;
  }
  const settings = {
    minAge: 9,
    maxAge: 13,
    editionYear: 2026,
    elevationToleranceMeters: 2,
    monthlyShirtsPerCategory: 3,
    quarterlyShoesCount: 1,
    finalPrizeCents: 100000,
    futureProjectUrl: "/onze-futuro",
    heroEyebrow: "Circuito Virtual 11Run",
    relatedProjectUrl: "/circuito-futuro-11"
  };
  db.prepare(
    `INSERT INTO virtual_circuit_editions
      (id, name, slug, description, start_date, end_date, timezone, distance_meters, status, regulations_version,
       privacy_version, settings_json, regulations_text, faq_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    CIRCUIT_EDITION_ID,
    "Desafio Virtual 1km 11Run Futuro",
    CIRCUIT_SLUG,
    "Primeira competição virtual para atletas de 9 a 13 anos.",
    CIRCUIT_ACTIVITY_START,
    "2026-12-15",
    "America/Sao_Paulo",
    1000,
    "PUBLISHED",
    "1.0-2026",
    "1.0-2026",
    JSON.stringify(settings),
    JSON.stringify(circuitRegulations),
    JSON.stringify(circuitFaq),
    timestamp,
    timestamp
  );
}

function dataSecret() {
  const secret = process.env.VIRTUAL_CIRCUIT_DATA_KEY || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("VIRTUAL_CIRCUIT_DATA_KEY não configurada.");
  return createHash("sha256").update(secret).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return `${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${encrypted.toString("base64url")}`;
}

function decrypt(value: string) {
  const [iv, tag, payload] = value.split(".");
  const decipher = createDecipheriv("aes-256-gcm", dataSecret(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(payload, "base64url")), decipher.final()]).toString("utf8");
}

function sensitiveHash(value: string) {
  return createHmac("sha256", dataSecret()).update(value.replace(/\D/g, "")).digest("hex");
}

function accessTokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export type CircuitEdition = {
  id: string;
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  timezone: string;
  distance_meters: number;
  status: string;
  regulations_version: string;
  privacy_version: string;
  hero_image: string | null;
  settings_json: string;
  regulations_text: string;
  faq_json: string;
  created_at: string;
  updated_at: string;
};

export function getCircuitEdition() {
  const row = getCircuitDatabase()
    .prepare("SELECT * FROM virtual_circuit_editions WHERE id = ?")
    .get(CIRCUIT_EDITION_ID) as CircuitEdition;
  return {
    ...row,
    settings: safeJson<Record<string, string | number>>(row.settings_json, {}),
    regulations: safeJson<string[][]>(row.regulations_text, []),
    faq: safeJson<string[][]>(row.faq_json, [])
  };
}

export function updateCircuitEdition(input: {
  startDate: string;
  endDate: string;
  heroImage?: string;
  regulations: string[][];
  faq: string[][];
  settings: Record<string, string | number>;
  actor: string;
}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(input.endDate) || input.endDate < input.startDate) {
    throw new Error("Período da edição inválido.");
  }
  if (!input.regulations.length || !input.faq.length) throw new Error("Regulamento e FAQ não podem ficar vazios.");
  const db = getCircuitDatabase();
  const before = db.prepare("SELECT * FROM virtual_circuit_editions WHERE id = ?").get(CIRCUIT_EDITION_ID);
  const timestamp = now();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `UPDATE virtual_circuit_editions
       SET start_date = ?, end_date = ?, hero_image = ?, regulations_text = ?, faq_json = ?,
           settings_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      input.startDate,
      input.endDate,
      input.heroImage?.trim() || null,
      JSON.stringify(input.regulations),
      JSON.stringify(input.faq),
      JSON.stringify(input.settings),
      timestamp,
      CIRCUIT_EDITION_ID
    );
    const after = db.prepare("SELECT * FROM virtual_circuit_editions WHERE id = ?").get(CIRCUIT_EDITION_ID);
    audit(db, { entityType: "edition", entityId: CIRCUIT_EDITION_ID, action: "UPDATED", actor: input.actor, before, after });
    db.exec("COMMIT;");
    return getCircuitEdition();
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

type RegistrationInput = {
  athlete: {
    fullName: string;
    publicName: string;
    cpf: string;
    birthDate: string;
    city: string;
    state: string;
    gender: CircuitGender;
    documentFileId: string;
  };
  guardian: {
    fullName: string;
    cpf: string;
    relationship: string;
    email: string;
    phone: string;
    birthDate: string;
  };
  coach?: {
    fullName?: string;
    cpf?: string;
    cref?: string;
    crefState?: string;
    organization?: string;
    email?: string;
    phone?: string;
  };
  submission: {
    type: CircuitSubmissionType;
    activityDate: string;
    time: string;
    city: string;
    state: string;
    details: Record<string, string | number | boolean | null>;
    evidence: Array<{ type: string; url?: string; privateFileId?: string }>;
  };
  consents: Record<string, boolean>;
  meta: { ip?: string; userAgent?: string };
};

function cleanText(value: unknown, field: string, max = 180) {
  const clean = String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  if (!clean) throw new Error(`${field} é obrigatório.`);
  return clean;
}

function assertDocumentOwnerReady(db: DatabaseSync, fileId: string) {
  const file = db
    .prepare("SELECT id, purpose FROM virtual_circuit_private_files WHERE id = ?")
    .get(fileId) as { id: string; purpose: string } | undefined;
  if (!file || file.purpose !== "ATHLETE_DOCUMENT") throw new Error("Envie um documento comprobatório válido.");
}

function audit(
  db: DatabaseSync,
  input: { entityType: string; entityId: string; action: string; actor: string; before?: unknown; after?: unknown; reason?: string; ip?: string }
) {
  db.prepare(
    `INSERT INTO virtual_circuit_audit_logs
      (id, entity_type, entity_id, action, actor_id, before_json, after_json, reason, ip_address, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    input.entityType,
    input.entityId,
    input.action,
    input.actor,
    input.before ? JSON.stringify(input.before) : null,
    input.after ? JSON.stringify(input.after) : null,
    input.reason ?? null,
    input.ip ?? null,
    now()
  );
}

function validateEvidence(type: CircuitSubmissionType, evidence: RegistrationInput["submission"]["evidence"]) {
  const urls = evidence.filter((item) => item.url);
  if (type === "OFFICIAL_COMPETITION") {
    const result = urls.find((item) => item.type === "OFFICIAL_RESULT");
    if (!result?.url) throw new Error("Informe o link do resultado oficial.");
    result.url = normalizeEvidenceUrl(result.url, []);
  } else {
    const video = urls.find((item) => item.type === "VIDEO");
    if (!video?.url) throw new Error("Informe o vídeo público.");
    video.url = normalizeEvidenceUrl(video.url, ["youtube.com", "youtu.be", "instagram.com"]);
    if (type === "OPEN_COURSE") {
      const strava = urls.find((item) => item.type === "STRAVA");
      if (!strava?.url) throw new Error("Informe a atividade pública no Strava.");
      strava.url = normalizeEvidenceUrl(strava.url, ["strava.com"]);
    }
  }
  return evidence;
}

export function createCircuitRegistration(input: RegistrationInput) {
  const db = getCircuitDatabase();
  const edition = getCircuitEdition();
  if (!validateCpf(input.athlete.cpf)) throw new Error("CPF do atleta inválido.");
  if (!validateCpf(input.guardian.cpf)) throw new Error("CPF do responsável inválido.");
  if (input.coach?.cpf && !validateCpf(input.coach.cpf)) throw new Error("CPF do responsável técnico inválido.");
  if (!["FEMALE", "MALE"].includes(input.athlete.gender)) throw new Error("Gênero esportivo inválido.");
  if (!["OFFICIAL_COMPETITION", "TRACK_400M", "OPEN_COURSE"].includes(input.submission.type)) {
    throw new Error("Modalidade inválida.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.guardian.email)) throw new Error("E-mail do responsável inválido.");
  const settings = edition.settings as { editionYear: number; minAge: number; maxAge: number };
  const { age, birthYear } = categoryForBirthDate(
    input.athlete.birthDate,
    settings.editionYear,
    settings.minAge,
    settings.maxAge
  );
  assertDocumentOwnerReady(db, input.athlete.documentFileId);
  const requiredMissing = mandatoryConsents.find(([type]) => input.consents[type] !== true);
  if (requiredMissing) throw new Error("Todos os consentimentos obrigatórios precisam ser aceitos.");
  const declaredTimeMs = parseCircuitTime(input.submission.time);
  const evidence = validateEvidence(input.submission.type, input.submission.evidence);
  const timestamp = now();
  const guardianCpfHash = sensitiveHash(input.guardian.cpf);
  const athleteCpfHash = sensitiveHash(input.athlete.cpf);
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180).toISOString();

  db.exec("BEGIN IMMEDIATE;");
  try {
    let guardian = db.prepare("SELECT id FROM virtual_circuit_guardians WHERE cpf_hash = ?").get(guardianCpfHash) as
      | { id: string }
      | undefined;
    if (!guardian) {
      guardian = { id: randomUUID() };
      db.prepare(
        `INSERT INTO virtual_circuit_guardians
          (id, full_name, cpf_encrypted, cpf_hash, relationship, email, phone, birth_date_encrypted,
           access_token_hash, access_token_expires_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        guardian.id,
        cleanText(input.guardian.fullName, "Nome do responsável"),
        encrypt(input.guardian.cpf),
        guardianCpfHash,
        cleanText(input.guardian.relationship, "Relação com o atleta", 60),
        cleanText(input.guardian.email, "E-mail", 180).toLowerCase(),
        cleanText(input.guardian.phone, "WhatsApp", 40),
        encrypt(input.guardian.birthDate),
        accessTokenHash(token),
        expires,
        timestamp,
        timestamp
      );
    } else {
      db.prepare(
        `UPDATE virtual_circuit_guardians
         SET email = ?, phone = ?, relationship = ?, access_token_hash = ?, access_token_expires_at = ?, updated_at = ?
         WHERE id = ?`
      ).run(
        cleanText(input.guardian.email, "E-mail").toLowerCase(),
        cleanText(input.guardian.phone, "WhatsApp", 40),
        cleanText(input.guardian.relationship, "Relação", 60),
        accessTokenHash(token),
        expires,
        timestamp,
        guardian.id
      );
    }

    let athlete = db.prepare("SELECT id FROM virtual_circuit_athletes WHERE cpf_hash = ?").get(athleteCpfHash) as
      | { id: string }
      | undefined;
    if (!athlete) {
      athlete = { id: randomUUID() };
      db.prepare(
        `INSERT INTO virtual_circuit_athletes
          (id, full_name, public_name, cpf_encrypted, cpf_hash, birth_date_encrypted, birth_year, category_age,
           gender, city, state, document_file_id, publication_authorized, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'ACTIVE', ?, ?)`
      ).run(
        athlete.id,
        cleanText(input.athlete.fullName, "Nome do atleta"),
        normalizePublicName(cleanText(input.athlete.publicName, "Nome público")),
        encrypt(input.athlete.cpf),
        athleteCpfHash,
        encrypt(input.athlete.birthDate),
        birthYear,
        age,
        input.athlete.gender,
        cleanText(input.athlete.city, "Cidade", 100),
        normalizeState(input.athlete.state),
        input.athlete.documentFileId,
        timestamp,
        timestamp
      );
    } else {
      const existingGuardian = db
        .prepare("SELECT guardian_id FROM virtual_circuit_athlete_guardians WHERE athlete_id = ? AND authorization_status = 'AUTHORIZED'")
        .get(athlete.id) as { guardian_id: string } | undefined;
      if (existingGuardian && existingGuardian.guardian_id !== guardian.id) {
        throw new Error("Este atleta já possui um responsável vinculado. Entre em contato com a 11Run para alterar o vínculo.");
      }
    }

    db.prepare(
      `INSERT INTO virtual_circuit_athlete_guardians (athlete_id, guardian_id, is_primary, authorization_status)
       VALUES (?, ?, 1, 'AUTHORIZED')
       ON CONFLICT(athlete_id, guardian_id) DO UPDATE SET authorization_status = 'AUTHORIZED'`
    ).run(athlete.id, guardian.id);

    let coachId: string | null = null;
    if (input.coach?.fullName) {
      coachId = randomUUID();
      db.prepare(
        `INSERT INTO virtual_circuit_coaches
          (id, full_name, cpf_encrypted, cpf_hash, cref, cref_state, organization, email, phone, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        coachId,
        cleanText(input.coach.fullName, "Nome do responsável técnico"),
        input.coach.cpf ? encrypt(input.coach.cpf) : null,
        input.coach.cpf ? sensitiveHash(input.coach.cpf) : null,
        input.coach.cref?.trim() || null,
        input.coach.crefState?.trim().toUpperCase() || null,
        input.coach.organization?.trim() || null,
        input.coach.email?.trim().toLowerCase() || null,
        input.coach.phone?.trim() || null,
        timestamp,
        timestamp
      );
    }

    const submissionId = randomUUID();
    const activityDate = validateCircuitActivityDate(input.submission.activityDate, edition.start_date, edition.end_date);
    db.prepare(
      `INSERT INTO virtual_circuit_submissions
        (id, edition_id, athlete_id, guardian_id, coach_id, submission_type, activity_date, declared_time_ms,
         city, state, status, activity_data_json, submitted_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNDER_REVIEW', ?, ?, ?, ?)`
    ).run(
      submissionId,
      edition.id,
      athlete.id,
      guardian.id,
      coachId,
      input.submission.type,
      activityDate,
      declaredTimeMs,
      cleanText(input.submission.city, "Cidade da atividade", 100),
      normalizeState(input.submission.state),
      JSON.stringify(input.submission.details),
      timestamp,
      timestamp,
      timestamp
    );

    for (const item of evidence) {
      db.prepare(
        `INSERT INTO virtual_circuit_evidence
          (id, submission_id, evidence_type, original_url, normalized_url, private_file_id, metadata_json, accessibility_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, '{}', 'PENDING', ?)`
      ).run(randomUUID(), submissionId, item.type, item.url ?? null, item.url ?? null, item.privateFileId ?? null, timestamp);
    }

    for (const [type, text] of [...mandatoryConsents, ["MEDIA_PROMOTION", "Autorizo o uso de imagens e vídeos do atleta em comunicações institucionais da 11Run."] as const]) {
      const accepted = input.consents[type] === true;
      if (type === "MEDIA_PROMOTION" || accepted) {
        db.prepare(
          `INSERT INTO virtual_circuit_consents
            (id, guardian_id, athlete_id, edition_id, consent_type, consent_text, accepted, document_version,
             ip_address, user_agent, accepted_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).run(
          randomUUID(),
          guardian.id,
          athlete.id,
          edition.id,
          type,
          text,
          accepted ? 1 : 0,
          type === "REGULATIONS" ? edition.regulations_version : edition.privacy_version,
          input.meta.ip ?? null,
          input.meta.userAgent?.slice(0, 500) ?? null,
          timestamp
        );
      }
    }

    db.prepare(
      `INSERT INTO virtual_circuit_validations
        (id, submission_id, validation_type, provider, status, warnings_json, created_at)
       VALUES (?, ?, ?, 'MANUAL_FALLBACK', 'QUEUED_FOR_REVIEW', '["Automação externa não configurada; revisão humana necessária."]', ?)`
    ).run(randomUUID(), submissionId, input.submission.type, timestamp);
    audit(db, {
      entityType: "submission",
      entityId: submissionId,
      action: "CREATED",
      actor: `guardian:${guardian.id}`,
      after: { status: "UNDER_REVIEW", declaredTimeMs, type: input.submission.type },
      ip: input.meta.ip
    });
    db.exec("COMMIT;");
    return { submissionId, athleteId: athlete.id, guardianId: guardian.id, accessToken: token, expiresAt: expires };
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

export function getGuardianByAccessToken(token?: string | null) {
  if (!token) return null;
  return getCircuitDatabase()
    .prepare(
      `SELECT id, full_name, relationship, email, phone, created_at
       FROM virtual_circuit_guardians
       WHERE access_token_hash = ? AND datetime(access_token_expires_at) > datetime('now')`
    )
    .get(accessTokenHash(token)) as
    | { id: string; full_name: string; relationship: string; email: string; phone: string; created_at: string }
    | undefined;
}

export function getGuardianDashboard(token?: string | null) {
  const guardian = getGuardianByAccessToken(token);
  if (!guardian) return null;
  const db = getCircuitDatabase();
  const athletes = db
    .prepare(
      `SELECT a.id, a.public_name, a.category_age, a.gender, a.city, a.state, a.status
       FROM virtual_circuit_athletes a
       JOIN virtual_circuit_athlete_guardians ag ON ag.athlete_id = a.id
       WHERE ag.guardian_id = ?
       ORDER BY a.public_name`
    )
    .all(guardian.id) as Array<Record<string, string | number>>;
  type GuardianSubmissionRow = {
    id: string;
    athlete_id: string;
    submission_type: CircuitSubmissionType;
    activity_date: string;
    declared_time_ms: number;
    verified_time_ms: number | null;
    status: string;
    validation_badge: string | null;
    correction_message: string | null;
    rejection_reason: string | null;
    created_at: string;
  };
  const submissions = db
    .prepare(
      `SELECT s.id, s.athlete_id, s.submission_type, s.activity_date, s.declared_time_ms, s.verified_time_ms,
              s.status, s.validation_badge, s.correction_message, s.rejection_reason, s.created_at
       FROM virtual_circuit_submissions s
       WHERE s.guardian_id = ?
       ORDER BY datetime(s.created_at) DESC`
    )
    .all(guardian.id) as GuardianSubmissionRow[];
  return {
    guardian,
    athletes,
    submissions: submissions.map((item) => ({
      ...item,
      formattedTime: formatCircuitTime(Number(item.verified_time_ms ?? item.declared_time_ms))
    }))
  };
}

export function submitCircuitCorrection(token: string | null | undefined, submissionId: string, message: string, ip?: string) {
  const guardian = getGuardianByAccessToken(token);
  if (!guardian) throw new Error("Acesso expirado.");
  const db = getCircuitDatabase();
  const before = db
    .prepare("SELECT * FROM virtual_circuit_submissions WHERE id = ? AND guardian_id = ?")
    .get(submissionId, guardian.id) as Record<string, string | number | null> | undefined;
  if (!before) throw new Error("Atividade não encontrada.");
  if (before.status !== "CORRECTION_REQUESTED") throw new Error("Esta atividade não possui correção pendente.");
  const correction = cleanText(message, "Resposta da correção", 1800);
  const data = safeJson<Record<string, unknown>>(String(before.activity_data_json || "{}"), {});
  data.guardianCorrection = { message: correction, sentAt: now() };
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `UPDATE virtual_circuit_submissions
       SET status = 'UNDER_REVIEW', correction_message = NULL, activity_data_json = ?, updated_at = ?
       WHERE id = ? AND guardian_id = ?`
    ).run(JSON.stringify(data), now(), submissionId, guardian.id);
    const after = db.prepare("SELECT * FROM virtual_circuit_submissions WHERE id = ?").get(submissionId);
    audit(db, {
      entityType: "submission",
      entityId: submissionId,
      action: "CORRECTION_SUBMITTED",
      actor: `guardian:${guardian.id}`,
      before,
      after,
      reason: correction,
      ip
    });
    db.exec("COMMIT;");
    return after;
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

export type RankingFilters = {
  categoryAge?: number;
  gender?: CircuitGender;
  state?: string;
  type?: CircuitSubmissionType;
  name?: string;
  start?: string;
  end?: string;
};

export function listCircuitRanking(filters: RankingFilters = {}) {
  const edition = getCircuitEdition();
  const db = getCircuitDatabase();
  const clauses = ["s.edition_id = ?", "s.status = 'APPROVED'"];
  const values: Array<string | number> = [edition.id];
  if (filters.categoryAge) {
    clauses.push("a.category_age = ?");
    values.push(filters.categoryAge);
  }
  if (filters.gender) {
    clauses.push("a.gender = ?");
    values.push(filters.gender);
  }
  if (filters.state) {
    clauses.push("a.state = ?");
    values.push(filters.state);
  }
  if (filters.type) {
    clauses.push("s.submission_type = ?");
    values.push(filters.type);
  }
  if (filters.name) {
    clauses.push("a.public_name LIKE ?");
    values.push(`%${filters.name.replace(/[%_]/g, "")}%`);
  }
  if (filters.start) {
    clauses.push("s.activity_date >= ?");
    values.push(filters.start);
  }
  if (filters.end) {
    clauses.push("s.activity_date <= ?");
    values.push(filters.end);
  }
  const rows = db
    .prepare(
      `SELECT s.id, s.athlete_id, a.public_name, a.category_age, a.gender, a.city, a.state,
              s.activity_date, COALESCE(s.verified_time_ms, s.declared_time_ms) AS time_ms,
              s.submission_type, s.validation_badge
       FROM virtual_circuit_submissions s
       JOIN virtual_circuit_athletes a ON a.id = s.athlete_id
       WHERE ${clauses.join(" AND ")}`
    )
    .all(...values) as Array<{
    id: string;
    athlete_id: string;
    public_name: string;
    category_age: number;
    gender: CircuitGender;
    city: string;
    state: string;
    activity_date: string;
    time_ms: number;
    submission_type: CircuitSubmissionType;
    validation_badge: string | null;
  }>;
  const rankable: RankableSubmission[] = rows.map((row) => ({
    id: row.id,
    athleteId: row.athlete_id,
    publicName: row.public_name,
    categoryAge: row.category_age,
    gender: row.gender,
    city: row.city,
    state: row.state,
    activityDate: row.activity_date,
    timeMs: row.time_ms,
    type: row.submission_type,
    badge: row.validation_badge || badgeForType(row.submission_type)
  }));
  const categoryPositions = new Map<string, number>();
  return selectBestMarks(rankable).map((item, index) => {
    const categoryKey = `${item.categoryAge}-${item.gender}`;
    const categoryPosition = (categoryPositions.get(categoryKey) ?? 0) + 1;
    categoryPositions.set(categoryKey, categoryPosition);
    return {
      ...item,
      position: index + 1,
      categoryPosition,
      formattedTime: formatCircuitTime(item.timeMs)
    };
  });
}

export function badgeForType(type: CircuitSubmissionType) {
  return type === "OFFICIAL_COMPETITION" ? "Oficial" : type === "TRACK_400M" ? "Pista 400m" : "Percurso Livre";
}

export function getCircuitAdminDashboard() {
  const db = getCircuitDatabase();
  const scalar = (sql: string) => Number((db.prepare(sql).get() as { total: number }).total);
  return {
    athletes: scalar("SELECT COUNT(*) AS total FROM virtual_circuit_athletes"),
    guardians: scalar("SELECT COUNT(*) AS total FROM virtual_circuit_guardians"),
    submissions: scalar("SELECT COUNT(*) AS total FROM virtual_circuit_submissions"),
    receivedToday: scalar("SELECT COUNT(*) AS total FROM virtual_circuit_submissions WHERE date(created_at) = date('now')"),
    underReview: scalar("SELECT COUNT(*) AS total FROM virtual_circuit_submissions WHERE status IN ('AI_PROCESSING', 'UNDER_REVIEW')"),
    approved: scalar("SELECT COUNT(*) AS total FROM virtual_circuit_submissions WHERE status = 'APPROVED'"),
    rejected: scalar("SELECT COUNT(*) AS total FROM virtual_circuit_submissions WHERE status IN ('REJECTED', 'DISQUALIFIED')"),
    projectedShirts: 150
  };
}

export function listCircuitAdminSubmissions(status?: string) {
  const db = getCircuitDatabase();
  type AdminSubmissionRow = {
    id: string;
    athlete_id: string;
    guardian_id: string;
    submission_type: CircuitSubmissionType;
    activity_date: string;
    declared_time_ms: number;
    verified_time_ms: number | null;
    city: string;
    state: string;
    status: string;
    validation_badge: string | null;
    activity_data_json: string;
    athlete_name: string;
    public_name: string;
    category_age: number;
    gender: CircuitGender;
    guardian_name: string;
    guardian_email: string;
    guardian_phone: string;
    document_file_id: string;
    created_at: string;
  } & Record<string, string | number | null>;
  const rows = db
    .prepare(
      `SELECT s.*, a.full_name AS athlete_name, a.public_name, a.category_age, a.gender, a.document_file_id,
              g.full_name AS guardian_name, g.email AS guardian_email, g.phone AS guardian_phone
       FROM virtual_circuit_submissions s
       JOIN virtual_circuit_athletes a ON a.id = s.athlete_id
       JOIN virtual_circuit_guardians g ON g.id = s.guardian_id
       WHERE (? IS NULL OR s.status = ?)
       ORDER BY CASE s.status WHEN 'UNDER_REVIEW' THEN 0 WHEN 'CORRECTION_REQUESTED' THEN 1 ELSE 2 END,
                datetime(s.created_at) DESC`
    )
    .all(status ?? null, status ?? null) as AdminSubmissionRow[];
  return rows.map((row) => ({
    ...row,
    formattedTime: formatCircuitTime(Number(row.verified_time_ms ?? row.declared_time_ms)),
    activityData: safeJson(row.activity_data_json as string, {})
  }));
}

export function getCircuitAdminSubmission(id: string) {
  const db = getCircuitDatabase();
  const submission = listCircuitAdminSubmissions().find((item) => item.id === id);
  if (!submission) return null;
  const evidence = db.prepare("SELECT * FROM virtual_circuit_evidence WHERE submission_id = ?").all(id);
  const validations = db.prepare("SELECT * FROM virtual_circuit_validations WHERE submission_id = ? ORDER BY created_at DESC").all(id);
  const auditLogs = db.prepare("SELECT * FROM virtual_circuit_audit_logs WHERE entity_id = ? ORDER BY created_at DESC").all(id);
  return { ...submission, evidence, validations, auditLogs };
}

const allowedTransitions: Record<string, string[]> = {
  UNDER_REVIEW: ["APPROVED", "REJECTED", "CORRECTION_REQUESTED", "DISQUALIFIED"],
  CORRECTION_REQUESTED: ["UNDER_REVIEW", "REJECTED", "WITHDRAWN"],
  APPROVED: ["DISQUALIFIED", "UNDER_REVIEW"],
  REJECTED: ["UNDER_REVIEW"],
  DISQUALIFIED: ["UNDER_REVIEW"]
};

export function updateCircuitSubmissionStatus(input: {
  id: string;
  status: string;
  reason: string;
  actor: string;
  verifiedTime?: string;
  ip?: string;
}) {
  const db = getCircuitDatabase();
  const before = db.prepare("SELECT * FROM virtual_circuit_submissions WHERE id = ?").get(input.id) as
    | Record<string, string | number | null>
    | undefined;
  if (!before) throw new Error("Inscrição não encontrada.");
  if (!allowedTransitions[String(before.status)]?.includes(input.status)) throw new Error("Mudança de status não permitida.");
  const reason = cleanText(input.reason, "Justificativa", 1200);
  const verifiedTimeMs = input.verifiedTime ? parseCircuitTime(input.verifiedTime) : before.verified_time_ms;
  const badge = input.status === "APPROVED" ? badgeForType(before.submission_type as CircuitSubmissionType) : before.validation_badge;
  const timestamp = now();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `UPDATE virtual_circuit_submissions
       SET status = ?, verified_time_ms = ?, validation_badge = ?, rejection_reason = ?,
           correction_message = ?, approved_at = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      input.status,
      verifiedTimeMs,
      badge,
      ["REJECTED", "DISQUALIFIED"].includes(input.status) ? reason : null,
      input.status === "CORRECTION_REQUESTED" ? reason : null,
      input.status === "APPROVED" ? timestamp : before.approved_at,
      timestamp,
      input.id
    );
    const after = db.prepare("SELECT * FROM virtual_circuit_submissions WHERE id = ?").get(input.id);
    audit(db, {
      entityType: "submission",
      entityId: input.id,
      action: `STATUS_${input.status}`,
      actor: input.actor,
      before,
      after,
      reason,
      ip: input.ip
    });
    db.exec("COMMIT;");
    return after;
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

export function registerPrivateFile(input: {
  storageName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
  purpose: string;
}) {
  const id = randomUUID();
  getCircuitDatabase()
    .prepare(
      `INSERT INTO virtual_circuit_private_files
        (id, storage_name, original_name, mime_type, size_bytes, sha256, purpose, created_at, delete_after)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.storageName,
      input.originalName,
      input.mimeType,
      input.sizeBytes,
      input.sha256,
      input.purpose,
      now(),
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2).toISOString()
    );
  return id;
}

export function getPrivateFile(id: string) {
  return getCircuitDatabase()
    .prepare("SELECT * FROM virtual_circuit_private_files WHERE id = ?")
    .get(id) as
    | { id: string; storage_name: string; original_name: string; mime_type: string; size_bytes: number; purpose: string }
    | undefined;
}

export function revealSensitiveForAdmin(type: "athlete" | "guardian", id: string) {
  const db = getCircuitDatabase();
  if (type === "athlete") {
    const row = db.prepare("SELECT cpf_encrypted, birth_date_encrypted FROM virtual_circuit_athletes WHERE id = ?").get(id) as
      | { cpf_encrypted: string; birth_date_encrypted: string }
      | undefined;
    return row ? { cpf: decrypt(row.cpf_encrypted), birthDate: decrypt(row.birth_date_encrypted) } : null;
  }
  const row = db.prepare("SELECT cpf_encrypted, birth_date_encrypted FROM virtual_circuit_guardians WHERE id = ?").get(id) as
    | { cpf_encrypted: string; birth_date_encrypted: string }
    | undefined;
  return row ? { cpf: decrypt(row.cpf_encrypted), birthDate: decrypt(row.birth_date_encrypted) } : null;
}
