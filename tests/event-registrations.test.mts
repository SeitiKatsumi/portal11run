import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { eventParticipantAge, validateEventRegistration as validateRegistration } from "../src/lib/event-registrations.ts";
import { isVinhedoRegistrationOpen } from "../src/lib/vinhedo-registration.ts";

const registrationTime = new Date("2026-10-27T12:00:00.000Z");
const validateEventRegistration = (input: unknown, now: Date = registrationTime) => validateRegistration(input, now);

const individual = {
  event_id: "finalissima-desafio-virtual-2026",
  registration_type: "individual",
  name: "Responsável da Criança",
  email: "responsavel@example.org",
  phone: "+55 (11) 99999-1234",
  city: "Campinas",
  state: "SP",
  participants: [{ name: "Ana Silva", birth_date: "2016-11-13", gender: "Feminino" }],
  consent: true,
  guardian_authorization: true,
  website: ""
};
const school = { ...individual, event_id: "inauguracao-centro-olimpico-vinhedo-2026", registration_type: "school", school_name: "Escola Municipal de Vinhedo" };
const vinhedo = {
  event_id: "inauguracao-centro-olimpico-vinhedo-2026",
  registration_type: "individual",
  name: "Responsável do Aluno",
  phone: "+55 (19) 99999-1234",
  participants: [{ name: "Aluno de Vinhedo", birth_date: "2017-03-12", gender: "Não informar", school_year: "4" }],
  consent: true,
  guardian_authorization: true,
  website: ""
};

test("Vinhedo aceita os dados mínimos do responsável e exige a série do aluno", () => {
  const result = validateEventRegistration(vinhedo);
  assert.equal(result.participants[0].school_year, "4");
  assert.equal(result.email, "");
  assert.equal(result.city, "");
  assert.equal(result.state, "");
  for (const school_year of ["1", "2", "3", "4", "5"]) assert.equal(validateEventRegistration({ ...vinhedo, participants: [{ ...vinhedo.participants[0], school_year }] }).participants[0].school_year, school_year);
  for (const school_year of [undefined, null, "", "0", "6", 1, "1º Ano", "3 ", {}]) assert.throws(() => validateEventRegistration({ ...vinhedo, participants: [{ ...vinhedo.participants[0], school_year }] }), /série/);
  for (const field of ["name", "phone"]) assert.throws(() => validateEventRegistration({ ...vinhedo, [field]: undefined }));
  for (const field of ["email", "city", "state"]) assert.throws(() => validateEventRegistration({ ...individual, [field]: undefined }));
  assert.throws(() => validateEventRegistration({ ...vinhedo, email: "email-inválido" }), /e-mail/);
  assert.throws(() => validateEventRegistration({ ...vinhedo, state: "XX" }), /UF/);
});

test("Vinhedo valida data real até hoje sem impor a faixa etária da prova antiga", () => {
  for (const birth_date of ["2021-03-12", "2007-03-12"]) assert.doesNotThrow(() => validateEventRegistration({ ...vinhedo, participants: [{ ...vinhedo.participants[0], birth_date }] }));
  for (const birth_date of ["2017-02-30", "2026-10-28", "0000-01-01", ""]) assert.throws(() => validateEventRegistration({ ...vinhedo, participants: [{ ...vinhedo.participants[0], birth_date }] }), /nascimento/);
  assert.doesNotThrow(() => validateEventRegistration({ ...vinhedo, participants: [{ ...vinhedo.participants[0], birth_date: "2026-10-26" }] }, new Date("2026-10-27T02:59:59.999Z")));
  assert.throws(() => validateEventRegistration({ ...vinhedo, participants: [{ ...vinhedo.participants[0], birth_date: "2026-10-27" }] }, new Date("2026-10-27T02:59:59.999Z")), /nascimento/);
  assert.throws(() => validateEventRegistration({ ...vinhedo, participants: [{ ...vinhedo.participants[0], gender: "Outro" }] }), /gênero/);
  assert.throws(() => validateEventRegistration({ ...vinhedo, participants: [...vinhedo.participants, vinhedo.participants[0]] }), /individual/);
});

