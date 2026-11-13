import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { listLeads } from "./leads.ts";

export const CROSS_COUNTRY_COMPETITION_ID = "cross-country-ivcl-2026";
export const CROSS_COUNTRY_PUBLIC_SLUG = "circuito-cross-country-ivcl-11run";
export const VIRTUAL_CHALLENGE_KIND = "virtual-challenge";

export type RaceStatus = "READY" | "ARMED" | "RUNNING" | "HOMOLOGATED" | "CANCELLED";
export type AthleteResultStatus = "ACTIVE" | "DNS" | "DNF" | "DSQ";
export type FinishStatus = "PROVISIONAL" | "FINAL" | "VOID";

export type CompetitionRace = {
  id: string;
  competition_id: string;
  title: string;
  categories: string[];
  distance_m: number;
  scheduled_time: string;
  sort_order: number;
  session_id: string | null;
  status: RaceStatus;
  session_status: RaceStatus | null;
  started_at: string | null;
  started_device_epoch_ms: number | null;
  paused_elapsed_ms: number;
  device_id: string | null;
};

export type CompetitionEntry = {
  id: string;
  competition_id: string;
  race_id: string;
  source_id: string;
  name: string;
  category: string;
  gender: "Feminino" | "Masculino";
  city: string;
  bib_number: number | null;
  result_status: AthleteResultStatus;
  active: number;
};

export type CompetitionEdition = {
  id: string;
  public_slug: string;
  title: string;
  event_date: string;
  location: string;
  kind: string;
  status: "DRAFT" | "LIVE" | "FINISHED";
  created_at: string;
  updated_at: string;
};

export type CompetitionResult = {
  id: string;
  raceId: string;
  raceTitle: string;
  category: string;
  gender: string;
  position: number | null;
  bibNumber: number;
  bib: string;
  name: string;
  city: string;
  elapsedMs: number | null;
  formattedTime: string;
  status: AthleteResultStatus | FinishStatus;
  provisional: boolean;
};

const raceSeed = [
  { id: "cross-u18", title: "16 e 17 anos", categories: ["Sub 17", "Sub 18"], distance: 4000, time: "08:00" },
  { id: "cross-u16", title: "14 e 15 anos", categories: ["Sub 15", "Sub 16"], distance: 3000, time: "08:40" },
  { id: "cross-u14", title: "12 e 13 anos", categories: ["Sub 13", "Sub 14"], distance: 2000, time: "09:00" },
  { id: "cross-u12", title: "10 e 11 anos", categories: ["Sub 11", "Sub 12"], distance: 1000, time: "09:20" },
  { id: "cross-u10", title: "9 anos ou menos", categories: ["Sub 10"], distance: 1000, time: "09:35" }
] as const;

let database: DatabaseSync | undefined;

