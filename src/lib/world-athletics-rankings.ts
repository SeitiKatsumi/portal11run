import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ParsedInternationalRanking } from "@/lib/international-ranking-core";
import {
  WorldAthleticsRankingProvider,
  type WorldAthleticsRankingInput,
  type WorldAthleticsScope
} from "@/lib/world-athletics-ranking-provider";

const STALE_MS = 20 * 60 * 60 * 1000;
const provider = new WorldAthleticsRankingProvider();
let database: DatabaseSync | undefined;

type ListQuery = WorldAthleticsRankingInput & {
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
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  return database;
}

function latestSnapshot(query: WorldAthleticsRankingInput) {
  return getDatabase().prepare(
    `SELECT * FROM world_athletics_ranking_snapshots
     WHERE scope = ? AND season = ? AND gender = ? AND age_key = ? AND event_meters = ? AND published = 1
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.scope, query.season, query.gender, query.ageKey, query.event) as Snapshot | undefined;
}

export async function refreshWorldAthleticsRanking(query: WorldAthleticsRankingInput) {
  const collected = await provider.fetchRanking(query);
  const db = getDatabase();
  const id = randomUUID();
  const completedAt = new Date().toISOString();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `INSERT INTO world_athletics_ranking_snapshots
       (id, scope, season, gender, age_key, event_meters, source_url, source_updated_at, status,
        record_count, rows_json, published, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
    ).run(
      id, query.scope, query.season, query.gender, query.ageKey, query.event,
      collected.sourceUrl, collected.sourceUpdatedAt ?? null, collected.sourceStatus ?? "Top List oficial",
      collected.rows.length, JSON.stringify(collected.rows), completedAt, completedAt
    );
    db.prepare(
      `UPDATE world_athletics_ranking_snapshots SET published = 0
       WHERE scope = ? AND season = ? AND gender = ? AND age_key = ? AND event_meters = ? AND id <> ?`
    ).run(query.scope, query.season, query.gender, query.ageKey, query.event, id);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  return latestSnapshot(query) as Snapshot;
}

async function ensureRanking(query: WorldAthleticsRankingInput, force = false) {
  const latest = latestSnapshot(query);
  if (!force && latest && new Date(latest.completed_at).getTime() > Date.now() - STALE_MS) return latest;
  return refreshWorldAthleticsRanking(query);
}

function normalized(value: string | undefined) {
  return (value ?? "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function sourceFor(scope: WorldAthleticsScope, sourceUrl: string) {
  if (scope === "KE") return {
    key: "world-athletics-toplists-2026",
    name: "Ranking juvenil do Quênia",
    authority: "World Athletics · apoio documental Athletics Kenya",
    sourceUrl,
    supportingSources: [
      { name: "Trials U20 do Quênia 2026", url: "https://worldathletics.org/competition/calendar-results/results/7241938" }
    ]
  };
  if (scope === "UG") return {
    key: "world-athletics-toplists-2026",
    name: "Ranking juvenil de Uganda",
    authority: "World Athletics · Uganda Athletics",
    sourceUrl,
    supportingSources: [
      { name: "Qualificados U20 de Uganda", url: "https://ugandaathletics.org/u20-world-championships-qualifiers-set-to-hit-record-high/" },
      { name: "Resultados Uganda Athletics", url: "https://ugandaathletics.org/results/" }
    ]
  };
  return {
    key: "world-athletics-toplists-2026",
    name: "Ranking Mundial World Athletics",
    authority: "World Athletics Top Lists",
    sourceUrl,
    supportingSources: []
  };
}

export async function listWorldAthleticsRankings(query: ListQuery, force = false) {
  const snapshot = await ensureRanking(query, force);
  const rawRows = JSON.parse(snapshot.rows_json) as ParsedInternationalRanking["rows"];
  const regions = [...new Set(rawRows.map((row) => row.regionName).filter((value): value is string => Boolean(value)))]
    .sort().map((value) => ({ value }));
  const filtered = rawRows
    .filter((row) => !query.search || normalized(row.athleteName).includes(normalized(query.search)))
    .filter((row) => !query.region || row.regionName === query.region)
    .slice(0, Math.min(100, Math.max(1, query.limit ?? 100)));
  const results = filtered.map((row, index) => ({
    id: `${snapshot.id}-${index}-${row.position}`,
    country: query.scope,
    source_key: row.sourceKey ?? "world-athletics-toplists-2026",
    source_url: row.sourceUrl ?? snapshot.source_url,
    position: row.position,
    display_position: index + 1,
    performance: row.performance,
    athlete_name: row.athleteName,
    athlete_age: null,
    team_name: null,
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
    country: query.scope,
    season: query.season,
    source: sourceFor(query.scope, snapshot.source_url),
    config: { available: true, note: null },
    sync: null,
    import: {
      id: snapshot.id,
      source_url: snapshot.source_url,
      source_updated_at: snapshot.source_updated_at,
      completed_at: snapshot.completed_at,
      record_count: snapshot.record_count,
      round_label: "Melhores tempos",
      status: snapshot.status
    },
    count: results.length,
    results,
    regions,
    resultSources: []
  };
}

export async function refreshAllWorldAthleticsRankings() {
  const combinations: WorldAthleticsRankingInput[] = [];
  for (const scope of ["KE", "UG", "WORLD"] as const) {
    const ages = scope === "WORLD" ? ["u18", "u20", "senior"] as const : ["u18", "u20"] as const;
    const events = scope === "WORLD" ? [800, 1500, 3000, 5000, 10000] as const : [800, 1500, 3000, 5000] as const;
    for (const ageKey of ages) {
      for (const gender of ["M", "F"] as const) {
        for (const event of events) {
          combinations.push({ scope, season: 2026, ageKey, gender, event });
        }
      }
    }
  }
  const results: Array<{ key: string; count?: number; error?: string }> = [];
  for (let index = 0; index < combinations.length; index += 4) {
    const batch = combinations.slice(index, index + 4);
    const settled = await Promise.allSettled(batch.map((query) => refreshWorldAthleticsRanking(query)));
    settled.forEach((result, resultIndex) => {
      const query = batch[resultIndex];
      const key = `${query.scope}/${query.ageKey}/${query.gender}/${query.event}`;
      results.push(result.status === "fulfilled"
        ? { key, count: result.value.record_count }
        : { key, error: result.reason instanceof Error ? result.reason.message : String(result.reason) });
    });
  }
  return results;
}
