import { createHash, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getChatSettings } from "@/lib/assistantStore";
import { JaafRankingProvider } from "@/lib/jaaf-ranking-provider";
import { prefectureInPortuguese } from "@/lib/japan-prefectures";
import {
  japanAges,
  japanEvents,
  japanGenders,
  referenceAgeToSchoolYear,
  type JapanAge,
  type JapanEvent,
  type JapanGender,
  type JapanRankingQuery
} from "@/lib/japan-ranking-core";

const COOLDOWN_MS = 15 * 60 * 1000;
const provider = new JaafRankingProvider();
let database: DatabaseSync | undefined;
const runningJobs = new Set<string>();
const runningReadingBatches = new Set<string>();

type EventConfigRow = {
  id: string;
  season: number;
  event_meters: JapanEvent;
  gender: JapanGender;
  event_id: number | null;
  type_id: number;
  active: number;
  source_note: string | null;
};

type SeasonRow = {
  year: number;
  base_url: string;
  active: number;
  current: number;
  refresh_hour: number;
  refresh_interval_hours: number;
  last_automatic_check_at: string | null;
};

function isoNow() {
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
  const seasonColumns = database.prepare("PRAGMA table_info(japan_ranking_seasons)").all() as Array<{ name: string }>;
  if (!seasonColumns.some((column) => column.name === "refresh_interval_hours")) {
    database.exec("ALTER TABLE japan_ranking_seasons ADD COLUMN refresh_interval_hours INTEGER NOT NULL DEFAULT 24;");
  }
  seedJapanRankingConfiguration(database);
  return database;
}

function seedJapanRankingConfiguration(db: DatabaseSync) {
  const now = isoNow();
  db.prepare(
    `INSERT OR IGNORE INTO japan_ranking_seasons
      (year, base_url, active, current, refresh_hour, refresh_interval_hours, created_at, updated_at)
     VALUES (2026, ?, 1, 1, 5, 24, ?, ?)`
  ).run("https://www.jaaf.or.jp/remote/juniorhighschool/2026/ranking/", now, now);

  const configs: Array<[JapanEvent, JapanGender, number | null, number, string | null]> = [
    [800, "M", 104, 1, null],
    [1500, "M", 105, 1, null],
    [3000, "M", 144, 1, null],
    [800, "F", 124, 1, null],
    [1500, "F", 125, 1, null],
    [3000, "F", null, 0, "Os 3.000 m femininos não constam no seletor oficial escolar da JAAF em 2026."]
  ];
  const insert = db.prepare(
    `INSERT OR IGNORE INTO japan_ranking_event_configs
      (id, season, event_meters, gender, event_id, type_id, active, source_note, created_at, updated_at)
     VALUES (?, 2026, ?, ?, ?, 1, ?, ?, ?, ?)`
  );
  for (const [event, gender, eventId, active, note] of configs) {
    insert.run(`2026-${gender}-${event}`, event, gender, eventId, active, note, now, now);
  }
}

function getSeason(year: number) {
  return getDatabase().prepare("SELECT * FROM japan_ranking_seasons WHERE year = ? AND active = 1").get(year) as SeasonRow | undefined;
}

function getEventConfig(season: number, event: JapanEvent, gender: JapanGender) {
  return getDatabase()
    .prepare("SELECT * FROM japan_ranking_event_configs WHERE season = ? AND event_meters = ? AND gender = ?")
    .get(season, event, gender) as EventConfigRow | undefined;
}

function dedupeKey(input: {
  season: number;
  event: number;
  gender: string;
  schoolYear: number;
  athlete: string;
  performance: string;
  date?: string;
  team?: string;
}) {
  return createHash("sha256")
    .update([input.season, input.event, input.gender, input.schoolYear, input.athlete, input.performance, input.date ?? "", input.team ?? ""].join("|"))
    .digest("hex");
}

export function getCurrentJapanSeason() {
  const row = getDatabase().prepare(
    "SELECT year FROM japan_ranking_seasons WHERE active = 1 ORDER BY current DESC, year DESC LIMIT 1"
  ).get() as { year: number } | undefined;
  return row?.year ?? 2026;
}

