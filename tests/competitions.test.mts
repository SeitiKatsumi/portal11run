import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const directory = path.join(tmpdir(), `11run-competition-${randomUUID()}`);
mkdirSync(directory, { recursive: true });
process.env.SQLITE_PATH = path.join(directory, "test.sqlite");

const { saveLead, updateLead } = await import("../src/lib/leads.ts");
const competition = await import("../src/lib/competitions.ts");

function athlete(name: string, gender: string) {
  const lead = saveLead({
    name: "Responsável QA",
    email: `${name.replace(/\s/g, "").toLowerCase()}@example.test`,
    phone: "19999999999",
    city: "Campinas",
    state: "SP",
    project_type: competition.CROSS_COUNTRY_PUBLIC_SLUG,
    athlete_name: name,
    birth_date: "2013-05-10",
    gender,
    term_acceptor_name: "Responsável QA",
    term_acceptor_cpf: "52998224725",
    accepted_terms: true,
    accepted_contact: true
  });
  updateLead(lead.id, { pipeline_status: "Aceitas" });
  return lead;
}

test("numera, cronometra, reordena, bloqueia duplicata e homologa", () => {
  athlete("Bruno QA", "Masculino");
  athlete("Caio QA", "Masculino");
  const imported = competition.importAcceptedCrossCountryEntries();
  assert.equal(imported.imported, 2);

  const preview = competition.previewBibAssignment(41);
  assert.deepEqual(preview.map((item) => item.bib), ["0041", "0042"]);
  competition.assignBibNumbers(41);
  const entries = competition.listCompetitionEntries();
  const raceId = entries[0].race_id;
  const deviceId = "test-device";
  competition.armRace(raceId, deviceId);
  const startedAt = Date.now();
  competition.startRace(raceId, deviceId, startedAt);
  const paused = competition.pauseRace(raceId, deviceId, startedAt + 5_000) as { status: string; paused_elapsed_ms: number };
  assert.equal(paused.status, "ARMED");
  assert.equal(paused.paused_elapsed_ms, 5_000);
  const resumed = competition.startRace(raceId, deviceId, startedAt + 10_000) as { status: string; started_device_epoch_ms: number };
  assert.equal(resumed.status, "RUNNING");
  assert.equal(resumed.started_device_epoch_ms, startedAt + 5_000);

  const first = competition.syncRaceFinishes(raceId, [{ clientEventId: "scan-1", bibNumber: entries[0].bib_number!, elapsedMs: 240_000, capturedAt: new Date().toISOString(), deviceId }]);
  assert.equal(first.accepted.length, 1);
  const second = competition.syncRaceFinishes(raceId, [{ clientEventId: "scan-2", bibNumber: entries[1].bib_number!, elapsedMs: 230_000, capturedAt: new Date().toISOString(), deviceId }]);
  assert.deepEqual(second.results.map((item) => item.position), [1, 2]);
  assert.equal(second.results[0].bibNumber, entries[1].bib_number);

  const duplicate = competition.syncRaceFinishes(raceId, [{ clientEventId: "scan-3", bibNumber: entries[1].bib_number!, elapsedMs: 220_000, capturedAt: new Date().toISOString(), deviceId }]);
  assert.match(duplicate.rejected[0].error, /já registrado/i);

  const corrected = competition.updateFinish(second.results[1].id, { elapsedMs: 210_000 }, "test", "correção QA");
  assert.equal(corrected[0].bibNumber, entries[0].bib_number);
  assert.equal(corrected[0].position, 1);

  competition.pauseRace(raceId, deviceId, startedAt + 20_000);
  const final = competition.homologateRace(raceId);
  assert.ok(final.every((item) => !item.provisional));
  assert.throws(() => competition.updateFinish(final[0].id, { elapsedMs: 200_000 }), /Reabra a bateria/);
  competition.resetRace(raceId, "test", "nova simulação");
  const resetRace = competition.listCompetitionRaces().find((race) => race.id === raceId);
  assert.equal(resetRace?.status, "READY");
  assert.equal(resetRace?.session_status, "CANCELLED");
  assert.equal(competition.buildResults().length, 0);

  competition.armRace(raceId, deviceId);
  competition.startRace(raceId, deviceId, startedAt + 30_000);
  competition.syncRaceFinishes(raceId, [{ clientEventId: "scan-after-reset", bibNumber: entries[0].bib_number!, elapsedMs: 10_000, capturedAt: new Date().toISOString(), deviceId }]);
  competition.pauseRace(raceId, deviceId, startedAt + 41_000);
  const cleared = competition.resetCompetition(undefined, "test", "limpeza geral QA");
  assert.equal(cleared.finishes, 1);
  assert.equal(competition.buildResults().length, 0);
  assert.deepEqual(competition.listCompetitionEntries().map((entry) => entry.bib_number), entries.map((entry) => entry.bib_number));
  assert.ok(competition.listCompetitionRaces().every((race) => race.status === "READY"));
});

test("rejeita numeração acima de 9999", () => {
  assert.throws(() => competition.previewBibAssignment(9999), /ultrapassa/);
});

test("cria edição virtual, cadastra na hora e classifica por categoria", () => {
  assert.throws(() => competition.createVirtualChallengeEdition({ title: "Data inválida", location: "Campinas", eventDate: "2026-02-31" }), /data válida/);
  const edition = competition.createVirtualChallengeEdition({ title: "Etapa QA Campinas", location: "Campinas/SP", eventDate: "2026-11-13" });
  const ana = competition.registerVirtualChallengeAthlete({ competitionId: edition.id, name: "Ana Virtual", age: 9, gender: "Feminino" });
  const bia = competition.registerVirtualChallengeAthlete({ competitionId: edition.id, name: "Bia Virtual", age: 9, gender: "Feminino", city: "Valinhos/SP" });
  const leo = competition.registerVirtualChallengeAthlete({ competitionId: edition.id, name: "Leo Virtual", age: 13, gender: "Masculino" });
  assert.deepEqual([ana.bib, bia.bib, leo.bib], ["0001", "0002", "0003"]);
  assert.deepEqual([ana.category, leo.category], ["Sub 10", "Sub 14"]);
  const race = competition.listCompetitionRaces(edition.id)[0];
  competition.armRace(race.id, "virtual-device");
  const startedAt = Date.now();
  competition.startRace(race.id, "virtual-device", startedAt);
  competition.syncRaceFinishes(race.id, [
    { clientEventId: "virtual-ana", bibNumber: ana.bib_number!, elapsedMs: 250_000, capturedAt: new Date().toISOString(), deviceId: "virtual-device" },
    { clientEventId: "virtual-bia", bibNumber: bia.bib_number!, elapsedMs: 240_000, capturedAt: new Date().toISOString(), deviceId: "virtual-device" },
    { clientEventId: "virtual-leo", bibNumber: leo.bib_number!, elapsedMs: 230_000, capturedAt: new Date().toISOString(), deviceId: "virtual-device" }
  ]);
  const results = competition.buildResults(edition.id);
  assert.deepEqual(results.filter((item) => item.category === "Sub 10").map((item) => [item.name, item.position]), [["Bia Virtual", 1], ["Ana Virtual", 2]]);
  assert.equal(results.find((item) => item.category === "Sub 14")?.position, 1);
});
