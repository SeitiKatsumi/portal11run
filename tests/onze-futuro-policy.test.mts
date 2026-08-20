import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { ONZE_FUTURO_TERM_VERSION, onzeFuturoTerm, onzeFuturoTermSnapshot } from "../src/lib/onze-futuro-policy.ts";

test("mantém o termo versionado e determinístico para auditoria", () => {
  const first = onzeFuturoTermSnapshot();
  const second = onzeFuturoTermSnapshot();
  assert.equal(first, second);
  assert.match(ONZE_FUTURO_TERM_VERSION, /^\d+\.\d+-\d{4}-\d{2}-\d{2}$/);
  assert.equal(createHash("sha256").update(first).digest("hex").length, 64);
});

test("inclui as proteções essenciais sem exoneração absoluta", () => {
  const text = onzeFuturoTerm.clauses.join(" ").toLocaleLowerCase("pt-BR");
  assert.match(text, /não cria vínculo empregatício/);
  assert.match(text, /complementar o ecossistema esportivo/);
  assert.match(text, /solicitação não autorizada de dinheiro/);
  assert.match(text, /desligamento imediato/);
  assert.match(text, /pedidos de proteção/);
  assert.match(text, /não afasta os deveres legais próprios da 11run/);
});
