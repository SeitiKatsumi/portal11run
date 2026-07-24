import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { generatePixPayload } from "@/lib/pix";
import {
  brazilianStates,
  donationProjects,
  donationStatuses,
  sponsorshipStatuses,
  supporterTypes,
  supportTypes,
  volunteerContributionTypes,
  volunteerProfessions,
  volunteerStatuses
} from "@/lib/support-hub-options";
import { sendSupportNotification } from "@/lib/support-notifications";

export type SupportRecordType = "sponsorship" | "donation" | "volunteer";

export type SupportHubSettings = {
  pixKey: string;
  pixMerchantName: string;
  pixMerchantCity: string;
  donationValues: number[];
  donationProjects: string[];
  notificationEmail: string;
};

export type SponsorshipLead = {
  id: string;
  protocol: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string;
  phone: string;
  city: string;
  state: string;
  supporter_type: string;
  support_types_json: string;
  estimated_value_cents: number | null;
  periodicity: string | null;
  project_interest: string | null;
  message: string | null;
  best_contact_time: string | null;
  origin: string;
  priority: string;
  owner: string | null;
  status: string;
  admin_notes: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
};

export type DonationRecord = {
  id: string;
  protocol: string;
  donor_name: string;
  email: string;
  phone: string | null;
  document: string | null;
  city: string;
  state: string;
  amount_cents: number;
  project: string;
  message: string | null;
  anonymous: number;
  transfer_date: string | null;
  account_holder: string | null;
  transaction_id: string | null;
  pix_payload: string;
  receipt_file_id: string | null;
  status: string;
  admin_notes: string | null;
  owner: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
};