test("Vinhedo exige WhatsApp válido, autorização e privacidade sem coerção", () => {
  for (const value of [false, "true", 1, null]) {
    assert.throws(() => validateEventRegistration({ ...vinhedo, consent: value }), /Privacidade/);
    assert.throws(() => validateEventRegistration({ ...vinhedo, guardian_authorization: value }), /responsável legal/);
  }
  for (const phone of ["123", "00000000000", "telefone-inválido", "1234567890123456"]) assert.throws(() => validateEventRegistration({ ...vinhedo, phone }), /telefone/);
  assert.throws(() => validateEventRegistration({ ...vinhedo, website: "spam" }));
});

test("prazo de Vinhedo inclui 02/11 em São Paulo e não fecha a Finalíssima", () => {
  const lastInstant = new Date("2026-11-03T02:59:59.999Z");
  const firstClosed = new Date("2026-11-03T03:00:00.000Z");
  assert.equal(isVinhedoRegistrationOpen(lastInstant), true);
  assert.equal(isVinhedoRegistrationOpen(firstClosed), false);
  assert.equal(isVinhedoRegistrationOpen(new Date("invalid")), false);
  assert.doesNotThrow(() => validateEventRegistration(vinhedo, lastInstant));
  assert.throws(() => validateEventRegistration(vinhedo, firstClosed), /encerraram em 02\/11\/2026/);
  assert.throws(() => validateEventRegistration(school, firstClosed), /encerraram/);
  assert.doesNotThrow(() => validateEventRegistration(individual, firstClosed));
});

test("inscrição individual normaliza contatos e exige exatamente um participante", () => {
  const result = validateEventRegistration({ ...individual, name: "  Maria  Silva ", email: " MARIA@EXAMPLE.ORG ", state: "sp", school_name: "ignorado" });
  assert.equal(result.name, "Maria Silva");
  assert.equal(result.email, "maria@example.org");
  assert.equal(result.school_name, null);
  assert.equal(result.state, "SP");
  assert.throws(() => validateEventRegistration({ ...individual, participants: [] }));
  assert.throws(() => validateEventRegistration({ ...individual, participants: [...individual.participants, { ...individual.participants[0], name: "Bia Silva" }] }), /individual/);
});

test("idade é validada no dia do evento incluindo os limites de aniversário", () => {
  assert.equal(eventParticipantAge("2017-11-13", "2026-11-13"), 9);
  assert.equal(eventParticipantAge("2017-11-14", "2026-11-13"), 8);
  for (const birth_date of ["2017-11-13", "2012-11-14"]) assert.doesNotThrow(() => validateEventRegistration({ ...individual, participants: [{ ...individual.participants[0], birth_date }] }));
  for (const birth_date of ["2017-11-14", "2012-11-13"]) assert.throws(() => validateEventRegistration({ ...individual, participants: [{ ...individual.participants[0], birth_date }] }), /9 a 13/);
  for (const birth_date of ["2020-11-14", "2008-11-15"]) assert.doesNotThrow(() => validateEventRegistration({ ...school, participants: [{ ...individual.participants[0], birth_date }] }));
  for (const birth_date of ["2020-11-15", "2008-11-14"]) assert.throws(() => validateEventRegistration({ ...school, participants: [{ ...individual.participants[0], birth_date }] }), /6 a 17/);
});

test("datas inválidas, futuras e gêneros fora das opções são recusados", () => {
  for (const birth_date of ["2016-02-30", "2015-02-29", "2016-13-01", "13/11/2016", "2028-01-01", "", "0000-01-01"]) assert.throws(() => validateEventRegistration({ ...individual, participants: [{ ...individual.participants[0], birth_date }] }));
  assert.throws(() => validateEventRegistration({ ...individual, participants: [{ ...individual.participants[0], gender: "Outro" }] }), /gênero/);
  assert.doesNotThrow(() => validateEventRegistration({ ...individual, participants: [{ ...individual.participants[0], birth_date: "2016-02-29", gender: "Não informar" }] }));
});

test("aceites e contatos são verificados no servidor sem coerção", () => {
  for (const consent of [false, "true", 1, null]) assert.throws(() => validateEventRegistration({ ...individual, consent }), /Privacidade/);
  for (const guardian_authorization of [false, "true", 1, null]) assert.throws(() => validateEventRegistration({ ...individual, guardian_authorization }), /responsável legal/);
  for (const field of ["name", "email", "phone", "city", "state"]) assert.throws(() => validateEventRegistration({ ...individual, [field]: {} }));
  for (const phone of ["123", "00000000000", "telefone-inválido", "1234567890123456"]) assert.throws(() => validateEventRegistration({ ...individual, phone }), /telefone/);
  assert.throws(() => validateEventRegistration({ ...individual, email: "email-inválido" }), /e-mail/);
  assert.throws(() => validateEventRegistration({ ...individual, state: "XX" }), /UF/);
  assert.throws(() => validateEventRegistration({ ...individual, name: "x".repeat(121) }));
  assert.throws(() => validateEventRegistration({ ...individual, website: "https://spam.example" }));
});

