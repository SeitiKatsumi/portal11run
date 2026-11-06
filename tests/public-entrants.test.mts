import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { pathToFileURL } from "node:url";

test("lista pública do Cross Country expõe apenas nome e categoria de inscrições ativas", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "11run-cross-entrants-"));
  try {
    const result = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", `
      import assert from 'node:assert/strict';
      import { saveLead, listPublicCrossCountryEntrants, updateLead } from ${JSON.stringify(pathToFileURL(path.resolve("src/lib/leads.ts")).href)};
      const lead = saveLead({name:'Responsável',email:'responsavel@example.org',phone:'11999991234',city:'Campinas',state:'SP',project_type:'circuito-cross-country-ivcl-11run',athlete_name:'Ana Corredora',birth_date:'2013-05-10',gender:'Feminino',term_acceptor_name:'Responsável',term_acceptor_cpf:'52998224725',accepted_terms:true,accepted_contact:true});
      const publicEntrants = listPublicCrossCountryEntrants();
      assert.equal(publicEntrants.length, 1);
      assert.equal(publicEntrants[0].name, 'Ana Corredora');
      assert.equal(publicEntrants[0].category, 'Sub 14');
      updateLead(lead.id, {pipeline_status:'Declinados'});
      assert.deepEqual(listPublicCrossCountryEntrants(), []);
    `], { encoding: "utf8", env: { ...process.env, SQLITE_PATH: path.join(directory, "cross.sqlite") } });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