export type VolunteerRecord = {
  id: string;
  protocol: string;
  name: string;
  birth_date: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  profession: string;
  other_profession: string | null;
  company: string | null;
  professional_registration: string | null;
  portfolio_url: string | null;
  presentation: string | null;
  contribution_types_json: string;
  available_days: string | null;
  periods_json: string;
  frequency: string | null;
  work_mode: string | null;
  travel_distance: string | null;
  events_travel: number;
  child_experience: string | null;
  sport_experience: string | null;
  social_experience: string | null;
  motivation: string;
  contribution_description: string;
  attachment_file_id: string | null;
  owner: string | null;
  status: string;
  admin_notes: string | null;
  consent_at: string;
  created_at: string;
  updated_at: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /[0-9]{8,}/;
const defaultSettings: SupportHubSettings = {
  pixKey: "45.791.917/0001-90",
  pixMerchantName: "ONZERUN",
  pixMerchantCity: "ITATIBA",
  donationValues: [2000, 5000, 10000, 25000],
  donationProjects: [...donationProjects],
  notificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL ?? ""
};

let database: DatabaseSync | undefined;

export function getSupportDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_support_sponsorship_status_created ON support_sponsorship_leads(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_support_donations_status_created ON support_donations(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_support_volunteers_status_created ON support_volunteers(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_support_history_record ON support_history(record_type, record_id, created_at);
  `);
  seedSettings(database);
  return database;
}

function seedSettings(db: DatabaseSync) {
  const timestamp = new Date().toISOString();
  const entries: Array<[string, unknown]> = [
    ["pix_key", defaultSettings.pixKey],
    ["pix_merchant_name", defaultSettings.pixMerchantName],
    ["pix_merchant_city", defaultSettings.pixMerchantCity],
    ["donation_values", defaultSettings.donationValues],
    ["donation_projects", defaultSettings.donationProjects],
    ["notification_email", defaultSettings.notificationEmail]
  ];
  const insert = db.prepare(
    "INSERT OR IGNORE INTO support_settings(setting_key, setting_value, updated_by, updated_at) VALUES (?, ?, 'system', ?)"
  );
  for (const [key, value] of entries) insert.run(key, JSON.stringify(value), timestamp);
}

function setting<T>(rows: Map<string, string>, key: string, fallback: T): T {
  try {
    return rows.has(key) ? (JSON.parse(rows.get(key)!) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getSupportHubSettings(): SupportHubSettings {
  const rows = new Map(
    (getSupportDatabase().prepare("SELECT setting_key, setting_value FROM support_settings").all() as Array<{
      setting_key: string;
      setting_value: string;
    }>).map((row) => [row.setting_key, row.setting_value])
  );
  return {
    pixKey: setting(rows, "pix_key", defaultSettings.pixKey),
    pixMerchantName: setting(rows, "pix_merchant_name", defaultSettings.pixMerchantName),
    pixMerchantCity: setting(rows, "pix_merchant_city", defaultSettings.pixMerchantCity),
    donationValues: setting(rows, "donation_values", defaultSettings.donationValues),
    donationProjects: setting(rows, "donation_projects", defaultSettings.donationProjects),
    notificationEmail: setting(rows, "notification_email", defaultSettings.notificationEmail)
  };
}

export function updateSupportHubSettings(input: Partial<SupportHubSettings>, actor: string) {
  const allowed: Record<keyof SupportHubSettings, string> = {
    pixKey: "pix_key",
    pixMerchantName: "pix_merchant_name",
    pixMerchantCity: "pix_merchant_city",
    donationValues: "donation_values",
    donationProjects: "donation_projects",
    notificationEmail: "notification_email"
  };
  const statement = getSupportDatabase().prepare(
    `INSERT INTO support_settings(setting_key, setting_value, updated_by, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(setting_key) DO UPDATE SET
       setting_value = excluded.setting_value,
       updated_by = excluded.updated_by,
       updated_at = excluded.updated_at`
  );
  for (const [property, key] of Object.entries(allowed)) {
    const value = input[property as keyof SupportHubSettings];
    if (value !== undefined) statement.run(key, JSON.stringify(value), actor, new Date().toISOString());
  }
  return getSupportHubSettings();
}

function text(value: unknown, max = 500) {
  return String(value ?? "").replace(/\0/g, "").trim().slice(0, max);
}

function list(value: unknown, allowed: readonly string[]) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => text(item, 100)).filter((item) => allowed.includes(item)))];
}

function required(value: unknown, label: string, max = 500) {
  const normalized = text(value, max);
  if (!normalized) throw new Error(`${label} é obrigatório.`);
  return normalized;
}

function validState(value: unknown) {
  const state = required(value, "Estado", 2).toUpperCase();
  if (!brazilianStates.includes(state as (typeof brazilianStates)[number])) throw new Error("Estado inválido.");
  return state;
}

function validEmail(value: unknown) {
  const email = required(value, "E-mail", 180).toLowerCase();
  if (!emailPattern.test(email)) throw new Error("Informe um e-mail válido.");
  return email;
}

function validPhone(value: unknown, optional = false) {
  const phone = text(value, 30);
  if (!phone && optional) return "";
  if (!phonePattern.test(phone.replace(/\D/g, ""))) throw new Error("Informe um telefone válido.");
  return phone;
}

function protocol(prefix: string) {
  const date = new Date();
  const day = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `${prefix}-${day}-${randomUUID().slice(0, 6).toUpperCase()}`;
}

function consent(value: unknown) {
  if (value !== true && value !== "true" && value !== "on") {
    throw new Error("É necessário aceitar a Política de Privacidade.");
  }
  return new Date().toISOString();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]!);
}

function history(recordType: SupportRecordType, recordId: string, action: string, actor: string, fromValue?: string, toValue?: string, note?: string) {
  getSupportDatabase()
    .prepare(
      `INSERT INTO support_history(id, record_type, record_id, action, from_value, to_value, note, actor, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(randomUUID(), recordType, recordId, action, fromValue ?? null, toValue ?? null, note ?? null, actor, new Date().toISOString());
}

async function confirmationEmails(recordType: SupportRecordType, recordId: string, recipient: string, subject: string, summary: string) {
  const db = getSupportDatabase();
  const settings = getSupportHubSettings();
  await sendSupportNotification(db, {
    recordType,
    recordId,
    recipient,
    subject,
    html: `<p>Olá!</p><p>${escapeHtml(summary)}</p><p>A equipe 11RUN agradece o seu contato e dará continuidade pelo canal informado.</p>`
  });
  if (settings.notificationEmail) {
    await sendSupportNotification(db, {
      recordType,
      recordId,
      recipient: settings.notificationEmail,
      subject: `[11RUN] ${subject}`,
      html: `<p>Novo registro: <strong>${escapeHtml(recordId)}</strong></p><p>${escapeHtml(summary)}</p><p><a href="https://11run.com.br/admin/apoios">Abrir painel administrativo</a></p>`
    });
  }
}

export async function createSponsorshipLead(input: Record<string, unknown>) {
  const name = required(input.name, "Nome completo", 180);
  const email = validEmail(input.email);
  const phone = validPhone(input.phone);
  const supporterType = required(input.supporterType, "Tipo de apoiador", 80);
  if (!supporterTypes.includes(supporterType as (typeof supporterTypes)[number])) throw new Error("Tipo de apoiador inválido.");
  const selectedTypes = list(input.supportTypes, supportTypes);
  if (!selectedTypes.length) throw new Error("Selecione ao menos uma modalidade de apoio.");
  const estimatedValue = text(input.estimatedValue, 30);
  const estimatedValueCents = estimatedValue
    ? Math.round(Number(estimatedValue.replace(/[^\d,.-]/g, "").replace(".", "").replace(",", ".")) * 100)
    : null;
  if (estimatedValueCents !== null && (!Number.isFinite(estimatedValueCents) || estimatedValueCents < 0)) {
    throw new Error("Valor estimado inválido.");
  }
  const id = randomUUID();
  const internalProtocol = protocol("PAT");
  const now = new Date().toISOString();
  const record = {
    id,
    protocol: internalProtocol,
    name,
    company: text(input.company, 180) || null,
    role: text(input.role, 120) || null,
    email,
    phone,
    city: required(input.city, "Cidade", 120),
    state: validState(input.state),
    supporter_type: supporterType,
    support_types_json: JSON.stringify(selectedTypes),
    estimated_value_cents: estimatedValueCents,
    periodicity: text(input.periodicity, 50) || null,
    project_interest: text(input.projectInterest, 180) || null,
    message: text(input.message, 3000) || null,
    best_contact_time: text(input.bestContactTime, 120) || null,
    consent_at: consent(input.consent)
  };
  getSupportDatabase().prepare(
    `INSERT INTO support_sponsorship_leads (
      id, protocol, name, company, role, email, phone, city, state, supporter_type, support_types_json,
      estimated_value_cents, periodicity, project_interest, message, best_contact_time, consent_at, created_at, updated_at
    ) VALUES (
      $id, $protocol, $name, $company, $role, $email, $phone, $city, $state, $supporter_type, $support_types_json,
      $estimated_value_cents, $periodicity, $project_interest, $message, $best_contact_time, $consent_at, $created_at, $updated_at
    )`
  ).run({ ...Object.fromEntries(Object.entries(record).map(([key, value]) => [`$${key}`, value])), $created_at: now, $updated_at: now });
  history("sponsorship", id, "Cadastro criado", "site");
  await confirmationEmails("sponsorship", id, email, `Recebemos seu interesse em patrocinar · ${internalProtocol}`, `Protocolo ${internalProtocol}. Modalidades: ${selectedTypes.join(", ")}.`);
  return { id, protocol: internalProtocol };
}

export async function createDonation(input: Record<string, unknown>, receiptFileId?: string) {
  const amountCents = Math.round(Number(input.amountCents));
  if (!Number.isInteger(amountCents) || amountCents < 100) throw new Error("A doação mínima é de R$ 1,00.");
  if (amountCents > 100_000_000) throw new Error("Valor acima do limite permitido neste formulário.");
  const settings = getSupportHubSettings();
  const selectedProject = required(input.project, "Projeto", 180);
  if (!settings.donationProjects.includes(selectedProject)) throw new Error("Projeto de destino inválido.");
  const id = randomUUID();
  const internalProtocol = protocol("DOA");
  const pixPayload = generatePixPayload({
    key: settings.pixKey,
    amountCents,
    merchantName: settings.pixMerchantName,
    merchantCity: settings.pixMerchantCity,
    reference: internalProtocol.replace(/-/g, "")
  });
  const now = new Date().toISOString();
  const status = receiptFileId ? "Comprovante enviado" : "PIX gerado";
  const record = {
    id,
    protocol: internalProtocol,
    donor_name: required(input.name, "Nome completo", 180),
    email: validEmail(input.email),
    phone: validPhone(input.phone, true) || null,
    document: text(input.document, 30) || null,
    city: required(input.city, "Cidade", 120),
    state: validState(input.state),
    amount_cents: amountCents,
    project: selectedProject,
    message: text(input.message, 2000) || null,
    anonymous: input.anonymous === true || input.anonymous === "true" || input.anonymous === "on" ? 1 : 0,
    transfer_date: text(input.transferDate, 20) || null,
    account_holder: text(input.accountHolder, 180) || null,
    transaction_id: text(input.transactionId, 180) || null,
    pix_payload: pixPayload,
    receipt_file_id: receiptFileId ?? null,
    status,
    consent_at: consent(input.consent)
  };
  getSupportDatabase().prepare(
    `INSERT INTO support_donations (
      id, protocol, donor_name, email, phone, document, city, state, amount_cents, project, message, anonymous,
      transfer_date, account_holder, transaction_id, pix_payload, receipt_file_id, status, consent_at, created_at, updated_at
    ) VALUES (
      $id, $protocol, $donor_name, $email, $phone, $document, $city, $state, $amount_cents, $project, $message, $anonymous,
      $transfer_date, $account_holder, $transaction_id, $pix_payload, $receipt_file_id, $status, $consent_at, $created_at, $updated_at
    )`
  ).run({ ...Object.fromEntries(Object.entries(record).map(([key, value]) => [`$${key}`, value])), $created_at: now, $updated_at: now });
  history("donation", id, "Doação cadastrada", "site", undefined, status);
  await confirmationEmails("donation", id, record.email, `PIX 11RUN gerado · ${internalProtocol}`, `Sua intenção de doação de ${(amountCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} foi registrada para ${selectedProject}. A confirmação ocorrerá após conciliação.`);
  return { id, protocol: internalProtocol, pixPayload, status };
}

export async function createVolunteer(input: Record<string, unknown>, attachmentFileId?: string) {
  const profession = required(input.profession, "Profissão", 120);
  if (!volunteerProfessions.includes(profession as (typeof volunteerProfessions)[number])) throw new Error("Profissão inválida.");
  if (profession === "Outra profissão" && !text(input.otherProfession, 120)) throw new Error("Informe sua profissão.");
  const contributions = list(input.contributionTypes, volunteerContributionTypes);
  if (!contributions.length) throw new Error("Selecione ao menos um tipo de contribuição.");
  const periods = Array.isArray(input.periods) ? input.periods.map((value) => text(value, 30)).filter(Boolean) : [];
  const id = randomUUID();
  const internalProtocol = protocol("VOL");
  const now = new Date().toISOString();
  const accepted = consent(input.consent);
  if (input.truth !== true && input.truth !== "true" && input.truth !== "on") throw new Error("Confirme a veracidade das informações.");
  if (input.contactAuthorization !== true && input.contactAuthorization !== "true" && input.contactAuthorization !== "on") throw new Error("Autorize o contato da equipe.");
  const record = {
    id,
    protocol: internalProtocol,
    name: required(input.name, "Nome completo", 180),
    birth_date: required(input.birthDate, "Data de nascimento", 20),
    email: validEmail(input.email),
    phone: validPhone(input.phone),
    city: required(input.city, "Cidade", 120),
    state: validState(input.state),
    profession,
    other_profession: text(input.otherProfession, 120) || null,
    company: text(input.company, 180) || null,
    professional_registration: text(input.professionalRegistration, 120) || null,
    portfolio_url: text(input.portfolioUrl, 500) || null,
    presentation: text(input.presentation, 3000) || null,
    contribution_types_json: JSON.stringify(contributions),
    available_days: text(input.availableDays, 500) || null,
    periods_json: JSON.stringify(periods),
    frequency: text(input.frequency, 80) || null,
    work_mode: text(input.workMode, 80) || null,
    travel_distance: text(input.travelDistance, 80) || null,
    events_travel: input.eventsTravel === true || input.eventsTravel === "true" || input.eventsTravel === "on" ? 1 : 0,
    child_experience: text(input.childExperience, 800) || null,
    sport_experience: text(input.sportExperience, 800) || null,
    social_experience: text(input.socialExperience, 800) || null,
    motivation: required(input.motivation, "Motivação", 3000),
    contribution_description: required(input.contributionDescription, "Como pode contribuir", 3000),
    attachment_file_id: attachmentFileId ?? null,
    consent_at: accepted,
    truth_accepted_at: now,
    contact_authorized_at: now
  };
  getSupportDatabase().prepare(
    `INSERT INTO support_volunteers (
      id, protocol, name, birth_date, email, phone, city, state, profession, other_profession, company,
      professional_registration, portfolio_url, presentation, contribution_types_json, available_days, periods_json,
      frequency, work_mode, travel_distance, events_travel, child_experience, sport_experience, social_experience,
      motivation, contribution_description, attachment_file_id, consent_at, truth_accepted_at, contact_authorized_at,
      created_at, updated_at
    ) VALUES (
      $id, $protocol, $name, $birth_date, $email, $phone, $city, $state, $profession, $other_profession, $company,
      $professional_registration, $portfolio_url, $presentation, $contribution_types_json, $available_days, $periods_json,
      $frequency, $work_mode, $travel_distance, $events_travel, $child_experience, $sport_experience, $social_experience,
      $motivation, $contribution_description, $attachment_file_id, $consent_at, $truth_accepted_at, $contact_authorized_at,
      $created_at, $updated_at
    )`
  ).run({ ...Object.fromEntries(Object.entries(record).map(([key, value]) => [`$${key}`, value])), $created_at: now, $updated_at: now });
  history("volunteer", id, "Cadastro criado", "site");
  await confirmationEmails("volunteer", id, record.email, `Cadastro de voluntariado recebido · ${internalProtocol}`, `Protocolo ${internalProtocol}. Área principal: ${profession}. Nossa equipe analisará a compatibilidade com as oportunidades atuais.`);
  return { id, protocol: internalProtocol };
}

const allowedFiles = new Map([
  ["application/pdf", { extension: "pdf", signature: [0x25, 0x50, 0x44, 0x46] }],
  ["image/jpeg", { extension: "jpg", signature: [0xff, 0xd8, 0xff] }],
  ["image/png", { extension: "png", signature: [0x89, 0x50, 0x4e, 0x47] }]
]);

function privateRoot() {
  return path.resolve(process.cwd(), process.env.SUPPORT_PRIVATE_UPLOAD_DIR ?? "data/support-private");
}

export async function saveSupportFile(file: File, purpose: "DONATION_RECEIPT" | "VOLUNTEER_ATTACHMENT") {
  if (file.size <= 0 || file.size > 10 * 1024 * 1024) throw new Error("O arquivo deve ter até 10 MB.");
  const allowed = allowedFiles.get(file.type);
  if (!allowed) throw new Error("Envie PDF, JPG, JPEG ou PNG.");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!allowed.signature.every((byte, index) => bytes[index] === byte)) {
    throw new Error("O conteúdo do arquivo não corresponde ao formato informado.");
  }
  const id = randomUUID();
  const storageName = `${randomUUID()}.${allowed.extension}`;
  await mkdir(privateRoot(), { recursive: true });
  await writeFile(path.join(privateRoot(), storageName), bytes, { flag: "wx", mode: 0o600 });
  getSupportDatabase().prepare(
    `INSERT INTO support_private_files(id, storage_name, original_name, mime_type, size_bytes, sha256, purpose, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, storageName, file.name.slice(0, 180), file.type, file.size, createHash("sha256").update(bytes).digest("hex"), purpose, new Date().toISOString());
  return id;
}

export function getSupportPrivateFile(id: string) {
  const file = getSupportDatabase().prepare("SELECT * FROM support_private_files WHERE id = ?").get(id) as
    | { storage_name: string; original_name: string; mime_type: string }
    | undefined;
  return file ? { ...file, absolutePath: path.join(privateRoot(), file.storage_name) } : undefined;
}

export function listSupportHubRecords() {
  const db = getSupportDatabase();
  const plainRows = <T extends object>(rows: T[]) => rows.map((row) => ({ ...row }));
  return {
    sponsorships: plainRows(db.prepare("SELECT * FROM support_sponsorship_leads WHERE deleted_at IS NULL ORDER BY datetime(created_at) DESC").all() as SponsorshipLead[]),
    donations: plainRows(db.prepare("SELECT * FROM support_donations WHERE deleted_at IS NULL ORDER BY datetime(created_at) DESC").all() as DonationRecord[]),
    volunteers: plainRows(db.prepare("SELECT * FROM support_volunteers WHERE deleted_at IS NULL ORDER BY datetime(created_at) DESC").all() as VolunteerRecord[])
  };
}

export function listSupportHistory(recordType: SupportRecordType, recordId: string) {
  return (getSupportDatabase()
    .prepare("SELECT * FROM support_history WHERE record_type = ? AND record_id = ? ORDER BY datetime(created_at) DESC")
    .all(recordType, recordId) as Array<Record<string, unknown>>).map((row) => ({ ...row }));
}

export function updateSupportRecord(input: {
  type: SupportRecordType;
  id: string;
  status?: string;
  owner?: string;
  adminNotes?: string;
  note?: string;
  actor: string;
}) {
  const map = {
    sponsorship: { table: "support_sponsorship_leads", statuses: sponsorshipStatuses },
    donation: { table: "support_donations", statuses: donationStatuses },
    volunteer: { table: "support_volunteers", statuses: volunteerStatuses }
  } as const;
  const config = map[input.type];
  const db = getSupportDatabase();
  const current = db.prepare(`SELECT status, owner, admin_notes FROM ${config.table} WHERE id = ?`).get(input.id) as
    | { status: string; owner: string | null; admin_notes: string | null }
    | undefined;
  if (!current) throw new Error("Registro não encontrado.");
  if (input.status && !config.statuses.includes(input.status as never)) throw new Error("Status inválido.");
  const nextStatus = input.status ?? current.status;
  const nextOwner = input.owner === undefined ? current.owner : text(input.owner, 120) || null;
  const nextNotes = input.adminNotes === undefined ? current.admin_notes : text(input.adminNotes, 5000) || null;
  db.prepare(`UPDATE ${config.table} SET status = ?, owner = ?, admin_notes = ?, updated_at = ? WHERE id = ?`)
    .run(nextStatus, nextOwner, nextNotes, new Date().toISOString(), input.id);
  if (nextStatus !== current.status) history(input.type, input.id, "Status alterado", input.actor, current.status, nextStatus, input.note);
  if (nextOwner !== current.owner) history(input.type, input.id, "Responsável alterado", input.actor, current.owner ?? "", nextOwner ?? "", input.note);
  if (input.note) history(input.type, input.id, "Nota interna", input.actor, undefined, undefined, text(input.note, 2000));
  const updated = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(input.id) as Record<string, unknown>;
  return { ...updated };
}

export function supportDashboard() {
  const records = listSupportHubRecords();
  const confirmed = records.donations.filter((record) => record.status === "Pagamento confirmado");
  const negotiating = records.sponsorships.filter((record) => ["Proposta enviada", "Em negociação"].includes(record.status));
  return {
    totalInterested: records.sponsorships.length,
    newThisMonth: records.sponsorships.filter((record) => record.created_at.slice(0, 7) === new Date().toISOString().slice(0, 7)).length,
    negotiating: negotiating.length,
    activeSponsors: records.sponsorships.filter((record) => record.status === "Apoio ativo").length,
    estimatedNegotiatingCents: negotiating.reduce((total, record) => total + (record.estimated_value_cents ?? 0), 0),
    confirmedDonationCents: confirmed.reduce((total, record) => total + record.amount_cents, 0),
    volunteerCount: records.volunteers.length,
    averageDonationCents: confirmed.length ? Math.round(confirmed.reduce((total, record) => total + record.amount_cents, 0) / confirmed.length) : 0
  };
}

export function exportSupportRecords(type: SupportRecordType) {
  const records = listSupportHubRecords();
  const data = type === "sponsorship" ? records.sponsorships : type === "donation" ? records.donations : records.volunteers;
  if (!data.length) return "";
  const columns = Object.keys(data[0]).filter((column) => !["pix_payload", "admin_notes"].includes(column));
  const csvValue = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  return [columns.join(","), ...data.map((row) => columns.map((column) => csvValue((row as unknown as Record<string, unknown>)[column])).join(","))].join("\r\n");
}
