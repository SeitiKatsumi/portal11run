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
} from "./virtual-circuit-core.ts";
import { circuitFaq, circuitRegulations, mandatoryConsents } from "./virtual-circuit-content.ts";

export const CIRCUIT_SLUG = "desafio-virtual-1km-11run-futuro-2026";
export const CIRCUIT_EDITION_ID = "virtual-circuit-2026";
export const CIRCUIT_ACTIVITY_START = "2026-08-01";
export const CIRCUIT_HERO_IMAGE = "/assets/circuito-virtual/desafio-virtual-premiacoes-2026.webp";

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
  seedOfficialCircuitResults(database);
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
    .prepare("SELECT start_date, hero_image, regulations_text, faq_json FROM virtual_circuit_editions WHERE id = ?")
    .get(CIRCUIT_EDITION_ID) as { start_date: string; hero_image: string | null; regulations_text: string; faq_json: string } | undefined;
  if (existing) {
    db.exec("BEGIN IMMEDIATE;");
    try {
      db.prepare(
        `UPDATE virtual_circuit_editions
         SET start_date = ?,
             hero_image = CASE
               WHEN hero_image IS NULL
                 OR hero_image = '/assets/circuito-virtual/hero-atletas-2026.webp'
                 OR hero_image = '/assets/circuito-virtual/desafio-virtual-1000m-2026.webp' THEN ?
               ELSE hero_image
             END,
             regulations_text = ?, faq_json = ?, updated_at = ?
         WHERE id = ?`
      ).run(
        CIRCUIT_ACTIVITY_START,
        CIRCUIT_HERO_IMAGE,
        JSON.stringify(circuitRegulations),
        JSON.stringify(circuitFaq),
        timestamp,
        CIRCUIT_EDITION_ID
      );
      const normalized = db.prepare(
        `UPDATE virtual_circuit_submissions
         SET activity_date = ?, updated_at = ?
         WHERE edition_id = ? AND activity_date < ?`
      ).run(CIRCUIT_ACTIVITY_START, timestamp, CIRCUIT_EDITION_ID, CIRCUIT_ACTIVITY_START);
      if (Number(normalized.changes) > 0) {
        audit(db, {
          entityType: "edition",
          entityId: CIRCUIT_EDITION_ID,
          action: "NORMALIZED_PRE_START_DATES",
          actor: "system:migration",
          before: { startDate: existing.start_date },
          after: { startDate: CIRCUIT_ACTIVITY_START, normalizedSubmissions: Number(normalized.changes) },
          reason: "Registros anteriores ao início oficial da edição foram ajustados para 01/08/2026."
        });
      }
      db.exec("COMMIT;");
    } catch (error) {
      db.exec("ROLLBACK;");
      throw error;
    }
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
       privacy_version, hero_image, settings_json, regulations_text, faq_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
    CIRCUIT_HERO_IMAGE,
    JSON.stringify(settings),
    JSON.stringify(circuitRegulations),
    JSON.stringify(circuitFaq),
    timestamp,
    timestamp
  );
}

