import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "11run-challenges-"));
const databasePath = path.join(temporaryDirectory, "test.sqlite");
process.env.SQLITE_PATH = databasePath;
process.env.CHALLENGE_DATA_KEY = "test-only-private-key-not-used-in-production";

const setup = new DatabaseSync(databasePath);
setup.exec(readFileSync(path.resolve("data/schema.sql"), "utf8"));
const timestamp = "2026-08-03T12:00:00.000Z";
setup.prepare(`INSERT INTO leads (id,name,email,phone,project_type,athlete_name,payload_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`)
  .run("lead-test", "Responsável Teste", "teste@example.com", "11999999999", "11Run Futuro", "Atleta Teste", "{}", timestamp, timestamp);
setup.prepare(`INSERT INTO member_accounts (id,lead_id,role,username,password_hash,password_salt,active,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`)
  .run("account-test", "lead-test", "athlete", "atleta.teste", "hash", "salt", 1, timestamp, timestamp);
setup.prepare(`INSERT INTO financial_records (id,lead_id,direction,type,description,amount_cents,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`)
  .run("aid-test", "lead-test", "saida", "Ajuda de custo", "Ciclo atual", 100_000, "Pago", timestamp, timestamp);
setup.close();

const challenges = await import("../src/lib/member-challenges.ts");

function insertPrivateFile(id: string, purpose: string) {
  const db = new DatabaseSync(databasePath);
  db.prepare(`INSERT INTO member_challenge_files (id,account_id,storage_name,original_name,mime_type,size_bytes,sha256,purpose,encryption_iv,encryption_tag,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, "account-test", `${id}.enc`, `${id}.pdf`, "application/pdf", 100, id.padEnd(64, "0"), purpose, "iv", "tag", timestamp);
  db.close();
}

test("inicializa regras oficiais e calcula evolução pessoal sem ranking", () => {
  const settings = challenges.getChallengeSettings();
  assert.equal(settings.aiConfidenceThreshold, 0.85);
  assert.equal(settings.maximumCombinedBenefit, 35);
  assert.equal(settings.schoolBands.at(-1)?.benefit, 20);

  const db = new DatabaseSync(databasePath);
  db.prepare(`INSERT INTO member_marks (id,account_id,lead_id,age_group,event,time,date,location,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run("mark-1", "account-test", "lead-test", "Sub 14", "1.000 m", "04:00.00", "2026-04-01", "Pista", "Oficial", timestamp, timestamp);
  db.prepare(`INSERT INTO member_marks (id,account_id,lead_id,age_group,event,time,date,location,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .run("mark-2", "account-test", "lead-test", "Sub 14", "1.000 m", "03:48.00", "2026-06-01", "Pista", "Aprovado", timestamp, timestamp);
  db.close();

  const dashboard = challenges.getMemberChallengesDashboard("account-test");
  assert.equal(dashboard.cards.evolution.totalTests, 2);
  assert.equal(dashboard.cards.evolution.bestTime, "03:48.00");
  assert.equal(dashboard.cards.evolution.evolutionFromFirst, 5);
});

test("benefício só entra na projeção após duas aprovações humanas", () => {
  insertPrivateFile("file-attendance", "ATTENDANCE_PLAN");
  const attendance = challenges.submitAttendanceChallenge("account-test", { month: 7, year: 2026, fileId: "file-attendance", attendance: 90, truthAccepted: true });
  challenges.reviewChallengeSubmission({ id: attendance, status: "APPROVED", correctedValue: 90, actor: "admin:test" });

  let dashboard = challenges.getMemberChallengesDashboard("account-test");
  assert.equal(dashboard.benefit.attendancePercent, 0, "sugestão ainda não deve alterar a projeção");

  const db = new DatabaseSync(databasePath);
  const attendanceBenefit = db.prepare("SELECT id FROM member_challenge_benefits WHERE source_type='ATTENDANCE'").get() as { id: string };
  db.close();
  challenges.reviewChallengeBenefit({ id: attendanceBenefit.id, approved: true, actor: "admin:test" });
  dashboard = challenges.getMemberChallengesDashboard("account-test");
  assert.equal(dashboard.benefit.attendancePercent, 15);
  assert.equal(dashboard.benefit.projectedValueCents, 115_000);
});

test("processa leitura escolar estruturada e respeita teto acumulado", () => {
  insertPrivateFile("file-school", "SCHOOL_REPORT");
  const school = challenges.submitSchoolChallenge("account-test", { quarter: 2, year: 2026, fileId: "file-school", guardianAccepted: true });
  const schoolId = school;
  challenges.saveSchoolAiAnalysis(schoolId, { model: "test-model", extracted: { grades: [9, 8] }, normalized: { average: 8.5 }, confidence: 0.92, warnings: [], suggestedScore: 70, suggestedBenefit: 10, status: "COMPLETED" });
  challenges.reviewChallengeSubmission({ id: schoolId, status: "APPROVED", correctedValue: 8.5, actor: "admin:test" });

  const db = new DatabaseSync(databasePath);
  const schoolBenefit = db.prepare("SELECT id FROM member_challenge_benefits WHERE source_type='SCHOOL'").get() as { id: string };
  db.close();
  challenges.reviewChallengeBenefit({ id: schoolBenefit.id, approved: true, actor: "admin:test" });

  const dashboard = challenges.getMemberChallengesDashboard("account-test");
  assert.equal(dashboard.benefit.schoolPercent, 10);
  assert.equal(dashboard.benefit.totalPercent, 25);
  assert.equal(dashboard.benefit.projectedValueCents, 125_000);
  assert.ok(dashboard.badges.earned.some((badge) => (badge as Record<string, unknown>).id === "badge-academic-highlight"));
});

test("somente ideias validadas aparecem no ranking anonimizado", () => {
  const idea = challenges.submitChallengeIdea("account-test", { title: "Oficina de cadência", category: "Treinamentos", description: "Criar uma oficina mensal de cadência e técnica de corrida.", problem: "Melhorar a organização técnica.", expectedImprovement: "Aumentar a qualidade dos treinos." });
  assert.equal(challenges.challengeIdeasPublicRanking().length, 0);
  challenges.reviewChallengeIdea({ id: idea, status: "APPROVED", response: "Ideia validada.", actor: "admin:test" });
  const ranking = challenges.challengeIdeasPublicRanking();
  assert.equal(ranking[0].displayName, "Atleta T.");
  assert.equal(ranking[0].validIdeas, 1);
});

test.after(() => {
  challenges.closeMemberChallengesDatabase();
  rmSync(temporaryDirectory, { recursive: true, force: true });
});