function db() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS competitions (
      id TEXT PRIMARY KEY,
      public_slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      event_date TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      kind TEXT NOT NULL DEFAULT 'cross-country',
      status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','LIVE','FINISHED')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS competition_races (
      id TEXT PRIMARY KEY,
      competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      categories_json TEXT NOT NULL,
      distance_m INTEGER NOT NULL,
      scheduled_time TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS competition_entries (
      id TEXT PRIMARY KEY,
      competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
      race_id TEXT NOT NULL REFERENCES competition_races(id),
      source_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      gender TEXT NOT NULL CHECK (gender IN ('Feminino','Masculino')),
      city TEXT NOT NULL,
      bib_number INTEGER CHECK (bib_number BETWEEN 1 AND 9999),
      result_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (result_status IN ('ACTIVE','DNS','DNF','DSQ')),
      active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (competition_id, source_id),
      UNIQUE (competition_id, bib_number)
    );
    CREATE TABLE IF NOT EXISTS competition_sessions (
      id TEXT PRIMARY KEY,
      competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
      race_id TEXT NOT NULL REFERENCES competition_races(id),
      status TEXT NOT NULL CHECK (status IN ('ARMED','RUNNING','HOMOLOGATED','CANCELLED')),
      device_id TEXT NOT NULL,
      armed_at TEXT NOT NULL,
      started_at TEXT,
      started_device_epoch_ms INTEGER,
      homologated_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS competition_finishes (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES competition_sessions(id),
      entry_id TEXT NOT NULL REFERENCES competition_entries(id),
      client_event_id TEXT NOT NULL UNIQUE,
      elapsed_ms INTEGER NOT NULL CHECK (elapsed_ms >= 0),
      adjustment_ms INTEGER NOT NULL DEFAULT 0,
      manual_rank INTEGER CHECK (manual_rank > 0),
      status TEXT NOT NULL DEFAULT 'PROVISIONAL' CHECK (status IN ('PROVISIONAL','FINAL','VOID')),
      captured_at TEXT NOT NULL,
      received_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_competition_finish_entry_session
      ON competition_finishes(session_id, entry_id) WHERE status <> 'VOID';
    CREATE INDEX IF NOT EXISTS idx_competition_entries_race_bib ON competition_entries(race_id, bib_number);
    CREATE INDEX IF NOT EXISTS idx_competition_finishes_session ON competition_finishes(session_id, status, elapsed_ms);
    CREATE TABLE IF NOT EXISTS competition_audit (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      competition_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      before_json TEXT,
      after_json TEXT,
      reason TEXT,
      created_at TEXT NOT NULL
    );
  `);
  const sessionColumns = database.prepare("PRAGMA table_info(competition_sessions)").all() as Array<{ name: string }>;
  if (!sessionColumns.some((column) => column.name === "paused_elapsed_ms")) {
    database.exec("ALTER TABLE competition_sessions ADD COLUMN paused_elapsed_ms INTEGER NOT NULL DEFAULT 0");
  }
  const competitionColumns = database.prepare("PRAGMA table_info(competitions)").all() as Array<{ name: string }>;
  if (!competitionColumns.some((column) => column.name === "location")) database.exec("ALTER TABLE competitions ADD COLUMN location TEXT NOT NULL DEFAULT ''");
  if (!competitionColumns.some((column) => column.name === "kind")) database.exec("ALTER TABLE competitions ADD COLUMN kind TEXT NOT NULL DEFAULT 'cross-country'");
  seedCrossCountry(database);
  return database;
}

function seedCrossCountry(connection: DatabaseSync) {
  const now = new Date().toISOString();
  connection.prepare(`INSERT OR IGNORE INTO competitions (id, public_slug, title, event_date, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'DRAFT', ?, ?)`)
    .run(CROSS_COUNTRY_COMPETITION_ID, CROSS_COUNTRY_PUBLIC_SLUG, "Circuito de Cross Country IVCL 11RUN", "2026-11-15", now, now);
  const insert = connection.prepare(`INSERT OR IGNORE INTO competition_races
    (id, competition_id, title, categories_json, distance_m, scheduled_time, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  raceSeed.forEach((race, index) => insert.run(race.id, CROSS_COUNTRY_COMPETITION_ID, race.title, JSON.stringify(race.categories), race.distance, race.time, index));
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeGender(value: unknown) {
  const gender = clean(value).toLocaleLowerCase("pt-BR");
  if (["f", "feminino"].includes(gender)) return "Feminino" as const;
  if (["m", "masculino"].includes(gender)) return "Masculino" as const;
  return null;
}

function raceForCategory(category: string) {
  return raceSeed.find((race) => (race.categories as readonly string[]).includes(category));
}

function requireVirtualCompetition(competitionId: string) {
  const competition = db().prepare("SELECT * FROM competitions WHERE id=? AND kind=?").get(competitionId, VIRTUAL_CHALLENGE_KIND) as CompetitionEdition | undefined;
  if (!competition) throw new Error("Edição do Desafio Virtual não encontrada.");
  return competition;
}

function audit(connection: DatabaseSync, competitionId: string, entityType: string, entityId: string, action: string, actor: string, before: unknown, after: unknown, reason = "") {
  connection.prepare(`INSERT INTO competition_audit
    (competition_id, entity_type, entity_id, action, actor, before_json, after_json, reason, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(competitionId, entityType, entityId, action, actor, before === undefined ? null : JSON.stringify(before), after === undefined ? null : JSON.stringify(after), reason || null, new Date().toISOString());
}

export function formatBib(value: number) {
  return String(value).padStart(4, "0");
}

export function formatCompetitionTime(value: number | null) {
  if (value === null) return "—";
  const totalCentiseconds = Math.max(0, Math.round(value / 10));
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function listCompetitionRaces(competitionId = CROSS_COUNTRY_COMPETITION_ID): CompetitionRace[] {
  const rows = db().prepare(`
    SELECT r.*, s.id AS session_id,
      CASE WHEN s.status IS NULL OR s.status = 'CANCELLED' THEN 'READY' ELSE s.status END AS status,
      s.status AS session_status, s.started_at, s.started_device_epoch_ms,
      COALESCE(s.paused_elapsed_ms, 0) AS paused_elapsed_ms, s.device_id
    FROM competition_races r
    LEFT JOIN competition_sessions s ON s.id = (
      SELECT id FROM competition_sessions WHERE race_id = r.id ORDER BY created_at DESC LIMIT 1
    )
    WHERE r.competition_id = ? ORDER BY r.sort_order
  `).all(competitionId) as Array<Omit<CompetitionRace, "categories"> & { categories_json: string }>;
  return rows.map(({ categories_json, ...race }) => ({ ...race, categories: JSON.parse(categories_json) as string[] }));
}

export function listCompetitionEntries(competitionId = CROSS_COUNTRY_COMPETITION_ID) {
  return db().prepare(`SELECT * FROM competition_entries WHERE competition_id = ? AND active = 1
    ORDER BY bib_number IS NULL, bib_number, CAST(replace(category, 'Sub ', '') AS INTEGER), gender, name COLLATE NOCASE`)
    .all(competitionId) as CompetitionEntry[];
}

export function listVirtualChallengeEditions() {
  return db().prepare("SELECT * FROM competitions WHERE kind=? ORDER BY event_date DESC, created_at DESC").all(VIRTUAL_CHALLENGE_KIND) as CompetitionEdition[];
}

export function createVirtualChallengeEdition(input: { title: string; location: string; eventDate: string }, actor = "admin") {
  const title = clean(input.title);
  const location = clean(input.location);
  const eventDate = clean(input.eventDate);
  if (title.length < 3 || title.length > 120) throw new Error("Informe um nome de edição com 3 a 120 caracteres.");
  if (location.length < 2 || location.length > 160) throw new Error("Informe o local da edição.");
  const date = new Date(`${eventDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== eventDate) throw new Error("Informe uma data válida.");
  const connection = db();
  const id = `virtual-${eventDate}-${randomUUID().slice(0, 8)}`;
  const slug = `desafio-virtual-${eventDate}-${randomUUID().slice(0, 6)}`;
  const raceId = `${id}-1000m`;
  const now = new Date().toISOString();
  connection.exec("BEGIN IMMEDIATE");
  try {
    connection.prepare(`INSERT INTO competitions (id, public_slug, title, event_date, location, kind, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`).run(id, slug, title, eventDate, location, VIRTUAL_CHALLENGE_KIND, now, now);
    connection.prepare(`INSERT INTO competition_races
      (id, competition_id, title, categories_json, distance_m, scheduled_time, sort_order) VALUES (?, ?, ?, ?, 1000, 'Largada única', 0)`)
      .run(raceId, id, "9 a 13 anos", JSON.stringify(["Sub 10", "Sub 11", "Sub 12", "Sub 13", "Sub 14"]));
    audit(connection, id, "competition", id, "CREATE_VIRTUAL_EDITION", actor, undefined, { title, location, eventDate });
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return requireVirtualCompetition(id);
}

export function registerVirtualChallengeAthlete(input: { competitionId: string; name: string; age: number; gender: string; city?: string }, actor = "admin") {
  const competition = requireVirtualCompetition(clean(input.competitionId));
  const name = clean(input.name);
  const age = Number(input.age);
  const gender = normalizeGender(input.gender);
  const city = clean(input.city) || competition.location;
  if (name.length < 3 || name.length > 120) throw new Error("Informe o nome completo do atleta.");
  if (!Number.isInteger(age) || age < 9 || age > 13) throw new Error("A idade deve estar entre 9 e 13 anos.");
  if (!gender) throw new Error("Selecione o gênero esportivo.");
  const category = `Sub ${age + 1}`;
  const connection = db();
  const race = connection.prepare("SELECT id FROM competition_races WHERE competition_id=? AND categories_json LIKE ? LIMIT 1").get(competition.id, `%\"${category}\"%`) as { id: string } | undefined;
  if (!race) throw new Error("Categoria não configurada nesta edição.");
  const used = new Set((connection.prepare("SELECT bib_number FROM competition_entries WHERE competition_id=? AND bib_number IS NOT NULL").all(competition.id) as Array<{ bib_number: number }>).map((row) => row.bib_number));
  let bibNumber = 1;
  while (used.has(bibNumber)) bibNumber++;
  if (bibNumber > 9999) throw new Error("Não há mais números disponíveis nesta edição.");
  const id = randomUUID();
  const now = new Date().toISOString();
  connection.prepare(`INSERT INTO competition_entries
    (id, competition_id, race_id, source_id, name, category, gender, city, bib_number, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, competition.id, race.id, `on-site:${id}`, name, category, gender, city, bibNumber, now, now);
  const entry = connection.prepare("SELECT * FROM competition_entries WHERE id=?").get(id) as CompetitionEntry;
  audit(connection, competition.id, "entry", id, "REGISTER_ON_SITE", actor, undefined, entry);
  return { ...entry, bib: formatBib(bibNumber), age };
}

export function competitionIdForRace(raceId: string) {
  const row = db().prepare("SELECT competition_id FROM competition_races WHERE id=?").get(raceId) as { competition_id: string } | undefined;
  if (!row) throw new Error("Largada não encontrada.");
  return row.competition_id;
}

export function competitionIdForFinish(finishId: string) {
  const row = db().prepare(`SELECT e.competition_id FROM competition_finishes f JOIN competition_entries e ON e.id=f.entry_id WHERE f.id=?`).get(finishId) as { competition_id: string } | undefined;
  if (!row) throw new Error("Resultado não encontrado.");
  return row.competition_id;
}

export function importAcceptedCrossCountryEntries(actor = "admin") {
  const connection = db();
  const started = connection.prepare("SELECT 1 FROM competition_sessions WHERE competition_id = ? AND status IN ('RUNNING','HOMOLOGATED') LIMIT 1").get(CROSS_COUNTRY_COMPETITION_ID);
  const accepted = listLeads().filter((lead) => lead.project_type === CROSS_COUNTRY_PUBLIC_SLUG && lead.pipeline_status === "Aceitas");
  const valid: Array<{ sourceId: string; name: string; category: string; gender: "Feminino" | "Masculino"; city: string; raceId: string }> = [];
  const rejected: string[] = [];
  for (const lead of accepted) {
    let payload: Record<string, unknown> = {};
    try { payload = JSON.parse(lead.payload_json) as Record<string, unknown>; } catch { /* surfaced below */ }
    const name = clean(lead.athlete_name) || clean(payload.athlete_name);
    const category = (clean(lead.category) || clean(payload.category)).replace(/^sub\s*(\d+)$/i, "Sub $1");
    const gender = normalizeGender(payload.gender);
    const race = raceForCategory(category);
    const cityName = clean(lead.city) || clean(payload.city);
    const state = (clean(lead.state) || clean(payload.state)).toUpperCase();
    if (!name || !gender || !race || !cityName) {
      rejected.push(name || lead.id);
      continue;
    }
    valid.push({ sourceId: lead.id, name, category, gender, city: state ? `${cityName}/${state}` : cityName, raceId: race.id });
  }
  const now = new Date().toISOString();
  const upsert = connection.prepare(`INSERT INTO competition_entries
    (id, competition_id, race_id, source_id, name, category, gender, city, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(competition_id, source_id) DO UPDATE SET race_id=excluded.race_id, name=excluded.name,
      category=excluded.category, gender=excluded.gender, city=excluded.city, active=1, updated_at=excluded.updated_at`);
  const deactivate = connection.prepare("UPDATE competition_entries SET active=0, updated_at=? WHERE competition_id=? AND source_id NOT IN (SELECT value FROM json_each(?)) AND bib_number IS NULL");
  connection.exec("BEGIN IMMEDIATE");
  try {
    for (const entry of valid) upsert.run(randomUUID(), CROSS_COUNTRY_COMPETITION_ID, entry.raceId, entry.sourceId, entry.name, entry.category, entry.gender, entry.city, now, now);
    if (!started) deactivate.run(now, CROSS_COUNTRY_COMPETITION_ID, JSON.stringify(valid.map((entry) => entry.sourceId)));
    audit(connection, CROSS_COUNTRY_COMPETITION_ID, "competition", CROSS_COUNTRY_COMPETITION_ID, "IMPORT_ACCEPTED", actor, undefined, { imported: valid.length, rejected });
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return { imported: valid.length, rejected };
}

export function previewBibAssignment(start: number, competitionId = CROSS_COUNTRY_COMPETITION_ID) {
  if (!Number.isInteger(start) || start < 1 || start > 9999) throw new Error("Informe um número inicial entre 0001 e 9999.");
  const entries = [...listCompetitionEntries(competitionId)].sort((a, b) => Number(a.category.replace(/\D/g, "")) - Number(b.category.replace(/\D/g, "")) || a.gender.localeCompare(b.gender, "pt-BR") || a.name.localeCompare(b.name, "pt-BR"));
  if (!entries.length) throw new Error("Importe os atletas aceitos antes de gerar a numeração.");
  if (start + entries.length - 1 > 9999) throw new Error("A sequência ultrapassa o número 9999.");
  return entries.map((entry, index) => ({ entryId: entry.id, name: entry.name, category: entry.category, gender: entry.gender, bibNumber: start + index, bib: formatBib(start + index) }));
}

export function assignBibNumbers(start: number, actor = "admin", competitionId = CROSS_COUNTRY_COMPETITION_ID) {
  const connection = db();
  const started = connection.prepare("SELECT 1 FROM competition_sessions WHERE competition_id=? AND status IN ('RUNNING','HOMOLOGATED') LIMIT 1").get(competitionId);
  if (started) throw new Error("A numeração geral fica bloqueada depois da primeira largada.");
  const preview = previewBibAssignment(start, competitionId);
  connection.exec("BEGIN IMMEDIATE");
  try {
    connection.prepare("UPDATE competition_entries SET bib_number=NULL WHERE competition_id=?").run(competitionId);
    const update = connection.prepare("UPDATE competition_entries SET bib_number=?, updated_at=? WHERE id=?");
    const now = new Date().toISOString();
    for (const item of preview) update.run(item.bibNumber, now, item.entryId);
    audit(connection, competitionId, "competition", competitionId, "ASSIGN_BIBS", actor, undefined, { start, end: start + preview.length - 1, count: preview.length });
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return preview;
}

export function assignBibNumber(entryId: string, bibNumber: number, actor = "admin") {
  if (!Number.isInteger(bibNumber) || bibNumber < 1 || bibNumber > 9999) throw new Error("Informe um número entre 0001 e 9999.");
  const connection = db();
  const before = connection.prepare("SELECT * FROM competition_entries WHERE id=?").get(entryId) as CompetitionEntry | undefined;
  if (!before) throw new Error("Atleta não encontrado.");
  try {
    connection.prepare("UPDATE competition_entries SET bib_number=?, updated_at=? WHERE id=?").run(bibNumber, new Date().toISOString(), entryId);
  } catch {
    throw new Error(`O número ${formatBib(bibNumber)} já está em uso nesta competição.`);
  }
  const after = connection.prepare("SELECT * FROM competition_entries WHERE id=?").get(entryId);
  audit(connection, before.competition_id, "entry", entryId, "ASSIGN_BIB", actor, before, after);
  return after;
}

export function armRace(raceId: string, deviceId: string, actor = "admin") {
  if (!deviceId.trim()) throw new Error("Identifique o dispositivo de cronometragem.");
  const connection = db();
  const race = connection.prepare("SELECT * FROM competition_races WHERE id=?").get(raceId) as { competition_id: string } | undefined;
  if (!race) throw new Error("Largada não encontrada.");
  const current = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; status: RaceStatus } | undefined;
  if (current && ["ARMED", "RUNNING", "HOMOLOGATED"].includes(current.status)) return current;
  const id = randomUUID();
  const now = new Date().toISOString();
  connection.prepare(`INSERT INTO competition_sessions (id, competition_id, race_id, status, device_id, armed_at, created_at)
    VALUES (?, ?, ?, 'ARMED', ?, ?, ?)`)
    .run(id, race.competition_id, raceId, deviceId, now, now);
  audit(connection, race.competition_id, "session", id, "ARM", actor, undefined, { raceId, deviceId });
  return connection.prepare("SELECT * FROM competition_sessions WHERE id=?").get(id);
}

export function startRace(raceId: string, deviceId: string, deviceEpochMs: number, actor = "admin") {
  const connection = db();
  const session = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; competition_id: string; status: RaceStatus; device_id: string; paused_elapsed_ms: number } | undefined;
  if (!session || session.status !== "ARMED") throw new Error("Arme a largada antes de iniciar.");
  if (session.device_id !== deviceId) throw new Error("Esta largada foi armada em outro dispositivo.");
  if (!Number.isFinite(deviceEpochMs) || deviceEpochMs <= 0) throw new Error("Horário do dispositivo inválido.");
  const now = new Date().toISOString();
  const effectiveEpoch = Math.round(deviceEpochMs - Math.max(0, session.paused_elapsed_ms));
  connection.prepare("UPDATE competition_sessions SET status='RUNNING', started_at=COALESCE(started_at, ?), started_device_epoch_ms=?, paused_elapsed_ms=0 WHERE id=?").run(now, effectiveEpoch, session.id);
  connection.prepare("UPDATE competitions SET status='LIVE', updated_at=? WHERE id=?").run(now, session.competition_id);
  audit(connection, session.competition_id, "session", session.id, session.paused_elapsed_ms ? "RESUME" : "START", actor, session, { ...session, status: "RUNNING", started_at: now, started_device_epoch_ms: effectiveEpoch, paused_elapsed_ms: 0 });
  return connection.prepare("SELECT * FROM competition_sessions WHERE id=?").get(session.id);
}

export function pauseRace(raceId: string, deviceId: string, deviceEpochMs: number, actor = "timer") {
  const connection = db();
  const session = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; competition_id: string; status: RaceStatus; device_id: string; started_device_epoch_ms: number | null } | undefined;
  if (!session || session.status !== "RUNNING" || !session.started_device_epoch_ms) throw new Error("A largada não está em andamento.");
  if (session.device_id !== deviceId) throw new Error("Esta largada pertence a outro dispositivo.");
  if (!Number.isFinite(deviceEpochMs) || deviceEpochMs <= session.started_device_epoch_ms) throw new Error("Horário do dispositivo inválido.");
  const elapsed = Math.round(deviceEpochMs - session.started_device_epoch_ms);
  connection.prepare("UPDATE competition_sessions SET status='ARMED', started_device_epoch_ms=NULL, paused_elapsed_ms=? WHERE id=?").run(elapsed, session.id);
  audit(connection, session.competition_id, "session", session.id, "PAUSE", actor, session, { ...session, status: "ARMED", started_device_epoch_ms: null, paused_elapsed_ms: elapsed });
  return connection.prepare("SELECT * FROM competition_sessions WHERE id=?").get(session.id);
}

export function resetRace(raceId: string, actor = "admin", reason = "") {
  if (!reason.trim()) throw new Error("Informe a confirmação do reset.");
  const connection = db();
  const session = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; competition_id: string; status: RaceStatus } | undefined;
  if (!session) return null;
  const now = new Date().toISOString();
  connection.exec("BEGIN IMMEDIATE");
  try {
    connection.prepare("UPDATE competition_finishes SET status='VOID', updated_at=? WHERE session_id=? AND status<>'VOID'").run(now, session.id);
    connection.prepare("UPDATE competition_entries SET result_status='ACTIVE', updated_at=? WHERE race_id=?").run(now, raceId);
    connection.prepare("UPDATE competition_sessions SET status='CANCELLED', started_device_epoch_ms=NULL, paused_elapsed_ms=0 WHERE id=?").run(session.id);
    const active = connection.prepare("SELECT 1 FROM competition_sessions WHERE competition_id=? AND status IN ('RUNNING','HOMOLOGATED') LIMIT 1").get(session.competition_id);
    if (!active) connection.prepare("UPDATE competitions SET status='DRAFT', updated_at=? WHERE id=?").run(now, session.competition_id);
    audit(connection, session.competition_id, "session", session.id, "RESET", actor, session, { ...session, status: "CANCELLED" }, reason);
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return { raceId, reset: true };
}

export function resetCompetition(competitionId = CROSS_COUNTRY_COMPETITION_ID, actor = "admin", reason = "") {
  if (!reason.trim()) throw new Error("Confirme a limpeza dos testes.");
  const connection = db();
  const running = connection.prepare("SELECT 1 FROM competition_sessions WHERE competition_id=? AND status='RUNNING' LIMIT 1").get(competitionId);
  if (running) throw new Error("Pause todas as baterias antes de limpar os testes.");
  const now = new Date().toISOString();
  connection.exec("BEGIN IMMEDIATE");
  try {
    const finishes = connection.prepare(`UPDATE competition_finishes SET status='VOID', updated_at=?
      WHERE session_id IN (SELECT id FROM competition_sessions WHERE competition_id=?) AND status<>'VOID'`).run(now, competitionId);
    connection.prepare("UPDATE competition_entries SET result_status='ACTIVE', updated_at=? WHERE competition_id=?").run(now, competitionId);
    const sessions = connection.prepare(`UPDATE competition_sessions SET status='CANCELLED', started_at=NULL,
      started_device_epoch_ms=NULL, paused_elapsed_ms=0, homologated_at=NULL WHERE competition_id=? AND status<>'CANCELLED'`).run(competitionId);
    connection.prepare("UPDATE competitions SET status='DRAFT', updated_at=? WHERE id=?").run(now, competitionId);
    const summary = { finishes: Number(finishes.changes), sessions: Number(sessions.changes) };
    audit(connection, competitionId, "competition", competitionId, "RESET_TESTS", actor, undefined, summary, reason);
    connection.exec("COMMIT");
    return summary;
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}

type FinishInput = { clientEventId: string; bibNumber: number; elapsedMs: number; capturedAt: string; deviceId: string };

export function syncRaceFinishes(raceId: string, items: FinishInput[], actor = "timer") {
  if (!Array.isArray(items) || items.length < 1 || items.length > 500) throw new Error("Envie de 1 a 500 chegadas.");
  const connection = db();
  const session = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; competition_id: string; status: RaceStatus; device_id: string } | undefined;
  if (!session || session.status !== "RUNNING") throw new Error("A largada não está em andamento.");
  const accepted: string[] = [];
  const rejected: Array<{ clientEventId: string; error: string }> = [];
  const insert = connection.prepare(`INSERT INTO competition_finishes
    (id, session_id, entry_id, client_event_id, elapsed_ms, captured_at, received_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  connection.exec("BEGIN IMMEDIATE");
  try {
    for (const item of items) {
      try {
        const existing = connection.prepare("SELECT id FROM competition_finishes WHERE client_event_id=?").get(item.clientEventId) as { id: string } | undefined;
        if (existing) { accepted.push(item.clientEventId); continue; }
        if (!item.clientEventId || !Number.isInteger(item.bibNumber) || !Number.isFinite(item.elapsedMs) || item.elapsedMs < 0 || !item.capturedAt || item.deviceId !== session.device_id) throw new Error("Leitura inválida.");
        const entry = connection.prepare("SELECT * FROM competition_entries WHERE competition_id=? AND race_id=? AND bib_number=? AND active=1").get(session.competition_id, raceId, item.bibNumber) as CompetitionEntry | undefined;
        if (!entry) throw new Error("Número inexistente ou atleta de outra largada.");
        const now = new Date().toISOString();
        insert.run(randomUUID(), session.id, entry.id, item.clientEventId, Math.round(item.elapsedMs), item.capturedAt, now, now);
        accepted.push(item.clientEventId);
      } catch (error) {
        rejected.push({ clientEventId: item.clientEventId, error: error instanceof Error && error.message.includes("UNIQUE") ? "Atleta já registrado nesta largada." : error instanceof Error ? error.message : "Não foi possível registrar." });
      }
    }
    audit(connection, session.competition_id, "session", session.id, "SYNC_FINISHES", actor, undefined, { accepted, rejected });
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return { accepted, rejected, results: buildResults(session.competition_id) };
}

function currentFinishRows(competitionId: string) {
  return db().prepare(`
    SELECT f.*, e.race_id, e.bib_number, e.name, e.category, e.gender, e.city, e.result_status,
      r.title AS race_title, s.status AS session_status
    FROM competition_finishes f
    JOIN competition_sessions s ON s.id=f.session_id
    JOIN competition_entries e ON e.id=f.entry_id
    JOIN competition_races r ON r.id=e.race_id
    WHERE e.competition_id=? AND e.active=1 AND f.status <> 'VOID'
      AND s.id=(SELECT id FROM competition_sessions WHERE race_id=e.race_id ORDER BY created_at DESC LIMIT 1)
  `).all(competitionId) as Array<{
    id: string; race_id: string; bib_number: number; name: string; category: string; gender: string; city: string;
    result_status: AthleteResultStatus; race_title: string; session_status: RaceStatus; elapsed_ms: number;
    adjustment_ms: number; manual_rank: number | null; status: FinishStatus; received_at: string;
  }>;
}

export function buildResults(competitionId = CROSS_COUNTRY_COMPETITION_ID): CompetitionResult[] {
  const rows = currentFinishRows(competitionId);
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = `${row.race_id}|${row.category}|${row.gender}`;
    const group = groups.get(key) ?? [];
    group.push(row);
    groups.set(key, group);
  }
  const results: CompetitionResult[] = [];
  for (const group of groups.values()) {
    group.sort((a, b) => {
      if (a.manual_rank !== null || b.manual_rank !== null) return (a.manual_rank ?? 10000) - (b.manual_rank ?? 10000) || (a.elapsed_ms + a.adjustment_ms) - (b.elapsed_ms + b.adjustment_ms) || a.received_at.localeCompare(b.received_at);
      return (a.elapsed_ms + a.adjustment_ms) - (b.elapsed_ms + b.adjustment_ms) || a.received_at.localeCompare(b.received_at);
    });
    let position = 0;
    for (const row of group) {
      const active = row.result_status === "ACTIVE";
      if (active) position++;
      const elapsed = active ? Math.max(0, row.elapsed_ms + row.adjustment_ms) : null;
      results.push({
        id: row.id, raceId: row.race_id, raceTitle: row.race_title, category: row.category, gender: row.gender,
        position: active ? position : null, bibNumber: row.bib_number, bib: formatBib(row.bib_number), name: row.name,
        city: row.city, elapsedMs: elapsed, formattedTime: formatCompetitionTime(elapsed), status: active ? row.status : row.result_status,
        provisional: row.session_status !== "HOMOLOGATED"
      });
    }
  }
  return results.sort((a, b) => raceSeed.findIndex((race) => race.id === a.raceId) - raceSeed.findIndex((race) => race.id === b.raceId) || Number(a.category.replace(/\D/g, "")) - Number(b.category.replace(/\D/g, "")) || a.gender.localeCompare(b.gender, "pt-BR") || (a.position ?? 9999) - (b.position ?? 9999));
}

export function publicCompetitionResults(slug = CROSS_COUNTRY_PUBLIC_SLUG) {
  const competition = db().prepare("SELECT * FROM competitions WHERE public_slug=?").get(slug) as { id: string; title: string; status: string; updated_at: string } | undefined;
  if (!competition) throw new Error("Competição não encontrada.");
  const races = listCompetitionRaces(competition.id).map((race) => ({
    id: race.id, competition_id: race.competition_id, title: race.title, categories: race.categories,
    distance_m: race.distance_m, scheduled_time: race.scheduled_time, sort_order: race.sort_order,
    session_id: race.session_id, status: race.status, started_at: race.started_at
  }));
  return { competition: { id: competition.id, title: competition.title, status: competition.status }, races, results: buildResults(competition.id), live: races.some((race) => race.status === "RUNNING"), updatedAt: new Date().toISOString() };
}

export function competitionAdminData(competitionId = CROSS_COUNTRY_COMPETITION_ID) {
  const competition = db().prepare("SELECT * FROM competitions WHERE id=?").get(competitionId);
  return { competition, races: listCompetitionRaces(competitionId), entries: listCompetitionEntries(competitionId), results: buildResults(competitionId) };
}

export function updateFinish(finishId: string, input: { elapsedMs?: number; adjustmentMs?: number; manualRank?: number | null; resultStatus?: AthleteResultStatus; status?: FinishStatus; entryId?: string }, actor = "admin", reason = "") {
  const connection = db();
  const before = connection.prepare(`SELECT f.*, e.competition_id, e.id AS current_entry_id, s.status AS session_status
    FROM competition_finishes f JOIN competition_entries e ON e.id=f.entry_id JOIN competition_sessions s ON s.id=f.session_id WHERE f.id=?`).get(finishId) as Record<string, unknown> | undefined;
  if (!before) throw new Error("Resultado não encontrado.");
  if (before.session_status === "HOMOLOGATED") throw new Error("Reabra a bateria antes de editar um resultado homologado.");
  const entryId = input.entryId ?? String(before.current_entry_id);
  const competitionId = String(before.competition_id);
  const entry = connection.prepare("SELECT * FROM competition_entries WHERE id=? AND competition_id=?").get(entryId, competitionId) as CompetitionEntry | undefined;
  if (!entry) throw new Error("Atleta inválido.");
  const targetSession = connection.prepare("SELECT id, status FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(entry.race_id) as { id: string; status: RaceStatus } | undefined;
  if (!targetSession || !["ARMED", "RUNNING"].includes(targetSession.status)) throw new Error("A bateria de destino precisa estar armada ou em andamento.");
  const elapsedMs = input.elapsedMs ?? Number(before.elapsed_ms);
  const adjustmentMs = input.adjustmentMs ?? Number(before.adjustment_ms);
  if (!Number.isInteger(elapsedMs) || elapsedMs < 0 || !Number.isInteger(adjustmentMs)) throw new Error("Tempo inválido.");
  const manualRank = input.manualRank === undefined ? (before.manual_rank === null ? null : Number(before.manual_rank)) : input.manualRank;
  if (manualRank !== null && (!Number.isInteger(manualRank) || Number(manualRank) < 1)) throw new Error("Ordem manual inválida.");
  const finishStatus = input.status ?? String(before.status) as FinishStatus;
  const resultStatus = input.resultStatus ?? entry.result_status;
  connection.exec("BEGIN IMMEDIATE");
  try {
    connection.prepare(`UPDATE competition_finishes SET session_id=?, entry_id=?, elapsed_ms=?, adjustment_ms=?, manual_rank=?, status=?, updated_at=? WHERE id=?`)
      .run(targetSession.id, entryId, elapsedMs, adjustmentMs, manualRank, finishStatus, new Date().toISOString(), finishId);
    connection.prepare("UPDATE competition_entries SET result_status=?, updated_at=? WHERE id=?").run(resultStatus, new Date().toISOString(), entryId);
    const after = connection.prepare("SELECT * FROM competition_finishes WHERE id=?").get(finishId);
    audit(connection, String(before.competition_id), "finish", finishId, "UPDATE_FINISH", actor, before, after, reason);
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return buildResults(competitionId);
}

export function addManualFinish(raceId: string, entryId: string, elapsedMs: number, actor = "admin", reason = "Inclusão manual") {
  const connection = db();
  const session = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; competition_id: string; status: RaceStatus } | undefined;
  if (!session || !["RUNNING", "ARMED"].includes(session.status)) throw new Error("Inicie a largada antes de inserir uma chegada.");
  const entry = connection.prepare("SELECT * FROM competition_entries WHERE id=? AND race_id=?").get(entryId, raceId) as CompetitionEntry | undefined;
  if (!entry) throw new Error("Atleta inválido para esta largada.");
  const id = randomUUID();
  const now = new Date().toISOString();
  connection.prepare(`INSERT INTO competition_finishes
    (id, session_id, entry_id, client_event_id, elapsed_ms, captured_at, received_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, session.id, entryId, `manual:${randomUUID()}`, Math.round(elapsedMs), now, now, now);
  audit(connection, session.competition_id, "finish", id, "ADD_MANUAL_FINISH", actor, undefined, { entryId, elapsedMs }, reason);
  return buildResults(session.competition_id);
}

export function homologateRace(raceId: string, actor = "admin") {
  const connection = db();
  const session = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; competition_id: string; status: RaceStatus; paused_elapsed_ms: number } | undefined;
  if (!session || (session.status !== "RUNNING" && !(session.status === "ARMED" && session.paused_elapsed_ms > 0))) throw new Error("Inicie a largada antes de homologar.");
  const now = new Date().toISOString();
  connection.exec("BEGIN IMMEDIATE");
  try {
    connection.prepare("UPDATE competition_sessions SET status='HOMOLOGATED', homologated_at=? WHERE id=?").run(now, session.id);
    connection.prepare("UPDATE competition_finishes SET status='FINAL', updated_at=? WHERE session_id=? AND status='PROVISIONAL'").run(now, session.id);
    audit(connection, session.competition_id, "session", session.id, "HOMOLOGATE", actor, session, { ...session, status: "HOMOLOGATED", homologated_at: now });
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return buildResults(session.competition_id);
}

export function reopenRace(raceId: string, reason: string, actor = "admin") {
  if (!reason.trim()) throw new Error("Informe a justificativa para reabrir a bateria.");
  const connection = db();
  const session = connection.prepare("SELECT * FROM competition_sessions WHERE race_id=? ORDER BY created_at DESC LIMIT 1").get(raceId) as { id: string; competition_id: string; status: RaceStatus } | undefined;
  if (!session || session.status !== "HOMOLOGATED") throw new Error("A bateria não está homologada.");
  connection.exec("BEGIN IMMEDIATE");
  try {
    connection.prepare("UPDATE competition_sessions SET status='RUNNING', homologated_at=NULL WHERE id=?").run(session.id);
    connection.prepare("UPDATE competition_finishes SET status='PROVISIONAL', updated_at=? WHERE session_id=? AND status='FINAL'").run(new Date().toISOString(), session.id);
    audit(connection, session.competition_id, "session", session.id, "REOPEN", actor, session, { ...session, status: "RUNNING" }, reason);
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
  return buildResults(session.competition_id);
}

