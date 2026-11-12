import { mkdirSync } from "node:fs";
import { randomInt, randomUUID } from "node:crypto";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export type RafflePrize = {
  id: string;
  name: string;
  description: string;
  winning_number: number;
  claimed_at: string | null;
  created_at: string;
};

export type RaffleStats = {
  plays: number;
  prizes: number;
  claimed: number;
  remainingNumbers: number;
};

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec(`
    CREATE TABLE IF NOT EXISTS raffle_prizes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      winning_number INTEGER NOT NULL UNIQUE CHECK (winning_number BETWEEN 1 AND 1000),
      claimed_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS raffle_plays (
      number INTEGER PRIMARY KEY CHECK (number BETWEEN 1 AND 1000),
      prize_id TEXT,
      played_at TEXT NOT NULL,
      FOREIGN KEY (prize_id) REFERENCES raffle_prizes(id)
    );
    CREATE INDEX IF NOT EXISTS idx_raffle_plays_prize ON raffle_plays(prize_id);
  `);
  return database;
}

function cleanText(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
}

export function formatRaffleNumber(number: number) {
  return String(number).padStart(4, "0");
}

export function parseRaffleNumber(value: unknown) {
  const text = typeof value === "string" ? value.trim() : String(value ?? "");
  if (!/^\d{4}$/.test(text)) throw new Error("Informe um número com quatro dígitos, entre 0001 e 1000.");
  const number = Number(text);
  if (number < 1 || number > 1000) throw new Error("O número deve estar entre 0001 e 1000.");
  return number;
}

export function listRafflePrizes() {
  return getDatabase().prepare("SELECT * FROM raffle_prizes ORDER BY datetime(created_at) DESC").all() as RafflePrize[];
}

export function getRaffleStats(): RaffleStats {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM raffle_plays) AS plays,
      (SELECT COUNT(*) FROM raffle_prizes) AS prizes,
      (SELECT COUNT(*) FROM raffle_prizes WHERE claimed_at IS NOT NULL) AS claimed
  `).get() as { plays: number; prizes: number; claimed: number };
  return { ...row, remainingNumbers: 1000 - row.plays };
}

export function createRafflePrize(input: { name: unknown; description?: unknown }) {
  const name = cleanText(input.name, 100);
  const description = cleanText(input.description, 220);
  if (!name) throw new Error("Informe o nome do prêmio.");

  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE");
  try {
    const used = new Set((db.prepare("SELECT winning_number AS number FROM raffle_prizes UNION SELECT number FROM raffle_plays").all() as { number: number }[]).map((item) => item.number));
    const available = Array.from({ length: 1000 }, (_, index) => index + 1).filter((number) => !used.has(number));
    if (!available.length) throw new Error("Todos os números já possuem um prêmio associado.");

    const prize: RafflePrize = {
      id: randomUUID(),
      name,
      description,
      winning_number: available[randomInt(available.length)],
      claimed_at: null,
      created_at: new Date().toISOString()
    };
    db.prepare("INSERT INTO raffle_prizes (id, name, description, winning_number, claimed_at, created_at) VALUES (?, ?, ?, ?, NULL, ?)")
      .run(prize.id, prize.name, prize.description, prize.winning_number, prize.created_at);
    db.exec("COMMIT");
    return prize;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function deleteRafflePrize(id: string) {
  const result = getDatabase().prepare("DELETE FROM raffle_prizes WHERE id = ? AND claimed_at IS NULL").run(id);
  if (!result.changes) throw new Error("Prêmio já entregue ou não encontrado.");
}

export function playRaffle(rawNumber: unknown) {
  const number = parseRaffleNumber(rawNumber);
  const db = getDatabase();
  const timestamp = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE");
  try {
    if (db.prepare("SELECT 1 FROM raffle_plays WHERE number = ?").get(number)) {
      throw new Error(`O número ${formatRaffleNumber(number)} já participou.`);
    }
    const prize = db.prepare("SELECT * FROM raffle_prizes WHERE winning_number = ? AND claimed_at IS NULL").get(number) as RafflePrize | undefined;
    db.prepare("INSERT INTO raffle_plays (number, prize_id, played_at) VALUES (?, ?, ?)").run(number, prize?.id ?? null, timestamp);
    if (prize) db.prepare("UPDATE raffle_prizes SET claimed_at = ? WHERE id = ?").run(timestamp, prize.id);
    db.exec("COMMIT");
    return {
      number: formatRaffleNumber(number),
      won: Boolean(prize),
      prize: prize ? { name: prize.name, description: prize.description } : null
    };
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