test("grupos escolares possuem de 1 a 500 alunos e exigem identificação e autorizações", () => {
  assert.equal(validateEventRegistration(school).registration_type, "school");
  assert.throws(() => validateEventRegistration({ ...school, school_name: "" }), /escola/);
  assert.throws(() => validateEventRegistration({ ...school, guardian_authorization: false }), /todos os alunos/);
  assert.throws(() => validateEventRegistration({ ...school, event_id: individual.event_id }), /apenas inscrições individuais/);
  const participants = Array.from({ length: 500 }, (_, index) => ({ ...individual.participants[0], name: `Aluno ${index + 1}` }));
  assert.equal(validateEventRegistration({ ...school, participants }).participants.length, 500);
  assert.throws(() => validateEventRegistration({ ...school, participants: [...participants, { ...participants[0], name: "Aluno 501" }] }), /500/);
  assert.throws(() => validateEventRegistration({ ...school, participants: [participants[0], participants[0]] }), /repetido/);
  assert.throws(() => validateEventRegistration({ ...school, participants: [null] }));
});

test("eventos e tipos desconhecidos não são aceitos", () => {
  for (const event_id of ["__proto__", "outro-evento", null]) assert.throws(() => validateEventRegistration({ ...individual, event_id }), /evento válido/);
  assert.throws(() => validateEventRegistration({ ...individual, registration_type: "outro" }));
  for (const payload of [null, [], "cadastro", 12]) assert.throws(() => validateEventRegistration(payload));
});