const officialSeedResults = [
  ["nikkey-2026-guilherme-hideki-kawakami", "Guilherme Hideki Kawakami", 13, "MALE", 187_650, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-davi-raimundo-zanata", "Davi Raimundo Zanata", 13, "MALE", 196_900, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-daniel-kenzo-hayashi", "Daniel Kenzo Hayashi", 13, "MALE", 198_450, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-felipe-kenji-murayama-xavier", "Felipe Kenji Murayama Xavier", 13, "MALE", 203_260, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-eric-jun-amadatsu", "Eric Jun Amadatsu", 12, "MALE", 207_100, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-felipe-nakashima-kanno", "Felipe Nakashima Kanno", 12, "MALE", 211_610, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-rafael-massayuki-mysuguti", "Rafael Massayuki Mysuguti", 12, "MALE", 217_000, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-murilo-tadao-takahashi", "Murilo Tadao Takahashi", 12, "MALE", 219_240, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-isabella-naomi-c-ota", "Isabella Naomi C. Ota", 13, "FEMALE", 221_080, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-beatriz-shiramizu-romano", "Beatriz Shiramizu Romano", 12, "FEMALE", 221_470, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-julia-ayumi-nagase", "Júlia Ayumi Nagase", 13, "FEMALE", 223_180, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-aime-giaretta-katsumi", "Aimê Giaretta Katsumi", 9, "FEMALE", 225_900, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-gabriela-maya-sakai", "Gabriela Maya Sakai", 12, "FEMALE", 230_970, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-camila-nagata", "Camila Nagata", 13, "FEMALE", 234_540, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-sofia-sumida-guimaraes", "Sofia Sumida Guimarães", 12, "FEMALE", 236_870, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["nikkey-2026-sofia-yamashita-ferreira", "Sofia Yamashita Ferreira", 12, "FEMALE", 239_350, "São Bernardo do Campo", "SP", "Intercolonial Nikkey 2026"],
  ["cbat-2026-helena-rowe-fernandes", "Helena Rowe Fernandes", 13, "FEMALE", 186_860, "Bragança Paulista", "SP", "Competição oficial CBAt 2026 · SOGIPA", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-05-17"],
  ["cbat-2026-tamires-lafond-reho-a-tsere", "Tamires Lafond Reho A Tsere Uhi", 13, "FEMALE", 192_390, "Bragança Paulista", "SP", "Competição oficial CBAt 2026 · Barra do Garças", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-05-17"],
  ["cbat-2026-ana-sophia-brito-de-araujo", "Ana Sophia Brito de Araujo", 13, "FEMALE", 210_940, "Manaus", "AM", "Competição oficial CBAt 2026 · APAN", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-04-25"],
  ["cbat-2026-alice-de-oliveira-alves-neves", "Alice de Oliveira Alves Neves", 13, "FEMALE", 218_740, "Bragança Paulista", "SP", "Competição oficial CBAt 2026 · EAF - Jaguarari", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-05-17"],
  ["cbat-2026-helena-nascimento-de-macedo", "Helena Nascimento de Macedo", 13, "FEMALE", 218_750, "Bragança Paulista", "SP", "Competição oficial CBAt 2026 · ORCAMPI", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-05-17"],
  ["cbat-2026-aylla-ariely-santana-de-oliveira", "Aylla Ariely Santana de Oliveira", 13, "FEMALE", 229_690, "João Pessoa", "PB", "Competição oficial CBAt 2026 · XE Potiguara", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-06-13"],
  ["cbat-2026-kassia-de-oliveira-silva", "Kassia de Oliveira Silva", 13, "FEMALE", 231_060, "Bragança Paulista", "SP", "Competição oficial CBAt 2026 · EAF - Jaguarari", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-05-17"],
  ["cbat-2026-147547-loyza-vitoria-da-silva", "Loyza Vitoria da Silva", 13, "FEMALE", 244_020, "Recife", "PE", "Competição oficial CBAt 2026 · Sport Club do Recife", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-143616-alice-yasmim-dos-santos-souza", "Alice Yasmim dos Santos Souza", 13, "FEMALE", 248_990, "Recife", "PE", "Competição oficial CBAt 2026 · JAGUAR-PE", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-138453-ana-bella-de-souza-miguel", "Ana Bella de Souza Miguel", 13, "FEMALE", 263_550, "Manaus", "AM", "Competição oficial CBAt 2026 · CMPM VII", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-04-25"],
  ["cbat-2026-140271-thayna-sofya-de-santana-tavares", "Thayna Sofya de Santana Tavares", 13, "FEMALE", 269_320, "Recife", "PE", "Competição oficial CBAt 2026 · CFPSS", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-147577-aysha-duarte-santos", "Aysha Duarte Santos", 13, "FEMALE", 273_760, "Recife", "PE", "Competição oficial CBAt 2026 · Sport Club do Recife", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-147575-maria-lais-vieira-da-silva", "Maria Lais Vieira da Silva", 13, "FEMALE", 277_990, "Recife", "PE", "Competição oficial CBAt 2026 · JAGUAR-PE", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-144088-anne-gabryelle-da-conceicao-ferraz", "Anne Gabryelle da Conceicao Ferraz", 13, "FEMALE", 280_570, "João Pessoa", "PB", "Competição oficial CBAt 2026 · Equipe Contra o Relógio", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-06-13"],
  ["cbat-2026-145224-davi-henrique-alves-da-silva", "Davi Henrique Alves da Silva", 13, "MALE", 176_380, "Recife", "PE", "Competição oficial CBAt 2026 · JAGUAR-PE", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-144096-hitalo-rafael-de-souza-batista", "Hitalo Rafael de Souza Batista", 13, "MALE", 194_070, "Recife", "PE", "Competição oficial CBAt 2026 · Projeto Atletismo Campeão", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-146907-paulo-gabriel-meira-santos", "Paulo Gabriel Meira Santos", 13, "MALE", 198_630, "Recife", "PE", "Competição oficial CBAt 2026 · Correndo para o Futuro", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["cbat-2026-143732-kaua-gabriel-silveira-costa", "Kaua Gabriel Silveira Costa", 13, "MALE", 199_870, "Londrina", "PR", "Competição oficial CBAt 2026 · IPEC Londrina FEL", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-04-25"],
  ["cbat-2026-142098-luiz-miguel-da-silva-santana", "Luiz Miguel da Silva Santana", 13, "MALE", 216_160, "Bragança Paulista", "SP", "Competição oficial CBAt 2026 · EAF - Jaguarari", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-05-17"],
  ["cbat-2026-145831-jhonatas-lucino-dos-santos-silva", "Jhonatas Lucino dos Santos Silva", 13, "MALE", 241_330, "João Pessoa", "PB", "Competição oficial CBAt 2026 · ONG", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-06-13"],
  ["cbat-2026-144100-kauan-paulo-oliveira-da-silva", "Kauan Paulo Oliveira da Silva", 13, "MALE", 242_060, "Recife", "PE", "Competição oficial CBAt 2026 · Projeto Atletismo Campeão", "OFFICIAL_COMPETITION", "Oficial CBAt", "2026-08-01"],
  ["track-2026-roseana-lima", "Roseana Lima", 9, "FEMALE", 258_000, "Pará, Brasil", "PA", "Teste validado em pista de 400 m", "TRACK_400M", "Pista de 400m"],
  ["track-2026-kassyane-s-costa", "Kassyane S. Costa", 9, "FEMALE", 281_000, "Pará, Brasil", "PA", "Teste validado em pista de 400 m", "TRACK_400M", "Pista de 400m"],
  ["track-2026-gabryelle-silva", "Gabryelle Silva", 9, "FEMALE", 263_000, "Pará, Brasil", "PA", "Teste validado em pista de 400 m", "TRACK_400M", "Pista de 400m"],
  ["track-2026-maria-eloyza-alves", "Maria Eloyza Alves", 9, "FEMALE", 294_000, "Pará, Brasil", "PA", "Teste validado em pista de 400 m", "TRACK_400M", "Pista de 400m"],
  ["track-2026-solange-aquino", "Solange Aquino", 10, "FEMALE", 252_000, "Porto Alegre", "RS", "Teste validado em pista de 400 m", "TRACK_400M", "Pista 400m", "2026-08-04"],
  ["open-course-2026-bernardo-santos", "Bernardo dos Santos Mendonça", 11, "MALE", 232_470, "Suzano", "SP", "Teste validado em percurso livre", "OPEN_COURSE", "Percurso Livre", "2026-08-09"],
  ["open-course-2026-catarina-f-santos", "Catarina F. Santos", 10, "FEMALE", 282_000, "Ribeirão Preto", "SP", "Teste validado em percurso livre", "OPEN_COURSE", "Percurso Livre", "2026-08-05"],
  ["track-2026-cintia-pina-calvo", "Cintia Pina Calvo", 9, "FEMALE", 241_700, "Rio de Janeiro", "RJ", "Teste validado em pista de 400 m", "TRACK_400M", "Pista 400m", "2026-08-03"],
  ["track-2026-miguel-santos", "Miguel Santos", 11, "MALE", 196_000, "São Paulo", "SP", "Teste validado em pista de 400 m", "TRACK_400M", "Pista 400m", "2026-08-05"],
  ["track-2026-nathan-augusto-almeida-gerin", "Nathan Augusto Almeida Gerin", 10, "MALE", 206_700, "Apucarana", "PR", "Teste validado em pista de 400 m", "TRACK_400M", "Pista 400m", "2026-08-10"],
  ["track-2026-maria-eloiza-n-da-silva", "Maria Eloiza N. da Silva", 10, "FEMALE", 234_960, "Recife", "PE", "Teste validado em pista de 400 m", "TRACK_400M", "Pista 400m", "2027-08-06"],
  ["official-2026-ana-cristina", "Ana Cristina", 10, "FEMALE", 236_120, "Santa Catarina, Brasil", "SC", "Competição oficial em Santa Catarina"]
] as const;

function seedOfficialCircuitResults(db: DatabaseSync) {
  const timestamp = now();
  const statement = db.prepare(
    `INSERT INTO virtual_circuit_official_results (
       id, edition_id, public_name, category_age, gender, activity_date, time_ms,
       city, state, competition_name, submission_type, validation_badge, status,
       created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       public_name = excluded.public_name,
       category_age = excluded.category_age,
       gender = excluded.gender,
       activity_date = excluded.activity_date,
       time_ms = excluded.time_ms,
       city = excluded.city,
       state = excluded.state,
       competition_name = excluded.competition_name,
       submission_type = excluded.submission_type,
       validation_badge = excluded.validation_badge,
       status = excluded.status,
       updated_at = excluded.updated_at`
  );
  for (const [
    id,
    publicName,
    categoryAge,
    gender,
    timeMs,
    city,
    state,
    competitionName,
    submissionType = "OFFICIAL_COMPETITION",
    validationBadge = "Oficial",
    activityDate = CIRCUIT_ACTIVITY_START
  ] of officialSeedResults) {
    statement.run(
      id,
      CIRCUIT_EDITION_ID,
      publicName,
      categoryAge,
      gender,
      activityDate,
      timeMs,
      city,
      state,
      competitionName,
      submissionType,
      validationBadge,
      timestamp,
      timestamp
    );
  }
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
  medical: {
    method: "MEDICAL_CERTIFICATE" | "GUARDIAN_COMMITMENT";
    certificateFileId?: string;
    guardianCpfConfirmation: string;
    commitmentAccepted?: boolean;
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

function assertGuardianHealthDeclaration(input: RegistrationInput) {
  if (!validateCpf(input.medical.guardianCpfConfirmation)) {
    throw new Error("Confirme um CPF válido do responsável no termo de saúde e responsabilidade.");
  }
  if (sensitiveHash(input.medical.guardianCpfConfirmation) !== sensitiveHash(input.guardian.cpf)) {
    throw new Error("O CPF confirmado no termo deve ser o mesmo CPF do responsável legal.");
  }
  if (input.medical.method !== "GUARDIAN_COMMITMENT" || input.medical.commitmentAccepted !== true) {
    throw new Error("Leia e aceite o termo de saúde e responsabilidade do responsável legal.");
  }
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
  assertGuardianHealthDeclaration(input);
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
    const submittedActivityDate = input.submission.activityDate;
    const activityDate = validateCircuitActivityDate(submittedActivityDate, edition.start_date, edition.end_date);
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

    const medicalStatus = "VERIFIED";
    const promisedDueDate = null;
    const medicalDeclaration =
      "Como pai, mãe, tutor ou responsável legal, declaro que a criança está, na data do teste, em boas condições gerais de saúde para realizar a atividade. Assumo integral responsabilidade pela autorização, preparação, supervisão contínua, hidratação, vestuário, condições climáticas, escolha e segurança do percurso, deslocamentos e por qualquer ocorrência, acidente, lesão, mal-estar ou consequência antes, durante ou depois do teste. Comprometo-me a interromper imediatamente a atividade diante de dor, falta de ar fora do esperado, tontura, desmaio, mal-estar ou qualquer sinal de risco e a buscar orientação profissional quando houver dúvida sobre a saúde da criança.";
    db.prepare(
      `INSERT INTO virtual_circuit_medical_clearances
        (id, edition_id, athlete_id, guardian_id, submission_id, clearance_method, certificate_file_id,
         status, guardian_cpf_confirmation_hash, declaration_text, document_version, promised_due_date,
         health_data_consent_at, accepted_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      randomUUID(),
      edition.id,
      athlete.id,
      guardian.id,
      submissionId,
      "GUARDIAN_COMMITMENT",
      null,
      medicalStatus,
      guardianCpfHash,
      medicalDeclaration,
      "guardian-health-responsibility-2.0-2026",
      promisedDueDate,
      timestamp,
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
    audit(db, {
      entityType: "medical_clearance",
      entityId: submissionId,
      action: "GUARDIAN_HEALTH_RESPONSIBILITY_ACCEPTED",
      actor: `guardian:${guardian.id}`,
      after: { status: medicalStatus, method: "GUARDIAN_COMMITMENT", promisedDueDate: null },
      ip: input.meta.ip
    });
    db.exec("COMMIT;");
    return {
      submissionId,
      athleteId: athlete.id,
      guardianId: guardian.id,
      accessToken: token,
      expiresAt: expires,
      activityDate,
      activityDateAdjusted: activityDate !== submittedActivityDate
    };
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
    medical_status: string | null;
    promised_due_date: string | null;
    created_at: string;
  };
  const submissions = db
    .prepare(
      `SELECT s.id, s.athlete_id, s.submission_type, s.activity_date, s.declared_time_ms, s.verified_time_ms,
              s.status, s.validation_badge, s.correction_message, s.rejection_reason, s.created_at,
              mc.status AS medical_status, mc.promised_due_date
       FROM virtual_circuit_submissions s
       LEFT JOIN virtual_circuit_medical_clearances mc ON mc.submission_id = s.id
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

export function attachCircuitMedicalCertificate(
  token: string | null | undefined,
  submissionId: string,
  fileId: string,
  healthDataConsent: boolean,
  ip?: string
) {
  const guardian = getGuardianByAccessToken(token);
  if (!guardian) throw new Error("Acesso expirado.");
  if (!healthDataConsent) throw new Error("Confirme a autorização para o tratamento restrito do atestado médico.");
  const db = getCircuitDatabase();
  const file = db
    .prepare("SELECT id, purpose FROM virtual_circuit_private_files WHERE id = ?")
    .get(fileId) as { id: string; purpose: string } | undefined;
  if (!file || file.purpose !== "MEDICAL_CERTIFICATE") throw new Error("Envie um atestado médico válido.");
  const before = db
    .prepare("SELECT * FROM virtual_circuit_medical_clearances WHERE submission_id = ? AND guardian_id = ?")
    .get(submissionId, guardian.id) as Record<string, string | null> | undefined;
  const timestamp = now();
  db.exec("BEGIN IMMEDIATE;");
  try {
    if (before) {
      db.prepare(
        `UPDATE virtual_circuit_medical_clearances
         SET certificate_file_id = ?, clearance_method = 'MEDICAL_CERTIFICATE', status = 'SUBMITTED',
             promised_due_date = NULL, health_data_consent_at = ?, updated_at = ?
         WHERE submission_id = ? AND guardian_id = ?`
      ).run(fileId, timestamp, timestamp, submissionId, guardian.id);
    } else {
      const context = db
        .prepare(
          `SELECT s.edition_id, s.athlete_id, g.cpf_hash
           FROM virtual_circuit_submissions s
           JOIN virtual_circuit_guardians g ON g.id = s.guardian_id
           WHERE s.id = ? AND s.guardian_id = ?`
        )
        .get(submissionId, guardian.id) as
        | { edition_id: string; athlete_id: string; cpf_hash: string }
        | undefined;
      if (!context) throw new Error("Atividade não encontrada.");
      db.prepare(
        `INSERT INTO virtual_circuit_medical_clearances
          (id, edition_id, athlete_id, guardian_id, submission_id, clearance_method, certificate_file_id,
           status, guardian_cpf_confirmation_hash, declaration_text, document_version, promised_due_date,
           health_data_consent_at, accepted_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'MEDICAL_CERTIFICATE', ?, 'SUBMITTED', ?, ?, ?, NULL, ?, ?, ?, ?)`
      ).run(
        randomUUID(),
        context.edition_id,
        context.athlete_id,
        guardian.id,
        submissionId,
        fileId,
        context.cpf_hash,
        "Autorizo o tratamento restrito do atestado médico para análise da aptidão esportiva do atleta.",
        "medical-clearance-later-upload-1.0-2026",
        timestamp,
        timestamp,
        timestamp,
        timestamp
      );
    }
    audit(db, {
      entityType: "medical_clearance",
      entityId: submissionId,
      action: "CERTIFICATE_SUBMITTED_LATER",
      actor: `guardian:${guardian.id}`,
      before: before
        ? { status: before.status, method: before.clearance_method }
        : { status: "MISSING", method: null },
      after: { status: "SUBMITTED", method: "MEDICAL_CERTIFICATE" },
      ip
    });
    db.exec("COMMIT;");
    return { ok: true };
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
  const submissionRows = db
    .prepare(
      `SELECT s.id, s.athlete_id, a.public_name, a.category_age, a.gender, s.city, s.state,
              s.activity_date, COALESCE(s.verified_time_ms, s.declared_time_ms) AS time_ms,
              s.submission_type, s.validation_badge
       FROM virtual_circuit_submissions s
       JOIN virtual_circuit_athletes a ON a.id = s.athlete_id
       WHERE s.edition_id = ? AND s.status = 'APPROVED'`
    )
    .all(edition.id) as RankingRow[];
  const officialRows = db
    .prepare(
      `SELECT r.id, COALESCE(a.id, 'official:' || r.id) AS athlete_id,
              r.public_name, r.category_age, r.gender, r.city, r.state,
              r.activity_date, r.time_ms, r.submission_type, r.validation_badge
       FROM virtual_circuit_official_results r
       LEFT JOIN virtual_circuit_athletes a
         ON lower(trim(a.public_name)) = lower(trim(r.public_name))
        AND a.category_age = r.category_age
        AND a.gender = r.gender
       WHERE r.edition_id = ? AND r.status = 'APPROVED'`
    )
    .all(edition.id) as RankingRow[];
  const rows = [...submissionRows, ...officialRows].filter((row) => {
    if (filters.categoryAge && row.category_age !== filters.categoryAge) return false;
    if (filters.gender && row.gender !== filters.gender) return false;
    if (filters.state && row.state !== filters.state) return false;
    if (filters.type && row.submission_type !== filters.type) return false;
    if (filters.name && !row.public_name.toLocaleLowerCase("pt-BR").includes(filters.name.toLocaleLowerCase("pt-BR"))) {
      return false;
    }
    if (filters.start && row.activity_date < filters.start) return false;
    if (filters.end && row.activity_date > filters.end) return false;
    return true;
  });
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

type RankingRow = {
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
};

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
              g.full_name AS guardian_name, g.email AS guardian_email, g.phone AS guardian_phone,
              mc.status AS medical_status, mc.clearance_method, mc.certificate_file_id AS medical_certificate_file_id,
              mc.promised_due_date
       FROM virtual_circuit_submissions s
       JOIN virtual_circuit_athletes a ON a.id = s.athlete_id
       JOIN virtual_circuit_guardians g ON g.id = s.guardian_id
       LEFT JOIN virtual_circuit_medical_clearances mc ON mc.submission_id = s.id
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

export type CircuitOfficialResult = {
  id: string;
  public_name: string;
  category_age: number;
  gender: CircuitGender;
  activity_date: string;
  time_ms: number;
  formattedTime: string;
  city: string;
  state: string;
  competition_name: string;
  validation_badge: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export function listCircuitAdminOfficialResults() {
  const db = getCircuitDatabase();
  const rows = db
    .prepare(
      `SELECT id, public_name, category_age, gender, activity_date, time_ms, city, state,
              competition_name, validation_badge, status, created_at, updated_at
       FROM virtual_circuit_official_results
       WHERE edition_id = ?
       ORDER BY category_age DESC, gender, time_ms ASC, public_name`
    )
    .all(CIRCUIT_EDITION_ID) as Omit<CircuitOfficialResult, "formattedTime">[];
  return rows.map((row) => ({ ...row, formattedTime: formatCircuitTime(row.time_ms) }));
}

export function updateCircuitAdminOfficialResult(input: {
  id: string;
  publicName: string;
  categoryAge: number;
  gender: CircuitGender;
  activityDate: string;
  time: string;
  city: string;
  state: string;
  competitionName: string;
  actor: string;
  ip?: string;
}) {
  const db = getCircuitDatabase();
  const before = db
    .prepare("SELECT * FROM virtual_circuit_official_results WHERE id = ? AND edition_id = ?")
    .get(input.id, CIRCUIT_EDITION_ID) as Record<string, string | number | null> | undefined;
  if (!before) throw new Error("Resultado oficial não encontrado.");
  if (!Number.isInteger(input.categoryAge) || input.categoryAge < 9 || input.categoryAge > 13) {
    throw new Error("A categoria deve estar entre 9 e 13 anos.");
  }
  if (!["FEMALE", "MALE"].includes(input.gender)) throw new Error("Gênero esportivo inválido.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.activityDate)) throw new Error("Data inválida.");
  const state = cleanText(input.state, "Estado", 2).toUpperCase();
  if (!/^[A-Z-]{2}$/.test(state)) throw new Error("UF inválida.");
  const timestamp = now();
  const values = {
    publicName: normalizePublicName(cleanText(input.publicName, "Nome público")),
    categoryAge: input.categoryAge,
    gender: input.gender,
    activityDate: input.activityDate,
    timeMs: parseCircuitTime(input.time),
    city: cleanText(input.city, "Cidade", 120),
    state,
    competitionName: cleanText(input.competitionName, "Competição", 180)
  };
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `UPDATE virtual_circuit_official_results
       SET public_name = ?, category_age = ?, gender = ?, activity_date = ?, time_ms = ?,
           city = ?, state = ?, competition_name = ?, validation_badge = 'Oficial',
           status = 'APPROVED', updated_at = ?
       WHERE id = ? AND edition_id = ?`
    ).run(
      values.publicName,
      values.categoryAge,
      values.gender,
      values.activityDate,
      values.timeMs,
      values.city,
      values.state,
      values.competitionName,
      timestamp,
      input.id,
      CIRCUIT_EDITION_ID
    );
    const after = db
      .prepare("SELECT * FROM virtual_circuit_official_results WHERE id = ?")
      .get(input.id);
    audit(db, {
      entityType: "official_result",
      entityId: input.id,
      action: "UPDATED",
      actor: input.actor,
      before,
      after,
      reason: "Edição manual pelo painel administrativo.",
      ip: input.ip
    });
    db.exec("COMMIT;");
    return { ...after, formattedTime: formatCircuitTime(values.timeMs) };
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
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
