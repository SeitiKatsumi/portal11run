import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const COUNTER_KEY = "olympic-potential-game";
const INITIAL_COUNT = 511;
let database: DatabaseSync | null = null;

function getDatabase() {
  if (database) return database;
  const databasePath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS public_experience_counters (
      key TEXT PRIMARY KEY,
      total INTEGER NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  database.prepare("INSERT OR IGNORE INTO public_experience_counters (key, total) VALUES (?, ?)").run(COUNTER_KEY, INITIAL_COUNT);
  return database;
}

export function getOlympicGameCount() {
  const row = getDatabase().prepare("SELECT total FROM public_experience_counters WHERE key = ?").get(COUNTER_KEY) as { total: number };
  return Math.max(INITIAL_COUNT, Number(row.total));
}

export function incrementOlympicGameCount() {
  getDatabase().prepare("UPDATE public_experience_counters SET total = total + 1, updated_at = CURRENT_TIMESTAMP WHERE key = ?").run(COUNTER_KEY);
  return getOlympicGameCount();
}
