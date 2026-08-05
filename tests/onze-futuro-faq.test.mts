import assert from "node:assert/strict";
import test from "node:test";
import { onzeFuturoFaqGroups, onzeFuturoFaqItems } from "../src/lib/onze-futuro-faq.ts";

test("a super FAQ cobre todos os módulos gamificados do painel", () => {
  const content = JSON.stringify(onzeFuturoFaqGroups);

  for (const moduleName of [
    "Desafio Escolar",
    "Desafio de Assiduidade",
    "Minha Evolução",
    "Ideias para o Projeto",
    "Score 11RUN",
    "Benefício Projetado"
  ]) {
    assert.match(content, new RegExp(moduleName));
  }
});

test("a FAQ explica ciclo, desligamento bilateral e proteção da criança", () => {
  const content = JSON.stringify(onzeFuturoFaqItems);

  assert.match(content, /2026 a 2029/);
  assert.match(content, /tanto a família ou o responsável quanto a 11RUN podem solicitar a desvinculação a qualquer tempo/i);
  assert.match(content, /melhor interesse da criança/i);
  assert.match(content, /questões familiares de qualquer natureza/i);
  assert.match(content, /resultado isolado/i);
});

test("a FAQ atende toda a rede de cuidado e os temas legais essenciais", () => {
  const content = JSON.stringify(onzeFuturoFaqGroups);

  for (const term of [
    "pais ou responsáveis",
    "treinador",
    "escola",
    "médicos",
    "psicólogos",
    "Política de Privacidade",
    "revisão humana"
  ]) {
    assert.match(content, new RegExp(term, "i"));
  }

  assert.ok(onzeFuturoFaqItems.length >= 35, "a FAQ deve permanecer realmente abrangente");
});
