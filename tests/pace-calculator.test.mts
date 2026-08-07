import assert from "node:assert/strict";
import test from "node:test";
import { calculatePace, formatClock, parseClock, timeAtDistance } from "../src/lib/pace-calculator.ts";

test("calcula 5.000 m em 15 minutos com volta de 72 segundos", () => {
  const pace = calculatePace(5000, parseClock("15:00"));
  assert.equal(pace?.secondsPerKm, 180);
  assert.equal(formatClock(timeAtDistance(pace!.secondsPerKm, 400), true), "1:12.0");
  assert.equal(formatClock(timeAtDistance(pace!.secondsPerKm, 1000), true), "3:00.0");
});

test("converte ritmo por quilômetro em projeção de prova", () => {
  assert.equal(formatClock(timeAtDistance(parseClock("4:30"), 10000)), "45:00");
});
