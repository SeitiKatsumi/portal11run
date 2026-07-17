import { mkdirSync, readFileSync } from "fs";
import path from "path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

export const sponsorCategories = ["Realização", "Patrocinador Master", "Apoiadores"] as const;

export type SponsorCategory = (typeof sponsorCategories)[number];

export type SponsorRecord = {
  id: string;
  name: string;
  description: string | null;
  category: SponsorCategory;
  logo_url: string | null;
  active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type SponsorInput = {
  name: string;
  description?: string;
  category?: string;
  logo_url?: string;
  active?: boolean;
  sort_order?: string | number;
};

let database: DatabaseSync | undefined;

const sponsorColumns: Record<string, string> = {
  description: "TEXT",
  category: "TEXT NOT NULL DEFAULT 'Apoiadores'",
  logo_url: "TEXT",
  active: "INTEGER NOT NULL DEFAULT 1",
  sort_order: "INTEGER NOT NULL DEFAULT 0"
};

const defaultSponsors: Array<Omit<SponsorRecord, "created_at" | "updated_at">> = [
  {
    id: "elevenmind",
    name: "Elevenmind",
    description: "Realização, estratégia digital e tecnologia do ecossistema 11RUN.",
    category: "Realização",
    logo_url: "/assets/logos/elevenmind-pb.png",
    active: 1,
    sort_order: 10
  },
  {
    id: "instituto-vanderlei-cordeiro",
    name: "Instituto Vanderlei Cordeiro de Lima",
    description: "Instituição parceira na construção de oportunidades para jovens atletas.",
    category: "Realização",
    logo_url: "/assets/logos/instituto-vanderlei-cordeiro.png",
    active: 1,
    sort_order: 20
  },
  {
    id: "bni",
    name: "BNI",
    description: "Patrocinador master do projeto 11RUN.",
    category: "Patrocinador Master",
    logo_url: "/assets/logos/bni.png",
    active: 1,
    sort_order: 10
  },
  {
    id: "bahia-esportes",
    name: "Bahia Esportes",
    description: "Apoiador do projeto.",
    category: "Apoiadores",
    logo_url: "/assets/logos/bahia-esportes.png",
    active: 1,
    sort_order: 10
  },
  {
    id: "porto-seguro",
    name: "Porto Seguro",
    description: "Apoiador do projeto.",
    category: "Apoiadores",
    logo_url: "/assets/logos/porto-seguro.webp",
    active: 1,
    sort_order: 20
  },
  {
    id: "u2e",
    name: "U2E",
    description: "Apoiador do projeto.",
    category: "Apoiadores",
    logo_url: "/assets/logos/u2e.png",
    active: 1,
    sort_order: 30
  },
  {
    id: "lqf",
    name: "LQF Farmacêutica",
    description: "Apoiador do projeto.",
    category: "Apoiadores",
    logo_url: "/assets/logos/lqf-logo.png",
    active: 1,
    sort_order: 40
  },
  {
    id: "built",
    name: "BUILT",
    description: "Apoiador do projeto.",
    category: "Apoiadores",
    logo_url: "/assets/logos/built-horizontal.png",
    active: 1,
    sort_order: 50
  },
  {
    id: "flebo",
    name: "Flebo",
    description: "Apoiador do projeto.",
    category: "Apoiadores",
    logo_url: "/assets/logos/flebo.png",
    active: 1,
    sort_order: 60
  },
  {
    id: "rm-corretora",
    name: "RM Corretora",
    description: "Apoiador do projeto.",
    category: "Apoiadores",
    logo_url: "/assets/logos/rm-corretora.png",
    active: 1,
    sort_order: 70
  }
];

function now() {
  return new Date().toISOString();
}

function normalizeCategory(value?: string): SponsorCategory {
  return sponsorCategories.includes(value as SponsorCategory) ? (value as SponsorCategory) : "Apoiadores";
}

function normalizeSort(value?: string | number) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

function getDatabase() {
  if (database) return database;
  const dbPath = path.resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/portal11run.sqlite");
  mkdirSync(path.dirname(dbPath), { recursive: true });
  database = new DatabaseSync(dbPath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(readFileSync(path.join(process.cwd(), "data/schema.sql"), "utf8"));
  assertSponsorColumns(database);
  assertSponsorIndexes(database);
  seedDefaultSponsors(database);
  return database;
}

function assertSponsorColumns(db: DatabaseSync) {
  const existing = new Set(
    db
      .prepare("PRAGMA table_info(sponsors)")
      .all()
      .map((column) => String((column as { name: string }).name))
  );

  for (const [column, definition] of Object.entries(sponsorColumns)) {
    if (!existing.has(column)) {
      db.exec(`ALTER TABLE sponsors ADD COLUMN ${column} ${definition}`);
    }
  }
}

function assertSponsorIndexes(db: DatabaseSync) {
  db.exec("CREATE INDEX IF NOT EXISTS idx_sponsors_category ON sponsors(category);");
  db.exec("CREATE INDEX IF NOT EXISTS idx_sponsors_active ON sponsors(active);");
}

function seedDefaultSponsors(db: DatabaseSync) {
  const insert = db.prepare(
    `INSERT OR IGNORE INTO sponsors (
      id, name, description, category, logo_url, active, sort_order, created_at, updated_at
    ) VALUES (
      $id, $name, $description, $category, $logo_url, $active, $sort_order, $created_at, $updated_at
    )`
  );
  const timestamp = now();

  for (const sponsor of defaultSponsors) {
    insert.run({
      $id: sponsor.id,
      $name: sponsor.name,
      $description: sponsor.description,
      $category: sponsor.category,
      $logo_url: sponsor.logo_url,
      $active: sponsor.active,
      $sort_order: sponsor.sort_order,
      $created_at: timestamp,
      $updated_at: timestamp
    });
  }
}

export function listSponsors({ activeOnly = true } = {}) {
  const where = activeOnly ? "WHERE active = 1" : "";
  return getDatabase()
    .prepare(
      `SELECT * FROM sponsors
       ${where}
       ORDER BY
         CASE category
           WHEN 'Realização' THEN 1
           WHEN 'Patrocinador Master' THEN 2
           ELSE 3
         END,
         sort_order ASC,
         name ASC`
    )
    .all() as SponsorRecord[];
}

export function getSponsorById(id?: string | null) {
  if (!id) return undefined;
  return getDatabase().prepare("SELECT * FROM sponsors WHERE id = ?").get(id) as SponsorRecord | undefined;
}

export function createSponsor(input: SponsorInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Nome do patrocinador é obrigatório.");

  const sponsor: SponsorRecord = {
    id: randomUUID(),
    name,
    description: input.description?.trim() || null,
    category: normalizeCategory(input.category),
    logo_url: input.logo_url?.trim() || null,
    active: input.active === false ? 0 : 1,
    sort_order: normalizeSort(input.sort_order),
    created_at: now(),
    updated_at: now()
  };

  getDatabase()
    .prepare(
      `INSERT INTO sponsors (
        id, name, description, category, logo_url, active, sort_order, created_at, updated_at
      ) VALUES (
        $id, $name, $description, $category, $logo_url, $active, $sort_order, $created_at, $updated_at
      )`
    )
    .run({
      $id: sponsor.id,
      $name: sponsor.name,
      $description: sponsor.description,
      $category: sponsor.category,
      $logo_url: sponsor.logo_url,
      $active: sponsor.active,
      $sort_order: sponsor.sort_order,
      $created_at: sponsor.created_at,
      $updated_at: sponsor.updated_at
    });

  return sponsor;
}

export function updateSponsor(id: string, input: SponsorInput) {
  const existing = getSponsorById(id);
  if (!existing) throw new Error("Patrocinador não encontrado.");

  const name = input.name.trim();
  if (!name) throw new Error("Nome do patrocinador é obrigatório.");

  const sponsor: SponsorRecord = {
    ...existing,
    name,
    description: input.description?.trim() || null,
    category: normalizeCategory(input.category),
    logo_url: input.logo_url === undefined ? existing.logo_url : input.logo_url?.trim() || null,
    active: input.active === false ? 0 : 1,
    sort_order: normalizeSort(input.sort_order),
    updated_at: now()
  };

  getDatabase()
    .prepare(
      `UPDATE sponsors
       SET name = $name,
           description = $description,
           category = $category,
           logo_url = $logo_url,
           active = $active,
           sort_order = $sort_order,
           updated_at = $updated_at
       WHERE id = $id`
    )
    .run({
      $id: sponsor.id,
      $name: sponsor.name,
      $description: sponsor.description,
      $category: sponsor.category,
      $logo_url: sponsor.logo_url,
      $active: sponsor.active,
      $sort_order: sponsor.sort_order,
      $updated_at: sponsor.updated_at
    });

  return sponsor;
}

export function deleteSponsor(id: string) {
  getDatabase().prepare("DELETE FROM sponsors WHERE id = ?").run(id);
}
