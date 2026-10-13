import assert from "node:assert/strict";
import test from "node:test";
import { circuitCategories, circuitCategoryForBirthDate, circuitRaceOptions, crossCountryBirthRange, crossCountryCategories, crossCountryCategoryForBirthDate, crossCountryRaces, crossCountryTerm, crossCountryFaq, isCrossRegistrationOpen } from "../src/lib/circuit-categories.ts";

test("períodos de nascimento publicados correspondem às categorias calculadas, inclusive nos limites do ano", () => {
  for (let age = 10; age <= 17; age++) {
    const year = 2026 - age;
    const category = `Sub ${age + 1}`;
    const published = crossCountryCategories.find((item) => item.category === category)!;
    assert.equal(published.birthRange, `De 01/01/${year} a 31/12/${year}`);
    for (const day of ["01-01", "12-31"]) assert.equal(crossCountryCategoryForBirthDate(`${year}-${day}`)?.category, category);
    assert.ok(crossCountryTerm.clauses.some((clause) => clause.includes(`${category}: ${published.birthRange}`)));
    assert.ok(crossCountryFaq.some((item) => item.answer.includes(`${category}: ${published.birthRange}`)));
  }
  assert.equal(crossCountryCategories[0].birthRange, "A partir de 01/01/2017");
  for (const birth of ["2017-01-01", "2017-12-31", "2018-01-01"]) assert.equal(crossCountryCategoryForBirthDate(birth)?.category, "Sub 10");
  assert.equal(crossCountryCategoryForBirthDate("2016-12-31")?.category, "Sub 11");
  assert.equal(crossCountryCategoryForBirthDate("2008-12-31"), undefined);
  assert.equal(crossCountryBirthRange(16, 17), "De 01/01/2009 a 31/12/2010");
  assert.equal(crossCountryBirthRange(10, 11), "De 01/01/2015 a 31/12/2016");
});

test("Cross Country usa cinco largadas e novas distâncias sem alterar o circuito de pista", () => {
  assert.deepEqual(crossCountryRaces.map((race) => race.time), ["08:00", "08:40", "09:00", "09:20", "09:35"]);
  for (let age = 0; age <= 17; age++) {
    const expected = age >= 16 ? "4.000 m" : age >= 14 ? "3.000 m" : age >= 12 ? "2.000 m" : "1.000 m";
    assert.deepEqual(crossCountryCategoryForBirthDate(`${2026 - age}-01-01`), {
      category: `Sub ${Math.max(10, age + 1)}`, age, distance: expected
    });
  }
  for (const invalid of ["", "2013-02-29", "2014-13-01", "2008-12-31", "2099-01-01"]) {
    assert.equal(crossCountryCategoryForBirthDate(invalid), undefined);
  }
  assert.equal(circuitCategoryForBirthDate("2013-01-01", 2027)?.distance, "2.000 m");
});

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

test("inscrições encerram ao fim de 12/11 no horário de São Paulo", () => {
  assert.equal(isCrossRegistrationOpen(Date.parse("2026-11-12T23:59:59.999-03:00")), true);
  assert.equal(isCrossRegistrationOpen(Date.parse("2026-11-13T00:00:00-03:00")), false);
});
