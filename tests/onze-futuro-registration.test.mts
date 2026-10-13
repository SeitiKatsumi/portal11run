import assert from "node:assert/strict";
import test from "node:test";
import { isOnzeFuturoBirthDateEligible, onzeFuturoBirthDateLimits } from "../src/lib/onze-futuro-registration.ts";

const now = new Date("2026-10-13T15:00:00Z");

test("cadastro aceita a atleta de 05/03/2017 e os limites de 9 a 13 anos", () => {
  const { min, max } = onzeFuturoBirthDateLimits(now);
  assert.equal(min, "2012-10-14");
  assert.equal(max, "2017-10-13");
  for (const birth of ["2017-03-05", min, max]) assert.equal(isOnzeFuturoBirthDateEligible(birth, now), true);
  for (const birth of ["2012-10-13", "2017-10-14", "2026-10-13", "2017-02-30", "05/03/2017", ""]) {
    assert.equal(isOnzeFuturoBirthDateEligible(birth, now), false, birth);
  }
});

test("limites seguem o dia de São Paulo também na virada de UTC", () => {
  assert.deepEqual(onzeFuturoBirthDateLimits(new Date("2026-10-14T01:00:00Z")), onzeFuturoBirthDateLimits(now));
});

test("limites não pulam um dia no ano bissexto", () => {
  const leapDay = new Date("2028-02-29T15:00:00Z");
  const { min, max } = onzeFuturoBirthDateLimits(leapDay);
  assert.equal(min, "2014-03-01");
  assert.equal(max, "2019-02-28");
  assert.equal(isOnzeFuturoBirthDateEligible("2014-03-01", leapDay), true);
  assert.equal(isOnzeFuturoBirthDateEligible("2019-03-01", leapDay), false);
});
