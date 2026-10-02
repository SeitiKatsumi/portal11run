import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

test("usa Manu em instalações novas, migra a foto antiga e preserva imagens personalizadas", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "11run-home-image-"));
  try {
    for (const [index, previous] of [null, "/assets/home/home-medalha-hero.webp", "/assets/onze-futuro-medalha.webp", "/uploads/custom.webp"].entries()) {
      const dbPath = path.join(directory, `${index}.sqlite`);
      const db = new DatabaseSync(dbPath);
      db.exec(readFileSync("data/schema.sql", "utf8"));
      if (previous) {
        db.prepare(`INSERT INTO home_settings
          (id, hero_image, hero_title, overlay_strength, updated_at)
          VALUES ('primary', ?, 'Título personalizado', 65, '2026-01-01')`).run(previous);
      }
      db.close();
      const readSettings = () => JSON.parse(execFileSync(process.execPath, [
        "--experimental-strip-types", "--input-type=module", "-e",
        "import { getHomeConfig } from './src/lib/home.ts'; console.log(JSON.stringify(getHomeConfig().settings));"
      ], { env: { ...process.env, SQLITE_PATH: dbPath }, encoding: "utf8" }));
      const settings = readSettings();
      assert.equal(settings.hero_image, previous === "/uploads/custom.webp" ? previous : "/assets/manu-bandeira.webp");
      assert.equal(settings.hero_media_type, "image");
      if (previous) {
        assert.equal(settings.hero_title, "Título personalizado");
        assert.equal(settings.overlay_strength, 65);
      }
      assert.deepEqual(readSettings(), settings);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
