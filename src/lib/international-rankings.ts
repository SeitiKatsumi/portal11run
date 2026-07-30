import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  ageLabels,
  type InternationalRankingQuery,
  type NorwayAgeKey,
  type UsaAgeKey
} from "@/lib/international-ranking-core";
import { NorwayRankingProvider } from "@/lib/norway-ranking-provider";
import { UsaRankingProvider, usaCategoryAvailability } from "@/lib/usa-ranking-provider";

const COOLDOWN_MS = 10 * 60 * 1000;
const STALE_MS = 6 * 60 * 60 * 1000;
const norwayProvider = new NorwayRankingProvider();
const usaProvider = new UsaRankingProvider();
const runningJobs = new Set<string>();
let database: DatabaseSync | undefined;

const sourceKeys = {
  NO: "minfriidrett-2026",
  US: "usatf-jo-2026-v2"
} as const;

function now() {
  return new Date().toISOString();
}

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

export function sourceKeyForCountry(country: "NO" | "US") {
  return sourceKeys[country];
}

export function internationalCategoryConfig(query: Pick<InternationalRankingQuery, "country" | "ageKey" | "event">) {
  if (query.country === "US") return usaCategoryAvailability(query.ageKey as UsaAgeKey, query.event);
  return { available: true, note: null };
}

export function internationalSourceInfo(country: "NO" | "US") {
  if (country === "NO") {
    return {
      key: sourceKeys.NO,
      name: "Min Friidrettsstatistikk",
      authority: "Estatística nacional norueguesa",
      sourceUrl: "https://www.minfriidrettsstatistikk.info/php/LandsStatistikk.php",
      supportingSources: []
    };
  }
  return {
    key: sourceKeys.US,
    name: "USATF National Junior Olympics 2026",
    authority: "Resultados oficiais da competição",
    sourceUrl: "https://www.usatf.org/events/2026/2026-usatf-national-junior-olympic-track-field-cha",
    supportingSources: [
      { name: "USATF Youth", url: "https://www.usatf.org/programs/youth" },
      { name: "Athletic.net", url: "https://www.athletic.net/TrackAndField/Division/Top.aspx?Meet=644030" },
      { name: "AAU Results & Rankings", url: "https://www.aausports.org/track-and-field/resultsrankings/" }
    ]
  };
}

function hashResult(input: {
  country: string;
  season: number;
  event: number;
  gender: string;
  ageKey: string;
  athlete: string;
  performance: string;
  date?: string;
  team?: string;
}) {
  return createHash("sha256")
    .update([input.country, input.season, input.event, input.gender, input.ageKey, input.athlete, input.performance, input.date ?? "", input.team ?? ""].join("|"))
    .digest("hex");
}

export function listInternationalRankings(query: InternationalRankingQuery) {
  const db = getDatabase();
  const config = internationalCategoryConfig(query);
  const sync = db.prepare(
    `SELECT id, status, message, created_at, started_at, completed_at
     FROM international_ranking_jobs
     WHERE country = ? AND source_key = ? AND season = ? AND gender = ? AND age_key = ? AND event_meters = ?
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.country, query.sourceKey, query.season, query.gender, query.ageKey, query.event) as Record<string, unknown> | undefined;
  const published = db.prepare(
    `SELECT * FROM international_ranking_imports
     WHERE country = ? AND source_key = ? AND season = ? AND gender = ? AND age_key = ? AND event_meters = ? AND published = 1
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.country, query.sourceKey, query.season, query.gender, query.ageKey, query.event) as Record<string, unknown> | undefined;

  const clauses: string[] = [];
  const values: Array<string | number> = [String(published?.id ?? "")];
  if (query.search) {
    clauses.push("ranked.athlete_name LIKE ?");
    values.push(`%${query.search}%`);
  }
  if (query.team) {
    clauses.push("ranked.team_name LIKE ?");
    values.push(`%${query.team}%`);
  }
  if (query.region) {
    clauses.push("ranked.region_name = ?");
    values.push(query.region);
  }
  values.push(Math.min(100, Math.max(1, query.limit ?? 100)));
  const results = published ? db.prepare(
    `SELECT * FROM (
       SELECT r.*, ROW_NUMBER() OVER (
         ORDER BY COALESCE(r.performance_milliseconds, 999999999) ASC, r.position ASC, r.id ASC
       ) AS display_position
       FROM international_ranking_results r
       WHERE r.import_batch_id = ?
     ) ranked
     ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
     ORDER BY ranked.display_position ASC LIMIT ?`
  ).all(...values) : [];
  const regions = published ? db.prepare(
    `SELECT DISTINCT region_name AS value FROM international_ranking_results
     WHERE import_batch_id = ? AND region_name IS NOT NULL AND region_name <> '' ORDER BY region_name`
  ).all(String(published.id)) : [];

  return {
    country: query.country,
    season: query.season,
    source: internationalSourceInfo(query.country),
    config,
    sync: sync ?? null,
    import: published ?? null,
    count: results.length,
    results,
    regions
  };
}

function setJob(id: string, fields: Record<string, string | number | null>) {
  const entries = Object.entries(fields);
  if (!entries.length) return;
  getDatabase().prepare(
    `UPDATE international_ranking_jobs SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`
  ).run(...entries.map(([, value]) => value), id);
}

