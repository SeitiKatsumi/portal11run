import assert from "node:assert/strict";
import test from "node:test";
import { generatePixPayload } from "../src/lib/pix.ts";

function crc16(payload: string) {
  let crc = 0xffff;
  for (const byte of Buffer.from(payload, "utf8")) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

test("gera payload PIX estático com chave CNPJ, valor e CRC válido", () => {
  const payload = generatePixPayload({
    key: "45.791.917/0001-90",
    amountCents: 5000,
    merchantName: "ONZERUN",
    merchantCity: "ITATIBA",
    reference: "DOA20260724ABC123"
  });

  assert.match(payload, /^000201/);
  assert.ok(payload.includes("0014br.gov.bcb.pix"));
  assert.ok(payload.includes("011445791917000190"));
  assert.ok(payload.includes("540550.00"));
  assert.ok(payload.includes("5303986"));
  assert.ok(payload.includes("5802BR"));
  assert.equal(payload.slice(-4), crc16(payload.slice(0, -4)));
});

test("rejeita valor abaixo de R$ 1,00", () => {
  assert.throws(
    () =>
      generatePixPayload({
        key: "45.791.917/0001-90",
        amountCents: 99,
        merchantName: "ONZERUN",
        merchantCity: "ITATIBA",
        reference: "***"
      }),
    /mínima/
  );
});
