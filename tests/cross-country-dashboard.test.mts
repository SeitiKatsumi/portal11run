import test from "node:test";
import assert from "node:assert/strict";
import { crossCountryDashboard } from "../src/lib/cross-country-dashboard.ts";

const registration = (city: string, state: string, category: string, gender: string, status = "Aceitas") => ({ city, state, category, pipeline_status: status, payload_json: JSON.stringify({ gender }) });

test("cross dashboard groups city spelling and UF variants without mixing states", () => {
  const result = crossCountryDashboard([
    registration(" Campinas ", "SP", "Sub 10", "Feminino"),
    registration("CAMPINAS-SP", "sp", "Sub 11", "Masculino"),
    registration("campinas-sp/SP", "SP", "Sub 11", "F"),
    registration("São José", "SC", "Sub 18", "M"),
    registration("Sao Jose / SC", "", "Sub 18", "Masculino"),
    registration("São José", "SP", "Sub 18", "Feminino", "Declinados")
  ]);
  assert.equal(result.total, 6);
  assert.equal(result.accepted, 5);
  assert.equal(result.cityCount, 3);
  assert.deepEqual(result.cities, [{ label: "Campinas/SP", count: 3 }, { label: "São José/SC", count: 2 }, { label: "São José/SP", count: 1 }]);
  assert.deepEqual(result.genders, [{ label: "Feminino", count: 3 }, { label: "Masculino", count: 3 }]);
  assert.deepEqual(result.categories.filter((item) => item.count), [{ label: "Sub 10", count: 1 }, { label: "Sub 11", count: 2 }, { label: "Sub 18", count: 3 }]);
});

test("cross dashboard preserves totals for missing, malformed and legacy data", () => {
  const result = crossCountryDashboard([
    { pipeline_status: "Em análise", payload_json: "broken" },
    { pipeline_status: "Aceitas", payload_json: "null" },
    { pipeline_status: "Aceitas", payload_json: JSON.stringify({ category: "sub14", gender: " feminino ", city: "Jundiaí", state: "SP" }) }
  ]);
  for (const groups of [result.categories, result.genders, result.cities]) assert.equal(groups.reduce((sum, item) => sum + item.count, 0), result.total);
  assert.equal(result.categories.find((item) => item.label === "Sub 14")?.count, 1);
  assert.equal(result.cities.find((item) => item.label === "Não informado")?.count, 2);
  assert.equal(result.cityCount, 1);
  const empty = crossCountryDashboard([]);
  assert.equal(empty.total, 0);
  assert.equal(empty.cityCount, 0);
  assert.equal(empty.categories.every((item) => item.count === 0), true);
});

test("cross dashboard treats state names and abbreviations as the same UF", () => {
  const result = crossCountryDashboard([
    registration("Campinas", "SP", "Sub 10", "Feminino"),
    registration(" Campinas ", " São Paulo ", "Sub 10", "Feminino"),
    registration("CAMPINAS", "SAO PAULO", "Sub 10", "Masculino"),
    registration("Apucarana", "Paraná", "Sub 12", "Masculino"),
    registration("Apucarana", "PR", "Sub 12", "Feminino")
  ]);
  assert.equal(result.cityCount, 2);
  assert.deepEqual(result.cities, [{ label: "Campinas/SP", count: 3 }, { label: "Apucarana/PR", count: 2 }]);
});