export function listJapanRankings(query: JapanRankingQuery) {
  const db = getDatabase();
  const config = getEventConfig(query.season, query.event, query.gender);
  const published = db.prepare(
    `SELECT * FROM japan_ranking_imports
     WHERE season = ? AND gender = ? AND reference_age = ? AND event_meters = ? AND published = 1
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.season, query.gender, query.age, query.event) as Record<string, unknown> | undefined;

  const clauses: string[] = [];
  const values: Array<string | number> = [String(published?.id ?? "")];
  if (query.search) {
    clauses.push("(ranked.athlete_name_japanese LIKE ? OR ranked.athlete_name_display LIKE ?)");
    values.push(`%${query.search}%`, `%${query.search}%`);
  }
  if (query.team) {
    clauses.push("(ranked.team_japanese LIKE ? OR ranked.team_name_display LIKE ?)");
    values.push(`%${query.team}%`, `%${query.team}%`);
  }
  if (query.prefecture) {
    clauses.push("ranked.prefecture_japanese = ?");
    values.push(query.prefecture);
  }
  const limit = Math.min(100, Math.max(1, query.limit ?? 100));
  values.push(limit);
  const results = published ? db.prepare(
    `SELECT * FROM (
       SELECT r.*,
        COALESCE(ac.display_text, ar.probable_romaji, r.athlete_name_romaji) AS athlete_name_display,
        CASE WHEN ac.display_text IS NOT NULL THEN 'manual' WHEN ar.probable_romaji IS NOT NULL THEN 'ai' ELSE NULL END AS athlete_reading_source,
        COALESCE(tc.display_text, tr.probable_romaji, r.team_romaji) AS team_name_display,
        CASE WHEN tc.display_text IS NOT NULL THEN 'manual' WHEN tr.probable_romaji IS NOT NULL THEN 'ai' ELSE NULL END AS team_reading_source,
        ROW_NUMBER() OVER (ORDER BY r.position ASC, r.performance_milliseconds ASC, r.id ASC) AS display_position
       FROM japan_ranking_results r
       LEFT JOIN japan_ranking_corrections ac
         ON ac.entity_type = 'athlete' AND ac.original_text = r.athlete_name_japanese
       LEFT JOIN japan_ranking_ai_readings ar
         ON ar.entity_type = 'athlete' AND ar.original_text = r.athlete_name_japanese AND ar.status = 'completed'
       LEFT JOIN japan_ranking_corrections tc
         ON tc.entity_type = 'team' AND tc.original_text = r.team_japanese
       LEFT JOIN japan_ranking_ai_readings tr
         ON tr.entity_type = 'team' AND tr.original_text = r.team_japanese AND tr.status = 'completed'
       WHERE r.import_batch_id = ? AND r.blocked = 0
     ) ranked
     ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}
     ORDER BY ranked.display_position ASC
     LIMIT ?`
  ).all(...values) : [];

  const prefectures = published ? db.prepare(
    `SELECT DISTINCT prefecture_japanese AS value FROM japan_ranking_results
     WHERE import_batch_id = ? AND prefecture_japanese IS NOT NULL AND prefecture_japanese <> ''
     ORDER BY prefecture_japanese`
  ).all(String(published.id)) : [];

  return {
    season: query.season,
    config: config ? {
      available: Boolean(config.active && config.event_id),
      eventId: config.event_id,
      note: config.source_note
    } : { available: false, eventId: null, note: "Categoria ainda não configurada." },
    import: published ?? null,
    count: results.length,
    results,
    prefectures
  };
}

function setJob(id: string, fields: Record<string, string | number | null>) {
  const entries = Object.entries(fields);
  if (!entries.length) return;
  getDatabase().prepare(
    `UPDATE japan_ranking_jobs SET ${entries.map(([key]) => `${key} = ?`).join(", ")} WHERE id = ?`
  ).run(...entries.map(([, value]) => value), id);
}

async function refreshOne(jobId: string, query: Omit<JapanRankingQuery, "limit" | "search" | "team" | "prefecture">) {
  const db = getDatabase();
  const season = getSeason(query.season);
  const config = getEventConfig(query.season, query.event, query.gender);
  if (!season) throw new Error("Temporada não encontrada ou inativa.");
  if (!config?.active || !config.event_id) throw new Error(config?.source_note ?? "Categoria indisponível na fonte oficial.");

  setJob(jobId, { status: "fetching", message: "Verificando fonte oficial...", started_at: isoNow() });
  const schoolYear = referenceAgeToSchoolYear(query.age);
  const collected = await provider.fetchRanking({
    baseUrl: season.base_url,
    season: query.season,
    event: query.event,
    eventId: config.event_id,
    typeId: config.type_id,
    gender: query.gender,
    schoolYear
  });

  const previous = db.prepare(
    `SELECT id, source_updated_at FROM japan_ranking_imports
     WHERE season = ? AND event_meters = ? AND gender = ? AND reference_age = ? AND published = 1
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.season, query.event, query.gender, query.age) as { id: string; source_updated_at: string | null } | undefined;
  if (previous?.source_updated_at && previous.source_updated_at === collected.sourceUpdatedAt) {
    setJob(jobId, { status: "unchanged", progress: 1, message: "Nenhuma alteração encontrada.", completed_at: isoNow() });
    return;
  }

  setJob(jobId, { status: "importing", message: "Importando e validando resultados..." });
  const batchId = randomUUID();
  const now = isoNow();
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      `INSERT INTO japan_ranking_imports
       (id, season, event_meters, gender, school_year, reference_age, source_url, source_updated_at,
        status, record_count, published, started_at, completed_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?, 1, ?, ?, ?)`
    ).run(batchId, query.season, query.event, query.gender, schoolYear, query.age, collected.sourceUrl,
      collected.sourceUpdatedAt ?? null, collected.rows.length, now, now, now);
    const insert = db.prepare(
      `INSERT INTO japan_ranking_results
       (id, import_batch_id, dedupe_key, season, source_url, source_updated_at, gender, event_meters,
        school_year, reference_age, position, points, performance, performance_milliseconds,
        athlete_name_japanese, prefecture_japanese, prefecture_portuguese, team_japanese, performance_date_original,
        performance_date, proof_image_url, proof_pdf_url, collected_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const row of collected.rows) {
      insert.run(
        randomUUID(), batchId,
        dedupeKey({ season: query.season, event: query.event, gender: query.gender, schoolYear,
          athlete: row.athleteNameJapanese, performance: row.performance, date: row.performanceDateOriginal, team: row.teamJapanese }),
        query.season, collected.sourceUrl, collected.sourceUpdatedAt ?? null, query.gender, query.event,
        schoolYear, query.age, row.position, row.points ?? null, row.performance, row.performanceMilliseconds ?? null,
        row.athleteNameJapanese, row.prefectureJapanese ?? null, prefectureInPortuguese(row.prefectureJapanese) ?? null, row.teamJapanese ?? null,
        row.performanceDateOriginal ?? null, row.performanceDate ?? null, row.proofImageUrl ?? null,
        row.proofPdfUrl ?? null, now
      );
    }
    db.prepare(
      `UPDATE japan_ranking_imports SET published = 0
       WHERE season = ? AND event_meters = ? AND gender = ? AND reference_age = ? AND id <> ?`
    ).run(query.season, query.event, query.gender, query.age, batchId);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  setJob(jobId, { status: "completed", progress: 1, message: `Ranking atualizado com ${collected.rows.length} resultados.`, completed_at: isoNow() });
}

async function runSingleJob(jobId: string, query: Omit<JapanRankingQuery, "limit" | "search" | "team" | "prefecture">) {
  if (runningJobs.has(jobId)) return;
  runningJobs.add(jobId);
  try {
    await refreshOne(jobId, query);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha inesperada na atualização.";
    setJob(jobId, { status: "error", message, completed_at: isoNow() });
  } finally {
    runningJobs.delete(jobId);
  }
}

export function queueJapanRankingRefresh(
  query: Omit<JapanRankingQuery, "limit" | "search" | "team" | "prefecture">,
  requestedBy = "public"
) {
  const db = getDatabase();
  const cooldownThreshold = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const recent = db.prepare(
    `SELECT * FROM japan_ranking_jobs
     WHERE kind = 'single' AND season = ? AND gender = ? AND reference_age = ? AND event_meters = ?
       AND datetime(created_at) >= datetime(?)
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(query.season, query.gender, query.age, query.event, cooldownThreshold) as Record<string, unknown> | undefined;
  if (recent) return { job: recent, recent: true };

  const config = getEventConfig(query.season, query.event, query.gender);
  if (!config?.active || !config.event_id) {
    throw new Error(config?.source_note ?? "Categoria indisponível na fonte oficial.");
  }
  const id = randomUUID();
  const now = isoNow();
  db.prepare(
    `INSERT INTO japan_ranking_jobs
     (id, kind, season, event_meters, gender, reference_age, status, progress, total, message, requested_by, created_at)
     VALUES (?, 'single', ?, ?, ?, ?, 'queued', 0, 1, 'Atualização na fila.', ?, ?)`
  ).run(id, query.season, query.event, query.gender, query.age, requestedBy, now);
  setTimeout(() => void runSingleJob(id, query), 0);
  return { job: getJapanRankingJob(id), recent: false };
}

