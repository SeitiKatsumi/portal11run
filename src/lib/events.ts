import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

export type MemberEvent = {
  id: string;
  title: string;
  project_type: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
  participants_json: string;
  created_at: string;
  updated_at: string;
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

function normalizeParticipants(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function listMemberEvents() {
  return getDatabase()
    .prepare("SELECT * FROM member_events ORDER BY date(event_date) ASC, event_time ASC, datetime(created_at) DESC")
    .all() as MemberEvent[];
}

export function listEventsForLead(leadId: string, projectType: string) {
  return listMemberEvents().filter((event) => {
    let participants: string[] = [];
    try {
      participants = normalizeParticipants(JSON.parse(event.participants_json || "[]"));
    } catch {
      participants = [];
    }
    const projectMatches = event.project_type === "todos" || event.project_type === projectType;
    return projectMatches && participants.includes(leadId);
  });
}

export function createMemberEvent(input: {
  title: string;
  project_type: string;
  event_date: string;
  event_time?: string;
  location?: string;
  description?: string;
  participants?: string[];
}) {
  const clean = {
    title: input.title.trim(),
    project_type: input.project_type.trim() || "todos",
    event_date: input.event_date.trim(),
    event_time: input.event_time?.trim() || null,
    location: input.location?.trim() || null,
    description: input.description?.trim() || null,
    participants: normalizeParticipants(input.participants)
  };

  if (!clean.title || !clean.event_date || clean.participants.length === 0) {
    throw new Error("Informe título, data e pelo menos um atleta participante.");
  }

  const timestamp = now();
  const record: MemberEvent = {
    id: randomUUID(),
    title: clean.title,
    project_type: clean.project_type,
    event_date: clean.event_date,
    event_time: clean.event_time,
    location: clean.location,
    description: clean.description,
    participants_json: JSON.stringify(clean.participants),
    created_at: timestamp,
    updated_at: timestamp
  };

  getDatabase()
    .prepare(
      `INSERT INTO member_events (
        id, title, project_type, event_date, event_time, location, description, participants_json, created_at, updated_at
      ) VALUES (
        $id, $title, $project_type, $event_date, $event_time, $location, $description, $participants_json, $created_at, $updated_at
      )`
    )
    .run({
      $id: record.id,
      $title: record.title,
      $project_type: record.project_type,
      $event_date: record.event_date,
      $event_time: record.event_time,
      $location: record.location,
      $description: record.description,
      $participants_json: record.participants_json,
      $created_at: record.created_at,
      $updated_at: record.updated_at
    });

  return record;
}

export function deleteMemberEvent(id: string) {
  getDatabase().prepare("DELETE FROM member_events WHERE id = ?").run(id);
}
