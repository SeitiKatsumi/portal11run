import assert from "node:assert/strict";
import test from "node:test";
import { resolveCheckoutSiteUrl } from "../src/lib/site-url.ts";

test("usa o domínio público configurado no retorno do checkout", () => {
  assert.equal(
    resolveCheckoutSiteUrl({
      configuredUrl: "https://11run.com.br/",
      requestUrl: "http://0.0.0.0:80/api/store/checkout",
      nodeEnv: "production"
    }),
    "https://11run.com.br"
  );
});

test("impede endereços internos no retorno do checkout em produção", () => {
  assert.equal(
    resolveCheckoutSiteUrl({
      configuredUrl: "https://0.0.0.0:80",
      requestUrl: "http://127.0.0.1:80/api/store/checkout",
      nodeEnv: "production"
    }),
    "https://11run.com.br"
  );
});

test("preserva a origem local durante o desenvolvimento", () => {
  assert.equal(
    resolveCheckoutSiteUrl({
      requestUrl: "http://127.0.0.1:3000/api/store/checkout",
      nodeEnv: "development"
    }),
    "http://127.0.0.1:3000"
  );
});