export function getJapanRankingJob(id: string) {
  return getDatabase().prepare("SELECT * FROM japan_ranking_jobs WHERE id = ?").get(id) as Record<string, unknown> | undefined;
}

async function runAllJob(id: string, season: number) {
  if (runningJobs.has(id)) return;
  runningJobs.add(id);
  try {
    setJob(id, { status: "processing", started_at: isoNow(), message: "Atualizando rankings ativos..." });
    let progress = 0;
    for (const gender of japanGenders) {
      for (const event of japanEvents) {
        const config = getEventConfig(season, event, gender);
        if (!config?.active || !config.event_id) continue;
        for (const age of japanAges) {
          try {
            await refreshOne(id, { season, gender, event, age });
          } catch (error) {
            setJob(id, { message: `Aviso em ${gender}/${event}/${age}: ${error instanceof Error ? error.message : "erro"}` });
          }
          progress += 1;
          setJob(id, { status: "processing", progress, message: `${progress} rankings verificados.` });
          await new Promise((resolve) => setTimeout(resolve, 1250));
        }
      }
    }
    setJob(id, { status: "completed", progress, message: `${progress} rankings verificados.`, completed_at: isoNow() });
  } catch (error) {
    setJob(id, { status: "error", message: error instanceof Error ? error.message : "Falha na atualização completa.", completed_at: isoNow() });
  } finally {
    runningJobs.delete(id);
  }
}

