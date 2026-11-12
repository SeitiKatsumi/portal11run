import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const directory = path.join(tmpdir(), `11run-raffle-${randomUUID()}`);
mkdirSync(directory, { recursive: true });
process.env.SQLITE_PATH = path.join(directory, "test.sqlite");

const raffle = await import("../src/lib/raffle.ts");

test("cadastra prêmios em números únicos e aceita apenas uma participação", () => {
  const shirt = raffle.createRafflePrize({ name: "Camiseta", description: "Tamanho disponível no evento" });
  const cap = raffle.createRafflePrize({ name: "Boné" });
  assert.notEqual(shirt.winning_number, cap.winning_number);
  assert.ok(shirt.winning_number >= 1 && shirt.winning_number <= 1000);

  const winner = raffle.playRaffle(raffle.formatRaffleNumber(shirt.winning_number));
  assert.equal(winner.won, true);
  assert.equal(winner.prize?.name, "Camiseta");
  assert.throws(() => raffle.playRaffle(raffle.formatRaffleNumber(shirt.winning_number)), /já participou/i);

  const stats = raffle.getRaffleStats();
  assert.equal(stats.plays, 1);
  assert.equal(stats.prizes, 2);
  assert.equal(stats.claimed, 1);
});

test("não associa prêmio novo a número que já participou", () => {
  const occupied = new Set(raffle.listRafflePrizes().map((item) => item.winning_number));
  const losingNumber = Array.from({ length: 1000 }, (_, index) => index + 1).find((number) => !occupied.has(number));
  assert.ok(losingNumber);
  raffle.playRaffle(raffle.formatRaffleNumber(losingNumber!));
  const prize = raffle.createRafflePrize({ name: "Vale-presente" });
  assert.notEqual(prize.winning_number, losingNumber);
});

test("valida o formato de quatro dígitos", () => {
  assert.equal(raffle.parseRaffleNumber("0001"), 1);
  assert.equal(raffle.parseRaffleNumber("1000"), 1000);
  assert.throws(() => raffle.parseRaffleNumber("1"), /quatro dígitos/i);
  assert.throws(() => raffle.parseRaffleNumber("0000"), /entre 0001 e 1000/i);
});
