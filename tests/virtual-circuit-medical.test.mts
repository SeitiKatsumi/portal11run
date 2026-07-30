import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

process.env.SQLITE_PATH = path.join(tmpdir(), `11run-medical-${randomUUID()}.sqlite`);
process.env.VIRTUAL_CIRCUIT_DATA_KEY = "test-only-medical-clearance-key";

const circuit = await import("../src/lib/virtual-circuit.ts");
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
