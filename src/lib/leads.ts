import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export type LeadPayload = Record<string, string | boolean | undefined>;

const requiredFields = ["name", "email", "phone", "project_type", "accepted_contact"];

export function validateLead(payload: LeadPayload) {
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

  return { ok: true };
}

let database: DatabaseSync | undefined;

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
  return database;
}

export function saveLead(payload: LeadPayload) {
  const record = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
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
        payload_json,
        created_at
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
        $payload_json,
        $created_at
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
      $age: String(payload.age ?? ""),
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
      $payload_json: JSON.stringify(record),
      $created_at: record.created_at
    });

  return record;
}
