import { mkdirSync, readFileSync } from "fs";
import { randomUUID } from "node:crypto";
import path from "path";
import { DatabaseSync } from "node:sqlite";

export type HomeSettings = {
  id: string;
  hero_media_type: "image" | "video";
  hero_image: string;
  hero_video: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_kicker: string | null;
  content_alignment: "left" | "center";
  overlay_strength: number;
  header_opacity: number;
  header_blur: number;
  updated_at: string;
};

export type HomeProject = {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  sort_order: number;
  active: number;
  created_at: string;
  updated_at: string;
};

let database: DatabaseSync | undefined;

function now() {
  return new Date().toISOString();
}

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  seedHome(database);
  return database;
}

function seedHome(db: DatabaseSync) {
  const timestamp = now();
  db.prepare(
    `INSERT OR IGNORE INTO home_settings (
      id, hero_media_type, hero_image, hero_video, hero_title, hero_subtitle, hero_kicker,
      content_alignment, overlay_strength, header_opacity, header_blur, updated_at
    ) VALUES ('primary', 'image', ?, NULL, ?, ?, ?, 'center', 58, 74, 18, ?)`
  ).run(
    "/assets/home/ayla-trofeus-hero.webp",
    "O futuro da corrida começa aqui.",
    "Escolha uma frente e entre no ecossistema 11RUN.",
    "Performance · formação · oportunidade",
    timestamp
  );

  db.prepare(
    `UPDATE home_settings
     SET hero_image = ?,
         overlay_strength = CASE WHEN overlay_strength < 58 THEN 58 ELSE overlay_strength END,
         updated_at = ?
     WHERE hero_image = ?`
  ).run(
    "/assets/home/ayla-trofeus-hero.webp",
    timestamp,
    "/assets/home/ayla-podcast-hero.webp"
  );

  const projects = [
    ["app-11run", "App 11Run", "Dados, treinos e evolução esportiva.", "BarChart3", "/app-11run", 10],
    ["onze-futuro", "11Run Futuro", "Base, cultura esportiva e desenvolvimento.", "Medal", "/onze-futuro", 20],
    ["circuito-virtual", "Circuito Virtual", "Um ranking nacional para jovens brasileiros.", "Globe2", "/projetos/circuito-virtual-11run", 30],
    ["master", "11Run Master", "Performance competitiva em todas as fases.", "Trophy", "/11-master", 40],
    ["bolsas", "Bolsas", "Caminhos acadêmicos e esportivos internacionais.", "GraduationCap", "/bolsas", 50],
    ["loja", "Loja 11RUN", "Produtos oficiais que fortalecem o projeto.", "ShoppingBag", "/apoie-o-projeto", 60]
  ] as const;
  const insert = db.prepare(
    `INSERT OR IGNORE INTO home_projects
     (id, name, description, icon, href, sort_order, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
  );
  for (const project of projects) insert.run(...project, timestamp, timestamp);
}

export function getHomeConfig({ activeOnly = true } = {}) {
  const db = getDatabase();
  const settings = db.prepare("SELECT * FROM home_settings WHERE id = 'primary'").get() as HomeSettings;
  const projects = db.prepare(
    `SELECT * FROM home_projects ${activeOnly ? "WHERE active = 1" : ""} ORDER BY sort_order ASC, name ASC`
  ).all() as HomeProject[];
  return { settings, projects };
}

export function updateHomeSettings(input: Partial<HomeSettings>) {
  const current = getHomeConfig().settings;
  const mediaType = input.hero_media_type === "video" ? "video" : "image";
  const alignment = input.content_alignment === "left" ? "left" : "center";
  const clamp = (value: unknown, minimum: number, maximum: number, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, Math.round(parsed))) : fallback;
  };
  getDatabase().prepare(
    `UPDATE home_settings SET
      hero_media_type = ?, hero_image = ?, hero_video = ?, hero_title = ?, hero_subtitle = ?,
      hero_kicker = ?, content_alignment = ?, overlay_strength = ?, header_opacity = ?,
      header_blur = ?, updated_at = ? WHERE id = 'primary'`
  ).run(
    mediaType,
    input.hero_image?.trim() || current.hero_image,
    input.hero_video?.trim() || null,
    input.hero_title?.trim() || null,
    input.hero_subtitle?.trim() || null,
    input.hero_kicker?.trim() || null,
    alignment,
    clamp(input.overlay_strength, 0, 80, current.overlay_strength),
    clamp(input.header_opacity, 30, 100, current.header_opacity),
    clamp(input.header_blur, 0, 30, current.header_blur),
    now()
  );
  return getHomeConfig({ activeOnly: false }).settings;
}

export function upsertHomeProject(input: Partial<HomeProject> & Pick<HomeProject, "name" | "href">) {
  const id = input.id?.trim() || randomUUID();
  const timestamp = now();
  getDatabase().prepare(
    `INSERT INTO home_projects (id, name, description, icon, href, sort_order, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name, description = excluded.description, icon = excluded.icon, href = excluded.href,
       sort_order = excluded.sort_order, active = excluded.active, updated_at = excluded.updated_at`
  ).run(
    id,
    input.name.trim(),
    input.description?.trim() || "",
    input.icon?.trim() || "Sparkles",
    input.href.trim(),
    Number.isFinite(Number(input.sort_order)) ? Math.trunc(Number(input.sort_order)) : 0,
    input.active === 0 ? 0 : 1,
    timestamp,
    timestamp
  );
  return getDatabase().prepare("SELECT * FROM home_projects WHERE id = ?").get(id) as HomeProject;
}

export function deactivateHomeProject(id: string) {
  getDatabase().prepare("UPDATE home_projects SET active = 0, updated_at = ? WHERE id = ?").run(now(), id);
}