async function refreshOne(jobId: string, query: Omit<InternationalRankingQuery, "limit" | "search" | "team" | "region">) {
  const config = internationalCategoryConfig(query);
  if (!config.available) throw new Error(config.note ?? "Categoria indisponível na fonte.");
  setJob(jobId, { status: "fetching", message: "Consultando a fonte de referência...", started_at: now() });
  const collected = query.country === "NO"
    ? await norwayProvider.fetchRanking({
      season: query.season,
      gender: query.gender,
      ageKey: query.ageKey as NorwayAgeKey,
      event: query.event
    })
    : await usaProvider.fetchRanking({
      season: query.season,
      gender: query.gender,
      ageKey: query.ageKey as UsaAgeKey,
      event: query.event
    });

  const db = getDatabase();
  const batchId = randomUUID();
  const collectedAt = now();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `INSERT INTO international_ranking_imports
       (id, country, source_key, season, event_meters, gender, age_key, age_label, round_label,
        source_url, source_updated_at, status, record_count, published, started_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`
    ).run(
      batchId, query.country, query.sourceKey, query.season, query.event, query.gender, query.ageKey,
      collected.ageLabel, collected.roundLabel ?? null, collected.sourceUrl, collected.sourceUpdatedAt ?? null,
      collected.sourceStatus ?? "Publicado", collected.rows.length, collectedAt, collectedAt, collectedAt
    );
    const insert = db.prepare(
      `INSERT INTO international_ranking_results
       (id, import_batch_id, dedupe_key, country, source_key, season, source_url, gender, event_meters,
        age_key, age_label, athlete_age, position, performance, performance_milliseconds, athlete_name,
        team_name, region_name, birth_date, birth_date_original, meet_name, meet_location,
        performance_date, performance_date_original, round_label, source_status, collected_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const row of collected.rows) {
      insert.run(
        randomUUID(),
        batchId,
        hashResult({
          country: query.country, season: query.season, event: query.event, gender: query.gender,
          ageKey: query.ageKey, athlete: row.athleteName, performance: row.performance,
          date: row.performanceDate, team: row.teamName
        }),
        query.country, query.sourceKey, query.season, collected.sourceUrl, query.gender, query.event,
        query.ageKey, collected.ageLabel, row.athleteAge ?? null, row.position, row.performance,
        row.performanceMilliseconds ?? null, row.athleteName, row.teamName ?? null, row.regionName ?? null,
        row.birthDate ?? null, row.birthDateOriginal ?? null, row.meetName ?? null, row.meetLocation ?? null,
        row.performanceDate ?? null, row.performanceDateOriginal ?? null, row.roundLabel ?? collected.roundLabel ?? null,
        row.sourceStatus ?? collected.sourceStatus ?? null, collectedAt
      );
    }
    db.prepare(
      `UPDATE international_ranking_imports SET published = 0
       WHERE country = ? AND source_key = ? AND season = ? AND event_meters = ? AND gender = ? AND age_key = ? AND id <> ?`
    ).run(query.country, query.sourceKey, query.season, query.event, query.gender, query.ageKey, batchId);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  setJob(jobId, {
    status: "completed",
    progress: 1,
    message: collected.rows.length
      ? `${collected.rows.length} resultados organizados com sucesso.`
      : `${collected.sourceStatus ?? "Fonte consultada"} — ainda sem marcas publicadas.`,
    completed_at: now()
  });
}

async function runJob(id: string, query: Omit<InternationalRankingQuery, "limit" | "search" | "team" | "region">) {
  if (runningJobs.has(id)) return;
  runningJobs.add(id);
  try {
    await refreshOne(id, query);
  } catch (error) {
    setJob(id, {
      status: "error",
      message: error instanceof Error ? error.message : "Falha inesperada na atualização.",
      completed_at: now()
    });
  } finally {
    runningJobs.delete(id);
  }
}

export function queueInternationalRankingRefresh(
  query: Omit<InternationalRankingQuery, "limit" | "search" | "team" | "region">,
  requestedBy = "public"
) {
  const db = getDatabase();
  const recent = db.prepare(
    `SELECT * FROM international_ranking_jobs
     WHERE country = ? AND source_key = ? AND season = ? AND gender = ? AND age_key = ? AND event_meters = ?
       AND datetime(created_at) >= datetime(?)
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(
    query.country, query.sourceKey, query.season, query.gender, query.ageKey, query.event,
    new Date(Date.now() - COOLDOWN_MS).toISOString()
  ) as Record<string, unknown> | undefined;
  if (recent && (recent.status === "completed" || runningJobs.has(String(recent.id)))) {
    return { job: recent, recent: true };
  }
  const config = internationalCategoryConfig(query);
  if (!config.available) throw new Error(config.note ?? "Categoria indisponível.");

  const id = randomUUID();
  const createdAt = now();
  db.prepare(
    `INSERT INTO international_ranking_jobs
     (id, country, source_key, season, event_meters, gender, age_key, status, progress, total, message, requested_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'queued', 0, 1, 'Atualização na fila.', ?, ?)`
  ).run(id, query.country, query.sourceKey, query.season, query.event, query.gender, query.ageKey, requestedBy, createdAt);
  setTimeout(() => void runJob(id, query), 0);
  return { job: getInternationalRankingJob(id), recent: false };
}

export function queueInternationalRankingIfDue(
  query: Omit<InternationalRankingQuery, "limit" | "search" | "team" | "region">
) {
  const latest = getDatabase().prepare(
    `SELECT completed_at FROM international_ranking_imports
     WHERE country = ? AND source_key = ? AND season = ? AND gender = ? AND age_key = ? AND event_meters = ? AND published = 1
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.country, query.sourceKey, query.season, query.gender, query.ageKey, query.event) as { completed_at: string | null } | undefined;
  if (latest?.completed_at && new Date(latest.completed_at).getTime() > Date.now() - STALE_MS) return null;
  try {
    return queueInternationalRankingRefresh(query, "automatic");
  } catch {
    return null;
  }
}

export function getInternationalRankingJob(id: string) {
  return getDatabase().prepare("SELECT * FROM international_ranking_jobs WHERE id = ?").get(id) as Record<string, unknown> | undefined;
}
