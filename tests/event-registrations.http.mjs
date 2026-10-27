// Run against a local server configured with a disposable SQLITE_PATH.
// TEST_ADMIN_PASSWORD is required; TEST_ADMIN_USER defaults to admin.
// This test creates synthetic registrations in that local database.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { isVinhedoRegistrationOpen } from "../src/lib/vinhedo-registration.ts";

const base = new URL(process.env.TEST_BASE_URL || "http://127.0.0.1");
assert.ok(base.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname), "TEST_BASE_URL must be an HTTP loopback address.");
assert.ok(!base.username && !base.password && base.pathname === "/" && !base.search && !base.hash, "Provide only the local server origin.");
assert.equal(process.env.TEST_DISPOSABLE_DATABASE, "1", "Set TEST_DISPOSABLE_DATABASE=1 only after starting the local server with an isolated test SQLITE_PATH.");
assert.ok(process.env.TEST_ADMIN_PASSWORD, "TEST_ADMIN_PASSWORD is required for the disposable local server.");
const token = randomBytes(4).toString("hex");
const ip = (group) => `2001:db8:${token.slice(0, 4)}:${token.slice(4)}::${group}`;
const authorization = `Basic ${Buffer.from(`${process.env.TEST_ADMIN_USER || "admin"}:${process.env.TEST_ADMIN_PASSWORD}`).toString("base64")}`;
let checks = 0;

async function request(route, options = {}) {
  return fetch(new URL(route, base), { ...options, redirect: "manual", signal: AbortSignal.timeout(30_000) });
}
async function post(body, group, contentType = "application/json") {
  return request("/api/event-registrations", { method: "POST", headers: { "Content-Type": contentType, "X-Forwarded-For": ip(group) }, body: typeof body === "string" ? body : JSON.stringify(body) });
}
async function expectFailure(response, status) {
  assert.equal(response.status, status, `Expected HTTP ${status}; received ${response.status}.`);
  const result = await response.json();
  assert.equal(result.ok, false);
  assert.ok(typeof result.error === "string" && result.error.length > 0);
  assert.equal(result.registrationId, undefined);
  assert.match(response.headers.get("cache-control") || "", /no-store/);
  checks += 1;
}

const individual = {
  event_id: "finalissima-desafio-virtual-2026",
  registration_type: "individual",
  name: `Responsavel QA HTTP ${token}`,
  email: `qa-eventos-${token}@example.org`,
  phone: "(11) 90000-1234",
  city: "Campinas",
  state: "SP",
  participants: [{ name: `Atleta QA HTTP ${token}`, birth_date: "2016-11-13", gender: "Não informar" }],
  consent: true,
  guardian_authorization: true,
  website: ""
};
const school = {
  ...individual,
  event_id: "inauguracao-centro-olimpico-vinhedo-2026",
  registration_type: "school",
  name: `Responsavel Escola QA ${token}`,
  school_name: `Escola Ficticia QA HTTP ${token}`,
  email: `qa-escola-${token}@example.org`,
  city: "Vinhedo",
  participants: [
    { name: `Aluna QA Grupo ${token}`, birth_date: "2020-11-14", gender: "Feminino" },
    { name: `Aluno QA Grupo ${token}`, birth_date: "2008-11-15", gender: "Masculino" }
  ]
};
const vinhedo = {
  event_id: "inauguracao-centro-olimpico-vinhedo-2026",
  registration_type: "individual",
  name: `Responsavel Fundamental QA ${token}`,
  phone: "(19) 90000-4321",
  participants: [{ name: `Aluno Fundamental QA ${token}`, birth_date: "2018-03-12", gender: "Não informar", school_year: "3" }],
  consent: true,
  guardian_authorization: true,
  website: ""
};
const vinhedoOpen = isVinhedoRegistrationOpen();

for (const [route, text] of [
  ["/eventos/finalissima-desafio-virtual-2026", "Grande Finalíssima do Desafio Virtual"],
  ["/eventos/inauguracao-centro-olimpico-vinhedo-2026", "Centro de Excelência em Atletismo de Vinhedo"],
  ["/eventos/princesinha-da-colina-2026", "Princesinha da Colina"]
]) {
  const response = await request(route);
  assert.equal(response.status, 200, route);
  assert.ok((await response.text()).includes(text), `Missing event content on ${route}.`);
  checks += 1;
}
const health = await request("/api/health");
assert.equal(health.status, 200);
assert.deepEqual(await health.json(), { ok: true, service: "portal11run", port: base.port || "80" });
checks += 1;
assert.equal((await request("/api/event-registrations")).status, 405);
checks += 1;

await expectFailure(await post('{"event_id":', 1), 400);
await expectFailure(await post("not-json", 1, "text/plain"), 415);
await expectFailure(await post("x".repeat(256 * 1024 + 1), 1), 413);
await expectFailure(await post({ ...individual, guardian_authorization: false }, 1), 400);
await expectFailure(await post({ ...individual, consent: "true" }, 1), 400);
await expectFailure(await post({ ...individual, participants: [{ ...individual.participants[0], birth_date: "2017-11-14" }] }, 1), 400);
await expectFailure(await post({ ...individual, website: "qa-honeypot.example.org" }, 1), 400);
await expectFailure(await post({ ...school, event_id: individual.event_id }, 1), 400);

