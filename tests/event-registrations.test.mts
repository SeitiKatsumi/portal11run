import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { eventParticipantAge, validateEventRegistration } from "../src/lib/event-registrations.ts";

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
      const saved = createEventRegistration(individual);
      assert.equal(saved.participantCount, 1);
      assert.match(saved.registrationId, /^[a-f0-9-]{36}$/);
      const group = createEventRegistration({...school, participants: Array.from({length: 500}, (_, index) => ({...individual.participants[0], name: 'Aluno ' + index}))});
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
      assert.throws(() => createEventRegistration({...school, participants: [individual.participants[0], {...individual.participants[0], name: 'Falha deliberada'}]}), /forced failure/);
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
