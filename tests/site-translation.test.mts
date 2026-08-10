import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAutomaticTranslationUrl,
  buildOriginalPortalUrl,
  detectSiteLanguage,
} from "../src/lib/site-translation.ts";

test("monta a tradução automática da página atual", () => {
  const translated = new URL(buildAutomaticTranslationUrl("https://11run.com.br/onze-futuro?tab=metodo", "ja"));
  assert.equal(translated.origin, "https://translate.google.com");
  assert.equal(translated.searchParams.get("sl"), "pt");
  assert.equal(translated.searchParams.get("tl"), "ja");
  assert.equal(translated.searchParams.get("u"), "https://11run.com.br/onze-futuro?tab=metodo");
});

test("recupera o endereço original sem parâmetros internos do tradutor", () => {
  const original = buildOriginalPortalUrl(
    "https://11run-com-br.translate.goog/referencias/ranking-brasil?categoria=sub-16&_x_tr_sl=pt&_x_tr_tl=es&_x_tr_hl=pt-BR#ranking",
    "https://11run.com.br",
  );
  assert.equal(original, "https://11run.com.br/referencias/ranking-brasil?categoria=sub-16#ranking");
});

test("identifica inglês, espanhol e japonês no endereço traduzido", () => {
  assert.equal(detectSiteLanguage("https://11run-com-br.translate.goog/?_x_tr_tl=en"), "en");
  assert.equal(detectSiteLanguage("https://11run-com-br.translate.goog/?_x_tr_tl=es"), "es");
  assert.equal(detectSiteLanguage("https://11run-com-br.translate.goog/?_x_tr_tl=ja"), "ja");
  assert.equal(detectSiteLanguage("https://11run.com.br/"), "pt");
});
