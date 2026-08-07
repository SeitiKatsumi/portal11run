import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  BrazilRankingProvider,
  type BrazilRankingInput
} from "@/lib/brazil-ranking-provider";
import type { ParsedInternationalRanking } from "@/lib/international-ranking-core";

const STALE_MS = 20 * 60 * 60 * 1000;
const provider = new BrazilRankingProvider();
let database: DatabaseSync | undefined;

type BrazilListQuery = BrazilRankingInput & {
  limit?: number;
  search?: string;
  team?: string;
  region?: string;
};

type Snapshot = {
  id: string;
  source_url: string;
  source_updated_at: string | null;
  status: string;
  record_count: number;
  rows_json: string;
  completed_at: string;
};

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

function latestSnapshot(query: BrazilRankingInput) {
  return getDatabase().prepare(
    `SELECT * FROM brazil_ranking_snapshots
     WHERE season = ? AND gender = ? AND age_key = ? AND event_meters = ? AND published = 1
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.season, query.gender, query.ageKey, query.event) as Snapshot | undefined;
}

export async function refreshBrazilRanking(query: BrazilRankingInput) {
  const collected = await provider.fetchRanking(query);
  const db = getDatabase();
  const id = randomUUID();
  const completedAt = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `INSERT INTO brazil_ranking_snapshots
       (id, season, gender, age_key, event_meters, source_url, source_updated_at, status,
        record_count, rows_json, published, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(
      id, query.season, query.gender, query.ageKey, query.event, collected.sourceUrl,
      collected.sourceUpdatedAt ?? null, collected.sourceStatus ?? "Ranking oficial",
      collected.rows.length, JSON.stringify(collected.rows), completedAt, completedAt
    );
    db.prepare(
      `UPDATE brazil_ranking_snapshots SET published = 0
       WHERE season = ? AND gender = ? AND age_key = ? AND event_meters = ? AND id <> ?`
    ).run(query.season, query.gender, query.ageKey, query.event, id);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return latestSnapshot(query) as Snapshot;
}

export async function ensureBrazilRanking(query: BrazilRankingInput, force = false) {
  const latest = latestSnapshot(query);
  if (
    !force
    && latest
    && new Date(latest.completed_at).getTime() > Date.now() - STALE_MS
  ) return latest;
  return refreshBrazilRanking(query);
}

function normalized(value: string | undefined) {
  return (value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

export async function listBrazilRankings(query: BrazilListQuery, force = false) {
  const liveStateRanking = query.region ? await provider.fetchRanking(query) : null;
  const snapshot = liveStateRanking ? null : await ensureBrazilRanking(query, force);
  const rawRows = liveStateRanking?.rows
    ?? JSON.parse((snapshot as Snapshot).rows_json) as ParsedInternationalRanking["rows"];
  const sourceUrl = liveStateRanking?.sourceUrl ?? (snapshot as Snapshot).source_url;
  const completedAt = liveStateRanking?.sourceUpdatedAt ?? (snapshot as Snapshot).completed_at;
  const sourceStatus = liveStateRanking?.sourceStatus ?? (snapshot as Snapshot).status;
  const snapshotId = snapshot?.id ?? `cbat-${query.season}-${query.region}-${query.gender}-${query.event}`;
  const regions = [...new Set(rawRows.map((row) => row.regionName).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, "pt-BR"))
    .map((value) => ({ value }));
  const results = rawRows
    .filter((row) => !query.search || normalized(row.athleteName).includes(normalized(query.search)))
    .filter((row) => !query.team || normalized(row.teamName).includes(normalized(query.team)))
    .filter((row) => !query.region || row.regionName === query.region)
    .slice(0, Math.min(100, Math.max(1, query.limit ?? 100)))
    .map((row, index) => ({
      id: `${snapshotId}-${index}-${row.position}`,
      country: "BR",
      source_key: row.sourceKey ?? "cbat-ranking-2026",
      source_url: row.sourceUrl ?? sourceUrl,
      position: row.position,
      display_position: row.position,
      performance: row.performance,
      athlete_name: row.athleteName,
      athlete_age: row.athleteAge ?? null,
      team_name: row.teamName ?? null,
      region_name: row.regionName ?? null,
      birth_date: row.birthDate ?? null,
      birth_date_original: row.birthDateOriginal ?? null,
      meet_name: row.meetName ?? null,
      meet_location: row.meetLocation ?? null,
      performance_date: row.performanceDate ?? null,
      performance_date_original: row.performanceDateOriginal ?? null,
      round_label: row.roundLabel ?? null,
      source_status: row.sourceStatus ?? null
    }));

  return {
    country: "BR",
    season: query.season,
    source: {
      key: "cbat-ranking-2026",
      name: "Ranking Brasileiro CBAt 2026",
      authority: "Confederação Brasileira de Atletismo",
      sourceUrl,
      supportingSources: []
    },
    config: { available: true, note: null },
    sync: null,
    import: {
      id: snapshotId,
      source_url: sourceUrl,
      source_updated_at: liveStateRanking?.sourceUpdatedAt ?? snapshot?.source_updated_at ?? null,
      completed_at: completedAt,
      record_count: liveStateRanking?.rows.length ?? snapshot?.record_count ?? 0,
      round_label: "Top 100 CBAt",
      status: sourceStatus
    },
    count: results.length,
    results,
    regions,
    resultSources: []
  };
}

export async function refreshAllBrazilRankings() {
  const combinations: BrazilRankingInput[] = [];
  for (const ageKey of ["sub16", "sub18"] as const) {
    for (const gender of ["M", "F"] as const) {
      for (const event of [800, 1500, 2000, 3000, 5000] as const) {
        combinations.push({ season: 2026, ageKey, gender, event });
      }
    }
  }
  const results: Array<{ key: string; count?: number; error?: string }> = [];
  for (let index = 0; index < combinations.length; index += 4) {
    const batch = combinations.slice(index, index + 4);
    const settled = await Promise.allSettled(batch.map((query) => refreshBrazilRanking(query)));
    settled.forEach((result, resultIndex) => {
      const query = batch[resultIndex];
      const key = `${query.ageKey}/${query.gender}/${query.event}`;
      results.push(result.status === "fulfilled"
        ? { key, count: result.value.record_count }
        : { key, error: result.reason instanceof Error ? result.reason.message : String(result.reason) });
    });
  }
  return results;
}
