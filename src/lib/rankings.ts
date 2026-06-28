import { mkdirSync } from "fs";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export type RankingRecord = {
  id: string;
  age_group: string;
  event: string;
  athlete_name: string;
  time: string;
  date: string;
  location: string;
  created_at: string;
  updated_at: string;
};

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS rankings (
      id TEXT PRIMARY KEY,
      age_group TEXT NOT NULL,
      event TEXT NOT NULL,
      athlete_name TEXT NOT NULL,
      time TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_rankings_event_age ON rankings(event, age_group);
  `);
  return database;
}

export function listRankings() {
  return getDatabase()
    .prepare("SELECT * FROM rankings ORDER BY age_group ASC, event ASC, time ASC, datetime(created_at) DESC")
    .all() as RankingRecord[];
}

export function createRanking(input: Omit<RankingRecord, "id" | "created_at" | "updated_at">) {
  const now = new Date().toISOString();
  const record: RankingRecord = { id: crypto.randomUUID(), created_at: now, updated_at: now, ...input };
  getDatabase()
    .prepare(
      `INSERT INTO rankings (id, age_group, event, athlete_name, time, date, location, created_at, updated_at)
       VALUES ($id, $age_group, $event, $athlete_name, $time, $date, $location, $created_at, $updated_at)`
    )
    .run({
      $id: record.id,
      $age_group: record.age_group,
      $event: record.event,
      $athlete_name: record.athlete_name,
      $time: record.time,
      $date: record.date,
      $location: record.location,
      $created_at: record.created_at,
      $updated_at: record.updated_at
    });
  return record;
}

export function deleteRanking(id: string) {
  getDatabase().prepare("DELETE FROM rankings WHERE id = ?").run(id);
}
