import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const registrationEvents = {
  "finalissima-desafio-virtual-2026": { title: "Finalíssima do Desafio Virtual", date: "2026-11-13", minAge: 9, maxAge: 13, school: false },
  "inauguracao-centro-olimpico-vinhedo-2026": { title: "Inauguração do Centro Olímpico de Vinhedo", date: "2026-11-14", minAge: 6, maxAge: 17, school: true }
} as const;

export type RegistrationEventId = keyof typeof registrationEvents;
export type EventParticipant = { name: string; birth_date: string; gender: "Feminino" | "Masculino" | "Não informar" };
export type EventRegistrationInput = {
  event_id: RegistrationEventId;
  registration_type: "individual" | "school";
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  school_name: string | null;
  participants: EventParticipant[];
  consent: true;
  guardian_authorization: true;
};
export type EventRegistration = EventRegistrationInput & { id: string; created_at: string; consent_text: string; guardian_authorization_text: string };

export class EventRegistrationValidationError extends Error {}

const consentText = "Concordo com o uso dos dados informados para organizar esta inscrição e receber orientações sobre o evento, conforme a Política de Privacidade.";
const guardianTexts = {
  individual: "Sou o responsável legal e autorizo a participação da criança ou adolescente neste evento, com acompanhamento de um adulto responsável.",
  school: "Sou responsável pelo grupo escolar e confirmo que a escola possui autorização dos responsáveis legais de todos os alunos inscritos para participar deste evento."
};
const states = new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));
let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  const connection = new DatabaseSync(dbPath);
  connection.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS event_registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      registration_type TEXT NOT NULL CHECK (registration_type IN ('individual', 'school')),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      school_name TEXT,
      consent INTEGER NOT NULL CHECK (consent = 1),
      guardian_authorization INTEGER NOT NULL CHECK (guardian_authorization = 1),
      consent_text TEXT NOT NULL,
      guardian_authorization_text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS event_registration_participants (
      id INTEGER PRIMARY KEY,
      registration_id TEXT NOT NULL REFERENCES event_registrations(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      birth_date TEXT NOT NULL,
      gender TEXT NOT NULL CHECK (gender IN ('Feminino', 'Masculino', 'Não informar'))
    );
    CREATE INDEX IF NOT EXISTS idx_event_registrations_event_created ON event_registrations(event_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_event_registration_participants_registration ON event_registration_participants(registration_id);
  `);
  database = connection;
  return database;
}

function fail(message: string): never {
  throw new EventRegistrationValidationError(message);
}

function text(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== "string") return fail(`Informe ${label}.`);
  const cleaned = value.trim().replace(/\s+/g, " ");
  if (cleaned.length < min || cleaned.length > max || /[\u0000-\u001f\u007f]/.test(cleaned)) return fail(`Informe ${label} válido (até ${max} caracteres).`);
  return cleaned;
}

export function eventParticipantAge(birthDate: string, eventDate: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return fail("Informe uma data de nascimento válida.");
  const date = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate || birthDate > eventDate) return fail("Informe uma data de nascimento válida.");
  return Number(eventDate.slice(0, 4)) - Number(birthDate.slice(0, 4)) - (eventDate.slice(5) < birthDate.slice(5) ? 1 : 0);
}

export function validateEventRegistration(input: unknown): EventRegistrationInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) return fail("Cadastro inválido.");
  const payload = input as Record<string, unknown>;
  if (payload.website !== undefined && payload.website !== "") return fail("Não foi possível enviar a inscrição.");
  if (typeof payload.event_id !== "string" || !Object.hasOwn(registrationEvents, payload.event_id)) return fail("Selecione um evento válido.");
  const eventId = payload.event_id as RegistrationEventId;
  const event = registrationEvents[eventId];
  if (payload.registration_type !== "individual" && payload.registration_type !== "school") return fail("Selecione inscrição individual ou escolar.");
  if (payload.registration_type === "school" && !event.school) return fail("Este evento aceita apenas inscrições individuais.");
  if (payload.consent !== true) return fail("É necessário aceitar a Política de Privacidade para se inscrever.");
  if (payload.guardian_authorization !== true) return fail(payload.registration_type === "school" ? "Confirme as autorizações dos responsáveis por todos os alunos." : "O responsável legal precisa autorizar a participação.");
  const name = text(payload.name, "o nome do responsável", 2, 120);
  const email = text(payload.email, "um e-mail", 5, 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Informe um e-mail válido.");
  const phone = text(payload.phone, "um telefone", 10, 30);
  const phoneDigits = phone.replace(/\D/g, "");
  if (!/^[+\d\s().-]+$/.test(phone) || phoneDigits.length < 10 || phoneDigits.length > 15 || /^(\d)\1+$/.test(phoneDigits)) return fail("Informe um telefone válido com DDD.");
  const city = text(payload.city, "a cidade", 2, 100);
  const state = text(payload.state, "a UF", 2, 2).toUpperCase();
  if (!states.has(state)) return fail("Selecione uma UF válida.");
  const schoolName = payload.registration_type === "school" ? text(payload.school_name, "o nome da escola", 2, 160) : null;
  if (!Array.isArray(payload.participants) || payload.participants.length === 0 || payload.participants.length > 500) return fail("Informe de 1 a 500 participantes.");
  if (payload.registration_type === "individual" && payload.participants.length !== 1) return fail("A inscrição individual deve conter um participante.");
  const seen = new Set<string>();
  const participants = payload.participants.map((item: unknown, index: number): EventParticipant => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return fail(`Revise os dados do participante ${index + 1}.`);
    const participant = item as Record<string, unknown>;
    const participantName = text(participant.name, `o nome do participante ${index + 1}`, 2, 120);
    if (typeof participant.birth_date !== "string") return fail(`Informe o nascimento do participante ${index + 1}.`);
    const age = eventParticipantAge(participant.birth_date, event.date);
    if (age < event.minAge || age > event.maxAge) return fail(`${participantName}: a idade deve ser de ${event.minAge} a ${event.maxAge} anos no dia do evento.`);
    if (participant.gender !== "Feminino" && participant.gender !== "Masculino" && participant.gender !== "Não informar") return fail(`Selecione o gênero do participante ${index + 1}.`);
    const fingerprint = `${participantName.toLocaleLowerCase("pt-BR")}|${participant.birth_date}`;
    if (seen.has(fingerprint)) return fail(`${participantName} está repetido na lista de participantes.`);
    seen.add(fingerprint);
    return { name: participantName, birth_date: participant.birth_date, gender: participant.gender };
  });
  return { event_id: eventId, registration_type: payload.registration_type, name, email, phone, city, state, school_name: schoolName, participants, consent: true, guardian_authorization: true };
}

export function createEventRegistration(input: unknown) {
  const clean = validateEventRegistration(input);
  const db = getDatabase();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare(`INSERT INTO event_registrations
      (id, event_id, registration_type, name, email, phone, city, state, school_name, consent, guardian_authorization, consent_text, guardian_authorization_text, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?, ?)`)
      .run(id, clean.event_id, clean.registration_type, clean.name, clean.email, clean.phone, clean.city, clean.state, clean.school_name, consentText, guardianTexts[clean.registration_type], createdAt);
    const statement = db.prepare("INSERT INTO event_registration_participants (registration_id, name, birth_date, gender) VALUES (?, ?, ?, ?)");
    for (const participant of clean.participants) statement.run(id, participant.name, participant.birth_date, participant.gender);
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
  return { registrationId: id, participantCount: clean.participants.length };
}

export function listEventRegistrations(): EventRegistration[] {
  const db = getDatabase();
  const registrations = db.prepare("SELECT * FROM event_registrations ORDER BY created_at DESC, id").all() as Array<Omit<EventRegistration, "participants" | "consent" | "guardian_authorization"> & { consent: number; guardian_authorization: number }>;
  const participants = db.prepare("SELECT registration_id, name, birth_date, gender FROM event_registration_participants ORDER BY id").all() as Array<EventParticipant & { registration_id: string }>;
  const byRegistration = new Map<string, EventParticipant[]>();
  for (const { registration_id, ...participant } of participants) {
    const group = byRegistration.get(registration_id) ?? [];
    group.push(participant);
    byRegistration.set(registration_id, group);
  }
  return registrations.map((registration) => ({ ...registration, consent: true, guardian_authorization: true, participants: byRegistration.get(registration.id) ?? [] }));
}