export function queueAllJapanRankings(season = getCurrentJapanSeason(), requestedBy = "admin") {
  const db = getDatabase();
  const activeCount = (db.prepare(
    "SELECT COUNT(*) AS count FROM japan_ranking_event_configs WHERE season = ? AND active = 1 AND event_id IS NOT NULL"
  ).get(season) as { count: number }).count * 3;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO japan_ranking_jobs
     (id, kind, season, status, progress, total, message, requested_by, created_at)
     VALUES (?, 'all', ?, 'queued', 0, ?, 'Atualização completa na fila.', ?, ?)`
  ).run(id, season, activeCount, requestedBy, isoNow());
  setTimeout(() => void runAllJob(id, season), 0);
  return getJapanRankingJob(id);
}

export function getJapanRankingAdminData() {
  const db = getDatabase();
  return {
    seasons: db.prepare("SELECT * FROM japan_ranking_seasons ORDER BY year DESC").all(),
    configs: db.prepare(
      `SELECT c.*,
        (SELECT MAX(i.completed_at) FROM japan_ranking_imports i
         WHERE i.season = c.season AND i.event_meters = c.event_meters AND i.gender = c.gender) AS last_sync_at,
        (SELECT SUM(i.record_count) FROM japan_ranking_imports i
         WHERE i.season = c.season AND i.event_meters = c.event_meters AND i.gender = c.gender AND i.published = 1) AS published_records
       FROM japan_ranking_event_configs c ORDER BY c.season DESC, c.gender, c.event_meters`
    ).all(),
    imports: db.prepare("SELECT * FROM japan_ranking_imports ORDER BY datetime(created_at) DESC LIMIT 60").all(),
    jobs: db.prepare("SELECT * FROM japan_ranking_jobs ORDER BY datetime(created_at) DESC LIMIT 40").all(),
    corrections: db.prepare("SELECT * FROM japan_ranking_corrections ORDER BY datetime(updated_at) DESC LIMIT 100").all(),
    pendingNames: db.prepare(
      `SELECT athlete_name_japanese AS original_text, COUNT(*) AS occurrences
       FROM japan_ranking_results r JOIN japan_ranking_imports i ON i.id = r.import_batch_id
       LEFT JOIN japan_ranking_corrections c ON c.entity_type = 'athlete' AND c.original_text = r.athlete_name_japanese
       LEFT JOIN japan_ranking_ai_readings a ON a.entity_type = 'athlete' AND a.original_text = r.athlete_name_japanese AND a.status = 'completed'
       WHERE i.published = 1 AND c.id IS NULL AND a.id IS NULL GROUP BY athlete_name_japanese ORDER BY occurrences DESC LIMIT 100`
    ).all()
  };
}

function containsJapanese(value: string) {
  return /[\u3040-\u30ff\u3400-\u9fff]/u.test(value);
}

function responseOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";
  const direct = (payload as { output_text?: unknown }).output_text;
  if (typeof direct === "string") return direct;
  const output = (payload as { output?: unknown[] }).output;
  if (!Array.isArray(output)) return "";
  return output.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const content = (item as { content?: unknown[] }).content;
    if (!Array.isArray(content)) return [];
    return content.map((part) => {
      if (!part || typeof part !== "object") return "";
      const text = (part as { text?: unknown }).text;
      return typeof text === "string" ? text : "";
    });
  }).join("");
}

async function requestProbableReadings(items: Array<{ id: string; type: "athlete" | "team"; text: string }>) {
  const settings = getChatSettings();
  const apiKey = settings.openai_api_key?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("A chave OpenAI existente não está disponível no ambiente do servidor.");
  const model = process.env.OPENAI_TRANSLITERATION_MODEL?.trim()
    || settings.openai_model?.trim()
    || process.env.OPENAI_MODEL?.trim()
    || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      store: false,
      input: [
        {
          role: "system",
          content: "Você é especialista em nomes próprios japoneses. Forneça a leitura em romaji mais provável de cada texto, em ordem natural e sem traduzir nomes próprios. Escolas e clubes devem receber uma romanização curta e legível. Leituras de nomes próprios podem variar; não invente dados além da leitura. Preserve cada id exatamente."
        },
        { role: "user", content: JSON.stringify(items) }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "japanese_probable_readings",
          strict: true,
          schema: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    probableRomaji: { type: "string" },
                    confidence: { type: "number" }
                  },
                  required: ["id", "probableRomaji", "confidence"],
                  additionalProperties: false
                }
              }
            },
            required: ["items"],
            additionalProperties: false
          }
        }
      },
      max_output_tokens: 5000
    }),
    signal: AbortSignal.timeout(45_000)
  });
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`A geração de leituras respondeu com HTTP ${response.status}: ${errorBody.slice(0, 180)}`);
  }
  const payload = await response.json();
  const parsed = JSON.parse(responseOutputText(payload)) as {
    items?: Array<{ id?: string; probableRomaji?: string; confidence?: number }>;
  };
  return {
    model,
    items: Array.isArray(parsed.items) ? parsed.items : []
  };
}

async function runProbableReadings(importBatchId: string, jobId: string) {
  if (runningReadingBatches.has(importBatchId)) return;
  runningReadingBatches.add(importBatchId);
  const db = getDatabase();
  try {
    setJob(jobId, { status: "processing", started_at: isoNow(), message: "Preparando leituras prováveis..." });
    const candidates = db.prepare(
      `SELECT entity_type, original_text FROM (
         SELECT 'athlete' AS entity_type, r.athlete_name_japanese AS original_text
         FROM japan_ranking_results r
         LEFT JOIN japan_ranking_corrections c ON c.entity_type = 'athlete' AND c.original_text = r.athlete_name_japanese
         LEFT JOIN japan_ranking_ai_readings a ON a.entity_type = 'athlete' AND a.original_text = r.athlete_name_japanese AND a.status = 'completed'
         WHERE r.import_batch_id = ? AND c.id IS NULL AND a.id IS NULL
         UNION
         SELECT 'team' AS entity_type, r.team_japanese AS original_text
         FROM japan_ranking_results r
         LEFT JOIN japan_ranking_corrections c ON c.entity_type = 'team' AND c.original_text = r.team_japanese
         LEFT JOIN japan_ranking_ai_readings a ON a.entity_type = 'team' AND a.original_text = r.team_japanese AND a.status = 'completed'
         WHERE r.import_batch_id = ? AND r.team_japanese IS NOT NULL AND c.id IS NULL AND a.id IS NULL
       ) WHERE original_text IS NOT NULL`
    ).all(importBatchId, importBatchId) as Array<{ entity_type: "athlete" | "team"; original_text: string }>;
    const filtered = candidates.filter((item) => containsJapanese(item.original_text));
    if (!filtered.length) {
      setJob(jobId, { status: "completed", progress: 1, total: 1, message: "Todas as leituras já estão disponíveis.", completed_at: isoNow() });
      return;
    }
    setJob(jobId, { total: filtered.length, progress: 0 });
    let completed = 0;
    for (let offset = 0; offset < filtered.length; offset += 40) {
      const batch = filtered.slice(offset, offset + 40).map((item) => ({
        id: createHash("sha256").update(`${item.entity_type}|${item.original_text}`).digest("hex").slice(0, 20),
        type: item.entity_type,
        text: item.original_text
      }));
      const lookup = new Map(batch.map((item) => [item.id, item]));
      const generated = await requestProbableReadings(batch);
      const stamp = isoNow();
      const save = db.prepare(
        `INSERT INTO japan_ranking_ai_readings
         (id, entity_type, original_text, probable_romaji, confidence, model, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?)
         ON CONFLICT(entity_type, original_text) DO UPDATE SET
           probable_romaji = excluded.probable_romaji, confidence = excluded.confidence,
           model = excluded.model, status = 'completed', error_message = NULL, updated_at = excluded.updated_at`
      );
      for (const result of generated.items) {
        const original = result.id ? lookup.get(result.id) : undefined;
        const reading = result.probableRomaji?.replace(/\s+/g, " ").trim();
        if (!original || !reading || reading.length > 160 || containsJapanese(reading)) continue;
        save.run(
          randomUUID(), original.type, original.text, reading,
          Math.min(1, Math.max(0, Number(result.confidence) || 0.5)),
          generated.model, stamp, stamp
        );
      }
      completed += batch.length;
      setJob(jobId, { progress: completed, message: `${Math.min(completed, filtered.length)} de ${filtered.length} leituras preparadas.` });
    }
    setJob(jobId, { status: "completed", progress: filtered.length, message: "Leituras prováveis disponíveis.", completed_at: isoNow() });
  } catch (error) {
    setJob(jobId, {
      status: "error",
      message: error instanceof Error ? error.message : "Não foi possível gerar as leituras prováveis.",
      completed_at: isoNow()
    });
  } finally {
    runningReadingBatches.delete(importBatchId);
  }
}

export function queueJapanProbableReadings(importBatchId: string, requestedBy = "automatic") {
  if (!importBatchId || runningReadingBatches.has(importBatchId)) return null;
  const db = getDatabase();
  const target = db.prepare(
    "SELECT season, event_meters, gender, reference_age FROM japan_ranking_imports WHERE id = ? AND published = 1"
  ).get(importBatchId) as { season: number; event_meters: number; gender: string; reference_age: number } | undefined;
  if (!target) return null;
  const recent = db.prepare(
    `SELECT id FROM japan_ranking_jobs WHERE kind = 'readings' AND season = ? AND event_meters = ?
     AND gender = ? AND reference_age = ? AND status = 'completed' AND datetime(created_at) >= datetime(?)
     ORDER BY datetime(created_at) DESC LIMIT 1`
  ).get(target.season, target.event_meters, target.gender, target.reference_age, new Date(Date.now() - 30 * 60 * 1000).toISOString());
  if (recent) return recent;
  const id = randomUUID();
  db.prepare(
    `INSERT INTO japan_ranking_jobs
     (id, kind, season, event_meters, gender, reference_age, status, progress, total, message, requested_by, created_at)
     VALUES (?, 'readings', ?, ?, ?, ?, 'queued', 0, 1, 'Leituras prováveis na fila.', ?, ?)`
  ).run(id, target.season, target.event_meters, target.gender, target.reference_age, requestedBy, isoNow());
  setTimeout(() => void runProbableReadings(importBatchId, id), 0);
  return getJapanRankingJob(id);
}

export function updateJapanRankingConfig(input: {
  id: string;
  eventId?: number | null;
  typeId?: number;
  active?: boolean;
  sourceNote?: string;
}) {
  const current = getDatabase().prepare("SELECT * FROM japan_ranking_event_configs WHERE id = ?").get(input.id) as EventConfigRow | undefined;
  if (!current) throw new Error("Configuração não encontrada.");
  getDatabase().prepare(
    `UPDATE japan_ranking_event_configs SET event_id = ?, type_id = ?, active = ?, source_note = ?, updated_at = ? WHERE id = ?`
  ).run(
    input.eventId === undefined ? current.event_id : input.eventId,
    input.typeId ?? current.type_id,
    input.active === undefined ? current.active : Number(input.active),
    input.sourceNote ?? current.source_note,
    isoNow(),
    input.id
  );
}

export function saveJapanRankingCorrection(input: {
  entityType: "athlete" | "team";
  originalText: string;
  displayText: string;
  updatedBy?: string;
}) {
  const original = input.originalText.trim();
  const display = input.displayText.trim();
  if (!original || !display) throw new Error("Texto original e apresentação em romaji são obrigatórios.");
  const now = isoNow();
  getDatabase().prepare(
    `INSERT INTO japan_ranking_corrections
      (id, entity_type, original_text, display_text, confidence, updated_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, ?, ?, ?)
     ON CONFLICT(entity_type, original_text) DO UPDATE SET
       display_text = excluded.display_text, confidence = 1, updated_by = excluded.updated_by, updated_at = excluded.updated_at`
  ).run(randomUUID(), input.entityType, original, display, input.updatedBy ?? "admin", now, now);
}

export function saveJapanRankingSeason(input: {
  year: number;
  baseUrl: string;
  active?: boolean;
  current?: boolean;
  refreshHour?: number;
  refreshIntervalHours?: number;
}) {
  const year = Math.trunc(Number(input.year));
  const refreshHour = Math.min(23, Math.max(0, Math.trunc(Number(input.refreshHour ?? 5))));
  const interval = Math.min(168, Math.max(1, Math.trunc(Number(input.refreshIntervalHours ?? 24))));
  if (year < 2026 || year > 2100) throw new Error("Informe uma temporada válida.");
  const url = new URL(input.baseUrl);
  if (url.protocol !== "https:" || !["jaaf.or.jp", "www.jaaf.or.jp"].includes(url.hostname)) {
    throw new Error("A URL da temporada deve pertencer ao domínio oficial jaaf.or.jp.");
  }
  const db = getDatabase();
  const now = isoNow();
  db.exec("BEGIN IMMEDIATE;");
  try {
    if (input.current) db.prepare("UPDATE japan_ranking_seasons SET current = 0, updated_at = ?").run(now);
    db.prepare(
      `INSERT INTO japan_ranking_seasons
       (year, base_url, active, current, refresh_hour, refresh_interval_hours, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(year) DO UPDATE SET
         base_url = excluded.base_url, active = excluded.active, current = excluded.current,
         refresh_hour = excluded.refresh_hour, refresh_interval_hours = excluded.refresh_interval_hours,
         updated_at = excluded.updated_at`
    ).run(year, url.toString(), Number(input.active !== false), Number(Boolean(input.current)), refreshHour, interval, now, now);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

export function restoreJapanRankingImport(importId: string) {
  const db = getDatabase();
  const target = db.prepare("SELECT * FROM japan_ranking_imports WHERE id = ? AND status = 'valid'").get(importId) as {
    season: number; event_meters: number; gender: string; reference_age: number;
  } | undefined;
  if (!target) throw new Error("Lote válido não encontrado.");
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.prepare(
      "UPDATE japan_ranking_imports SET published = 0 WHERE season = ? AND event_meters = ? AND gender = ? AND reference_age = ?"
    ).run(target.season, target.event_meters, target.gender, target.reference_age);
    db.prepare("UPDATE japan_ranking_imports SET published = 1 WHERE id = ?").run(importId);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
}

export function queueAutomaticJapanRankingsIfDue() {
  const db = getDatabase();
  const season = db.prepare(
    "SELECT * FROM japan_ranking_seasons WHERE active = 1 AND current = 1 ORDER BY year DESC LIMIT 1"
  ).get() as SeasonRow | undefined;
  if (!season) return null;
  const threshold = Date.now() - Math.max(1, season.refresh_interval_hours ?? 24) * 60 * 60 * 1000;
  if (season.last_automatic_check_at && new Date(season.last_automatic_check_at).getTime() > threshold) return null;
  db.prepare("UPDATE japan_ranking_seasons SET last_automatic_check_at = ?, updated_at = ? WHERE year = ?")
    .run(isoNow(), isoNow(), season.year);
  return queueAllJapanRankings(season.year, "automatic");
}