const individualResponse = await post(individual, 2);
assert.equal(individualResponse.status, 201);
const individualResult = await individualResponse.json();
assert.equal(individualResult.ok, true);
assert.equal(individualResult.participantCount, 1);
assert.match(individualResult.registrationId, /^[a-f0-9-]{36}$/);
assert.match(individualResponse.headers.get("cache-control") || "", /no-store/);
checks += 1;
let schoolResult;
let vinhedoResult;
if (vinhedoOpen) {
  const schoolResponse = await post(school, 3);
  assert.equal(schoolResponse.status, 201);
  schoolResult = await schoolResponse.json();
  assert.equal(schoolResult.ok, true);
  assert.equal(schoolResult.participantCount, 2);
  assert.match(schoolResult.registrationId, /^[a-f0-9-]{36}$/);
  assert.notEqual(schoolResult.registrationId, individualResult.registrationId);
  checks += 1;

  await expectFailure(await post({ ...vinhedo, participants: [{ ...vinhedo.participants[0], school_year: undefined }] }, 5), 400);
  await expectFailure(await post({ ...vinhedo, participants: [{ ...vinhedo.participants[0], school_year: "6" }] }, 5), 400);
  await expectFailure(await post({ ...vinhedo, consent: false }, 5), 400);
  await expectFailure(await post({ ...vinhedo, guardian_authorization: false }, 5), 400);
  const vinhedoResponse = await post(vinhedo, 5);
  assert.equal(vinhedoResponse.status, 201);
  vinhedoResult = await vinhedoResponse.json();
  assert.equal(vinhedoResult.ok, true);
  assert.equal(vinhedoResult.participantCount, 1);
  assert.match(vinhedoResult.registrationId, /^[a-f0-9-]{36}$/);
  assert.match(vinhedoResponse.headers.get("cache-control") || "", /no-store/);
  checks += 1;
} else {
  // Após 02/11, o endpoint deve permanecer fechado; os limites exatos usam relógio fixo nos testes unitários.
  for (const payload of [vinhedo, school]) {
    const response = await post(payload, 5);
    assert.equal(response.status, 400);
    const result = await response.json();
    assert.equal(result.ok, false);
    assert.match(result.error, /encerraram em 02\/11\/2026/);
    assert.equal(result.registrationId, undefined);
    checks += 1;
  }
}

const unauthorized = await request("/admin/eventos");
assert.equal(unauthorized.status, 401);
assert.match(unauthorized.headers.get("www-authenticate") || "", /Basic/);
const unauthorizedHtml = await unauthorized.text();
for (const name of [individual.participants[0].name, vinhedo.participants[0].name]) assert.equal(unauthorizedHtml.includes(name), false);
checks += 1;
const admin = await request("/admin/eventos", { headers: { Authorization: authorization } });
assert.equal(admin.status, 200);
const adminHtml = await admin.text();
const expectedAdminValues = [individualResult.registrationId, individual.participants[0].name];
if (schoolResult) expectedAdminValues.push(schoolResult.registrationId, school.school_name, ...school.participants.map((participant) => participant.name));
if (vinhedoResult) expectedAdminValues.push(vinhedoResult.registrationId, vinhedo.name, vinhedo.participants[0].name, "<td>3º Ano</td>");
for (const value of expectedAdminValues) assert.ok(adminHtml.includes(value), `Authenticated admin page must include ${value}.`);
checks += 1;
const vinhedoPublic = await request("/eventos/inauguracao-centro-olimpico-vinhedo-2026");
assert.equal(vinhedoPublic.status, 200);
const vinhedoHtml = await vinhedoPublic.text();
for (const privateValue of [vinhedo.name, vinhedo.phone, vinhedo.participants[0].name, school.school_name]) assert.equal(vinhedoHtml.includes(privateValue), false, "Public landing must not disclose registration data.");
if (vinhedoOpen) {
  for (const name of ["name", "phone", "student_name", "birth_date", "gender", "school_year"]) assert.ok(vinhedoHtml.includes(`name="${name}"`), `Missing simplified field ${name}.`);
  for (const name of ["email", "city", "state", "school_name"]) assert.equal(vinhedoHtml.includes(`name="${name}"`), false, `Unexpected field ${name} on the simplified Vinhedo form.`);
}
checks += 1;
const publicRead = await request("/api/event-registrations");
assert.equal(publicRead.status, 405);
assert.equal((await publicRead.text()).includes(individual.participants[0].name), false);
checks += 1;

// Eight rejected attempts fill a separate synthetic IP bucket; the ninth is limited.
for (let attempt = 0; attempt < 8; attempt += 1) await expectFailure(await post({ ...individual, consent: false }, 4), 400);
await expectFailure(await post({ ...individual, consent: false }, 4), 429);

console.log(`PASS: ${checks} HTTP checks; landings, health, validation, ${vinhedoOpen ? "minimal Vinhedo/legacy school persistence and school year" : "closed Vinhedo deadline"}, Finalíssima, private admin and rate limit. Synthetic test data remains in the disposable local database.`);
