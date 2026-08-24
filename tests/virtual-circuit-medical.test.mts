import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

process.env.SQLITE_PATH = path.join(tmpdir(), `11run-medical-${randomUUID()}.sqlite`);
process.env.VIRTUAL_CIRCUIT_DATA_KEY = "test-only-medical-clearance-key";

const circuit = await import("../src/lib/virtual-circuit.ts");
const { categoryForBirthDate } = await import("../src/lib/virtual-circuit-core.ts");
const { mandatoryConsents } = await import("../src/lib/virtual-circuit-content.ts");

function privateFile(purpose: string) {
  return circuit.registerPrivateFile({
    storageName: `${randomUUID()}.pdf`,
    originalName: "documento.pdf",
    mimeType: "application/pdf",
    sizeBytes: 100,
    sha256: randomUUID().replaceAll("-", ""),
    purpose
  });
}

function registration(medical: Record<string, unknown>) {
  return circuit.createCircuitRegistration({
    athlete: {
      fullName: "Atleta Teste",
      publicName: "Atleta T.",
      cpf: "529.982.247-25",
      birthDate: "2015-04-10",
      city: "Itatiba",
      state: "SP",
      gender: "FEMALE",
      documentFileId: privateFile("ATHLETE_DOCUMENT")
    },
    guardian: {
      fullName: "Responsável Teste",
      cpf: "111.444.777-35",
      relationship: "Mãe",
      email: "responsavel@example.com",
      phone: "11999999999",
      birthDate: "1988-03-20"
    },
    medical: medical as Parameters<typeof circuit.createCircuitRegistration>[0]["medical"],
    submission: {
      type: "OFFICIAL_COMPETITION",
      activityDate: "2026-08-10",
      time: "03:42.18",
      city: "Itatiba",
      state: "SP",
      details: { competitionName: "Teste", organizer: "Organização" },
      evidence: [{ type: "OFFICIAL_RESULT", url: "https://example.com/resultado" }]
    },
    consents: Object.fromEntries(mandatoryConsents.map(([type]) => [type, true])),
    meta: { ip: "127.0.0.1", userAgent: "test" }
  });
}

test("termo do responsável permite homologação sem atestado", () => {
  const created = registration({
    method: "GUARDIAN_COMMITMENT",
    guardianCpfConfirmation: "111.444.777-35",
    commitmentAccepted: true
  });
  const approved = circuit.updateCircuitSubmissionStatus({
    id: created.submissionId,
    status: "APPROVED",
    reason: "Resultado e termo do responsável conferidos.",
    actor: "admin:test"
  }) as Record<string, unknown>;
  assert.equal(approved.status, "APPROVED");
});

test("termo de responsabilidade exige o mesmo CPF do responsável", () => {
  assert.throws(
    () => registration({
      method: "GUARDIAN_COMMITMENT",
      guardianCpfConfirmation: "529.982.247-25",
      commitmentAccepted: true
    }),
    /mesmo CPF/
  );
});

test("termo de saúde e responsabilidade é obrigatório", () => {
  assert.throws(
    () => registration({
      method: "GUARDIAN_COMMITMENT",
      guardianCpfConfirmation: "111.444.777-35",
      commitmentAccepted: false
    }),
    /termo de saúde e responsabilidade/
  );
});

test("atestado médico não substitui o termo do responsável", () => {
  assert.throws(
    () => registration({
      method: "MEDICAL_CERTIFICATE",
      certificateFileId: privateFile("MEDICAL_CERTIFICATE"),
      guardianCpfConfirmation: "111.444.777-35"
    }),
    /termo de saúde e responsabilidade/
  );
});

test("ranking absoluto considera somente resultados homologados dentro da edição", () => {
  const ranking = circuit.listCircuitRanking({ categoryAge: 13 });
  const cbatResults = ranking.filter((item) => item.id.startsWith("cbat-2026-"));

  assert.equal(cbatResults.length, 9);
  assert.equal(new Set(cbatResults.map((item) => item.publicName)).size, 9);
  assert.equal(cbatResults.every((item) => item.activityDate >= "2026-08-01" && item.activityDate <= "2026-11-30"), true);
  assert.equal(circuit.listCircuitRanking({ includeOutsideEdition: true }).some((item) => item.activityDate < "2026-08-01"), true);
  assert.equal(cbatResults.find((item) => item.publicName === "Davi Henrique Alves da Silva")?.formattedTime, "02:56.38");
  assert.equal(cbatResults.find((item) => item.publicName === "Helena Rowe Fernandes"), undefined);
});

test("ranking inclui Bernardo dos Santos Mendonça na categoria calculada pela data de nascimento", () => {
  const category = categoryForBirthDate("2015-08-07", 2026);
  const [bernardo] = circuit.listCircuitRanking({ categoryAge: category.age, gender: "MALE", name: "Bernardo dos Santos Mendonça" });

  assert.equal(category.age, 11);
  assert.equal(bernardo?.formattedTime, "03:52.47");
  assert.equal(bernardo?.type, "OPEN_COURSE");
  assert.equal(bernardo?.city, "Suzano");
  assert.equal(bernardo?.state, "SP");
  assert.equal(bernardo?.activityDate, "2026-08-09");
});
