import assert from "node:assert/strict";
import test from "node:test";
import {
  activityFingerprint,
  categoryForBirthDate,
  elevationDecision,
  formatCircuitTime,
  normalizeEvidenceUrl,
  normalizePublicName,
  parseCircuitTime,
  periodBounds,
  selectBestMarks,
  validateCircuitActivityDate,
  validateCpf,
  type RankableSubmission
} from "../src/lib/virtual-circuit-core.ts";

test("converte e formata MM:SS.CC sem perder centésimos", () => {
  assert.equal(parseCircuitTime("03:42.18"), 222_180);
  assert.equal(formatCircuitTime(222_180), "03:42.18");
  assert.throws(() => parseCircuitTime("3:72"));
});

test("calcula a categoria pela idade no ano da edição", () => {
  assert.deepEqual(categoryForBirthDate("2017-08-21", 2026), { age: 9, birthYear: 2017 });
  assert.equal(categoryForBirthDate("2013-01-02", 2026).age, 13);
  assert.throws(() => categoryForBirthDate("2012-01-01", 2026));
});

test("aceita atividades desde 01 de julho de 2026", () => {
  assert.equal(validateCircuitActivityDate("2026-07-01", "2026-07-01", "2026-12-15"), "2026-07-01");
  assert.equal(validateCircuitActivityDate("2026-08-01", "2026-07-01", "2026-12-15"), "2026-08-01");
  assert.throws(() => validateCircuitActivityDate("2026-06-30", "2026-07-01", "2026-12-15"));
});

test("valida dígitos verificadores do CPF", () => {
  assert.equal(validateCpf("529.982.247-25"), true);
  assert.equal(validateCpf("111.111.111-11"), false);
  assert.equal(validateCpf("529.982.247-24"), false);
});

test("seleciona a melhor marca e aplica os desempates", () => {
  const base: Omit<RankableSubmission, "id" | "athleteId" | "publicName" | "timeMs" | "type" | "activityDate" | "badge"> = {
    categoryAge: 10, gender: "FEMALE", city: "Itatiba", state: "SP"
  };
  const items: RankableSubmission[] = [
    { ...base, id: "1", athleteId: "a", publicName: "Ana S.", timeMs: 230000, type: "OPEN_COURSE", activityDate: "2026-08-03", badge: "Percurso Livre" },
    { ...base, id: "2", athleteId: "a", publicName: "Ana S.", timeMs: 225000, type: "TRACK_400M", activityDate: "2026-08-04", badge: "Pista 400m" },
    { ...base, id: "3", athleteId: "b", publicName: "Bia M.", timeMs: 225000, type: "OFFICIAL_COMPETITION", activityDate: "2026-08-05", badge: "Oficial" }
  ];
  const result = selectBestMarks(items);
  assert.equal(result.length, 2);
  assert.equal(result[0].athleteId, "b");
  assert.equal(result[1].id, "2");
});

test("decide altimetria com tolerância configurável", () => {
  assert.equal(elevationDecision(100, 101).status, "PASS");
  assert.equal(elevationDecision(100, 99, 2).status, "REVIEW");
  assert.equal(elevationDecision(100, 97, 2).status, "FAIL");
});

test("calcula períodos mensal, trimestral e da edição", () => {
  assert.deepEqual(periodBounds("month", "2026-09-12", "2026-08-01", "2026-12-15"), { start: "2026-09-01", end: "2026-09-30" });
  assert.deepEqual(periodBounds("quarter", "2026-08-12", "2026-08-01", "2026-12-15"), { start: "2026-08-01", end: "2026-10-31" });
  assert.deepEqual(periodBounds("edition", "2026-09-12", "2026-08-01", "2026-12-15"), { start: "2026-08-01", end: "2026-12-15" });
});

test("fingerprint detecta reenvio idêntico", () => {
  const input = { athleteId: "a", activityDate: "2026-09-01", declaredTimeMs: 210000, type: "TRACK_400M" as const };
  assert.equal(activityFingerprint(input), activityFingerprint(input));
  assert.notEqual(activityFingerprint(input), activityFingerprint({ ...input, declaredTimeMs: 210010 }));
});

test("bloqueia SSRF e limita provedores de vídeo", () => {
  assert.throws(() => normalizeEvidenceUrl("http://127.0.0.1/admin", []));
  assert.throws(() => normalizeEvidenceUrl("https://example.com/video", ["youtube.com", "instagram.com"]));
  assert.match(normalizeEvidenceUrl("https://youtu.be/exemplo", ["youtube.com", "youtu.be"]), /^https:\/\/youtu\.be/);
});

test("remove caracteres de marcação do nome público", () => {
  assert.equal(normalizePublicName("<script>Ana</script> Silva"), "Ana Silva");
});
