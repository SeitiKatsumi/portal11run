import assert from "node:assert/strict";
import test from "node:test";
import {
  buildNorwayRankingUrl,
  parseNorwayRankingHtml
} from "../src/lib/norway-ranking-provider.ts";
import { runningPerformanceToMilliseconds } from "../src/lib/international-ranking-core.ts";
import {
  selectUsaRankingRows,
  usaCategoryAvailability
} from "../src/lib/usa-ranking-provider.ts";

test("monta filtros oficiais da Noruega por classe, prova e temporada", () => {
  const url = new URL(buildNorwayRankingUrl({ season: 2026, gender: "F", ageKey: "16", event: 1500 }));
  assert.equal(url.hostname, "www.minfriidrettsstatistikk.info");
  assert.equal(url.searchParams.get("showclass"), "18");
  assert.equal(url.searchParams.get("showevent"), "11");
  assert.equal(url.searchParams.get("showseason"), "2026");
});

test("parser norueguês preserva atleta, clube, marca e competição", () => {
  const html = `<table>
    <tr><th>Resultat</th><th>Navn, Klubb</th><th>F.Dato</th><th>Plassering</th><th>Sted</th><th>R.Dato</th></tr>
    <tr>
      <td>2,04,16</td>
      <td><a href="./UtoverStatistikk.php?showathl=1">Maximilian Vårvik</a>, Romerike Friidrett</td>
      <td>03.04.13</td><td>1-h1</td>
      <td title="Stovnerbanen">Oslo, <a href="#">Sommerstevne 2026</a></td>
      <td>05.07.26</td>
    </tr>
  </table>`;
  const parsed = parseNorwayRankingHtml(html, "https://www.minfriidrettsstatistikk.info/php/LandsStatistikk.php", 2026, "13");
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].performance, "2:04.16");
  assert.equal(parsed.rows[0].athleteName, "Maximilian Vårvik");
  assert.equal(parsed.rows[0].teamName, "Romerike Friidrett");
  assert.equal(parsed.rows[0].meetName, "Sommerstevne 2026");
  assert.equal(parsed.rows[0].performanceDate, "2026-07-05");
});

test("normaliza marcas e respeita o programa etário da USATF", () => {
  assert.equal(runningPerformanceToMilliseconds("2:39.99"), 159_990);
  assert.equal(usaCategoryAvailability("8-under", 3000).available, false);
  assert.equal(usaCategoryAvailability("11-12", 3000).available, true);
  assert.equal(usaCategoryAvailability("9-10", 800).available, true);
});

test("usa marcas de entrada quando a prova americana ainda não publicou resultados", () => {
  const selected = selectUsaRankingRows(
    {
      Final: { statusFormatted: "Start List" },
      Prelim: { statusFormatted: "Start List", dayName: "Thursday", start_time: "9:40", am_pm: "AM" }
    },
    {
      Final: { results: [{ name: "Results" }] },
      Prelim: {
        results: [{
          name: "Results",
          results: [{ fname: "Sem", lname: "Resultado", mark: "NT" }]
        }]
      },
      performanceList: [
        { fname: "Atleta", lname: "B", mark: "4:12.20", teamName: "Clube B" },
        { fname: "Atleta", lname: "A", mark: "4:05.10", teamName: "Clube A" }
      ]
    }
  );

  assert.equal(selected.usesEntryMarks, true);
  assert.equal(selected.roundLabel, "Marcas de entrada");
  assert.equal(selected.sourceStatus, "Inscritos e marcas de entrada");
  assert.equal(selected.rows.length, 2);
  assert.equal(selected.rows[0].lname, "A");
});

test("prioriza resultados oficiais concluídos sobre marcas de entrada", () => {
  const selected = selectUsaRankingRows(
    { Final: { statusFormatted: "Done" } },
    {
      Final: {
        results: [{
          name: "Results",
          results: [
            { fname: "Segundo", lname: "Lugar", mark: "4:01.00", place: 2 },
            { fname: "Primeiro", lname: "Lugar", mark: "4:03.00", place: 1 }
          ]
        }]
      },
      performanceList: [{ fname: "Entrada", lname: "Mais rápida", mark: "3:59.00" }]
    }
  );

  assert.equal(selected.usesEntryMarks, false);
  assert.equal(selected.roundLabel, "Final");
  assert.equal(selected.sourceStatus, "Resultado final");
  assert.equal(selected.rows[0].fname, "Primeiro");
});
