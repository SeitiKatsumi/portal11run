import assert from "node:assert/strict";
import test from "node:test";
import { circuitCategories, circuitCategoryForBirthDate, circuitRaceOptions } from "../src/lib/circuit-categories.ts";

test("categorias dos circuitos seguem idade no ano e distâncias do documento", () => {
  assert.equal(circuitCategories.length, 9);
  for (const year of [2026, 2027]) {
    for (const [index, item] of circuitCategories.entries()) {
      for (const monthDay of ["01-01", "12-31"]) {
        assert.deepEqual(circuitCategoryForBirthDate(`${year - item.age}-${monthDay}`, year), item);
      }
      assert.match(circuitRaceOptions[index], new RegExp(`^${item.category} -`));
    }
  }
  assert.equal(circuitCategoryForBirthDate("2013-02-29", 2026), undefined);
  assert.equal(circuitCategoryForBirthDate("2014-13-01", 2026), undefined);
  assert.equal(circuitCategoryForBirthDate("", 2026), undefined);
  assert.equal(circuitCategoryForBirthDate("2018-01-01", 2026), undefined);
  assert.equal(circuitCategoryForBirthDate("2008-12-31", 2026), undefined);
  assert.equal(circuitCategoryForBirthDate("2009-01-01", 2026)?.distance, "3.000 m");
  assert.equal(circuitCategoryForBirthDate("2012-01-01", 2026)?.distance, "2.000 m");
});