test("SQLite persiste inscritos, preserva aceites e reverte completamente falhas em um grupo", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "11run-event-registrations-"));
  try {
    // O processo isolado libera a conexão SQLite antes de remover o arquivo no Windows.
    const result = spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", `
      import assert from 'node:assert/strict';
      import { DatabaseSync } from 'node:sqlite';
      import { createEventRegistration, listEventRegistrations } from ${JSON.stringify(pathToFileURL(path.resolve("src/lib/event-registrations.ts")).href)};
      const individual = ${JSON.stringify(individual)};
      const school = ${JSON.stringify(school)};
      const registrationTime = new Date(${JSON.stringify(registrationTime.toISOString())});
      const saved = createEventRegistration(individual, registrationTime);
      assert.equal(saved.participantCount, 1);
      assert.match(saved.registrationId, /^[a-f0-9-]{36}$/);
      const group = createEventRegistration({...school, participants: Array.from({length: 500}, (_, index) => ({...individual.participants[0], name: 'Aluno ' + index}))}, registrationTime);
      assert.equal(group.participantCount, 500);
      const connection = new DatabaseSync(process.env.SQLITE_PATH);
      assert.equal(connection.prepare('SELECT count(*) AS total FROM event_registrations').get().total, 2);
      assert.equal(connection.prepare('SELECT count(*) AS total FROM event_registration_participants').get().total, 501);
      const listed = listEventRegistrations();
      assert.equal(listed.length, 2);
      assert.equal(listed.find((entry) => entry.id === group.registrationId).participants.length, 500);
      assert.equal(listed.find((entry) => entry.id === saved.registrationId).guardian_authorization, true);
      assert.match(listed.find((entry) => entry.id === saved.registrationId).guardian_authorization_text, /acompanhamento de um adulto responsável/);
      assert.match(listed[0].consent_text, /receber orientações sobre o evento/);
      assert.match(listed.find((entry) => entry.id === group.registrationId).guardian_authorization_text, /todos os alunos/);
      assert.ok(listed[0].created_at);
      connection.exec("CREATE TRIGGER force_failure BEFORE INSERT ON event_registration_participants WHEN NEW.name = 'Falha deliberada' BEGIN SELECT RAISE(ABORT, 'forced failure'); END");
      assert.throws(() => createEventRegistration({...school, participants: [individual.participants[0], {...individual.participants[0], name: 'Falha deliberada'}]}, registrationTime), /forced failure/);
      assert.equal(connection.prepare('SELECT count(*) AS total FROM event_registrations').get().total, 2);
      assert.equal(connection.prepare('SELECT count(*) AS total FROM event_registration_participants').get().total, 501);
      assert.throws(() => createEventRegistration({...individual, consent: false}));
      assert.equal(connection.prepare('SELECT count(*) AS total FROM event_registrations').get().total, 2);
      connection.close();
    `], { encoding: "utf8", env: { ...process.env, SQLITE_PATH: path.join(directory, "events.sqlite") } });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("migração adiciona série sem perder inscrições antigas e persiste o cadastro mínimo", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "11run-vinhedo-migration-"));
  const databasePath = path.join(directory, "events.sqlite");
  const moduleUrl = pathToFileURL(path.resolve("src/lib/event-registrations.ts")).href;
  const run = (source: string) => spawnSync(process.execPath, ["--experimental-strip-types", "--input-type=module", "-e", source], { encoding: "utf8", env: { ...process.env, SQLITE_PATH: databasePath } });
  try {
    const result = run(`
      import assert from 'node:assert/strict';
      import { DatabaseSync } from 'node:sqlite';
      import { createEventRegistration, listEventRegistrations } from ${JSON.stringify(moduleUrl)};
      const legacy = new DatabaseSync(process.env.SQLITE_PATH);
      legacy.exec(\`
        CREATE TABLE event_registrations (
          id TEXT PRIMARY KEY, event_id TEXT NOT NULL, registration_type TEXT NOT NULL,
          name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, city TEXT NOT NULL, state TEXT NOT NULL,
          school_name TEXT, consent INTEGER NOT NULL, guardian_authorization INTEGER NOT NULL,
          consent_text TEXT NOT NULL, guardian_authorization_text TEXT NOT NULL, created_at TEXT NOT NULL
        );
        CREATE TABLE event_registration_participants (
          id INTEGER PRIMARY KEY, registration_id TEXT NOT NULL REFERENCES event_registrations(id),
          name TEXT NOT NULL, birth_date TEXT NOT NULL, gender TEXT NOT NULL
        );
        INSERT INTO event_registrations VALUES (
          'legacy-school', 'inauguracao-centro-olimpico-vinhedo-2026', 'school', 'Responsável antigo',
          'antigo@example.org', '19999991234', 'Vinhedo', 'SP', 'Escola antiga', 1, 1,
          'Consentimento original', 'Autorização original', '2026-10-23T12:00:00.000Z'
        );
        INSERT INTO event_registration_participants (registration_id, name, birth_date, gender)
        VALUES ('legacy-school', 'Aluno antigo', '2016-03-12', 'Masculino');
      \`);
      legacy.close();
      const old = listEventRegistrations();
      assert.equal(old.length, 1);
      assert.equal(old[0].school_name, 'Escola antiga');
      assert.equal(old[0].participants[0].name, 'Aluno antigo');
      assert.equal(old[0].participants[0].school_year, null);
      assert.equal(old[0].guardian_authorization_text, 'Autorização original');
      const saved = createEventRegistration(${JSON.stringify(vinhedo)}, new Date(${JSON.stringify(registrationTime.toISOString())}));
      const listed = listEventRegistrations();
      assert.equal(listed.length, 2);
      const minimal = listed.find((entry) => entry.id === saved.registrationId);
      assert.equal(minimal.participants[0].school_year, '4');
      assert.equal(minimal.email, '');
      assert.equal(minimal.city, '');
      assert.equal(minimal.state, '');
      assert.equal(minimal.created_at, ${JSON.stringify(registrationTime.toISOString())});
      const connection = new DatabaseSync(process.env.SQLITE_PATH);
      assert.equal(connection.prepare('SELECT school_year FROM event_registration_participants WHERE registration_id = ?').get(saved.registrationId).school_year, '4');
      assert.equal(connection.prepare('PRAGMA integrity_check').get().integrity_check, 'ok');
      connection.close();
    `);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const reopened = run(`
      import assert from 'node:assert/strict';
      import { listEventRegistrations } from ${JSON.stringify(moduleUrl)};
      const listed = listEventRegistrations();
      assert.equal(listed.length, 2);
      assert.equal(listed.find((entry) => entry.id === 'legacy-school').participants[0].school_year, null);
      assert.equal(listed.find((entry) => entry.id !== 'legacy-school').participants[0].school_year, '4');
    `);
    assert.equal(reopened.status, 0, reopened.stderr || reopened.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
