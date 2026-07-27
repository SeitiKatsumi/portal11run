import assert from "node:assert/strict";
import test from "node:test";
import { buildMemberMarkChartData, parseMemberMarkTime } from "../src/lib/member-mark-chart.ts";

test("interpreta tempos antigos com centésimos separados por dois-pontos", () => {
  assert.equal(parseMemberMarkTime("3:45:90"), 225.9);
  assert.equal(parseMemberMarkTime("03:45.20"), 225.2);
  assert.equal(parseMemberMarkTime("3:49"), 229);
});

test("calcula a evolução apenas com as marcas recebidas pelo painel", () => {
  const chart = buildMemberMarkChartData(
    [
      { event: "1000m", time: "3:49", date: "2026-06-01" },
      { event: "1.000 m", time: "3:45:90", date: "2026-07-26" },
    ],
    new Date("2026-07-27T12:00:00-03:00"),
  );

  assert.deepEqual(chart.events, ["1000m"]);
  assert.equal(chart.data.find((row) => row.monthKey === "2026-06")?.["1000m"], 229);
  assert.equal(chart.data.find((row) => row.monthKey === "2026-07")?.["1000m"], 225.9);
});
