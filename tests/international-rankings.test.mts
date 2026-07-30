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
import { parseAauRankingHtml } from "../src/lib/aau-ranking-provider.ts";
import { unifyUsaRankingResults } from "../src/lib/usa-unified-ranking-provider.ts";
import {
  buildBrazilRankingApiUrl,
  parseBrazilRankingResponse
} from "../src/lib/brazil-ranking-provider.ts";
import {
  buildWorldAthleticsRankingUrl,
  parseWorldAthleticsRankingHtml
} from "../src/lib/world-athletics-ranking-provider.ts";

test("monta filtros oficiais da Noruega por classe, prova e temporada", () => {
  const url = new URL(buildNorwayRankingUrl({ season: 2026, gender: "F", ageKey: "16", event: 1500 }));
  assert.equal(url.hostname, "www.minfriidrettsstatistikk.info");
  assert.equal(url.searchParams.get("showclass"), "18");
  assert.equal(url.searchParams.get("showevent"), "11");
  assert.equal(url.searchParams.get("showseason"), "2026");
});

test("inclui a classe norueguesa Sub-20 e os 5.000 m oficiais", () => {
  const male = new URL(buildNorwayRankingUrl({ season: 2026, gender: "M", ageKey: "18-19", event: 5000 }));
  const female = new URL(buildNorwayRankingUrl({ season: 2026, gender: "F", ageKey: "18-19", event: 5000 }));
  assert.equal(male.searchParams.get("showclass"), "9");
  assert.equal(female.searchParams.get("showclass"), "20");
  assert.equal(male.searchParams.get("showevent"), "14");
});

test("monta e interpreta o Top 100 oficial da CBAt", () => {
  const input = { season: 2026, gender: "M" as const, ageKey: "sub16" as const, event: 800 as const };
  const apiUrl = new URL(buildBrazilRankingApiUrl(input));
  assert.equal(apiUrl.hostname, "cbat.org.br");
  assert.equal(apiUrl.searchParams.get("perPage"), "100");
  assert.equal(apiUrl.searchParams.get("ano_minimo"), "2011");
  assert.equal(apiUrl.searchParams.get("ano_maximo"), "2013");
  assert.equal(apiUrl.searchParams.get("id_prova_principal"), "7");

  const parsed = parseBrazilRankingResponse({
    items: [{
      Atleta: 1,
      Sexo: "M",
      Nome: "Atleta Brasileiro",
      Nascimento: 2012,
      Nome_Ranking: "800 m",
      marcar_final: "02:05.43",
      Equipe: "Clube 11Run",
      UF: "SP",
      local: "São Paulo",
      data_hora: "2026-06-20T10:00:00",
      ranking: 1
    }],
    _meta: { total_count: 1 }
  }, "https://cbat.org.br/ranking", input);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].performance, "2:05.43");
  assert.equal(parsed.rows[0].regionName, "SP");
});

test("filtra Top Lists mundiais e juvenis por país sem usar pontos", () => {
  const kenyaUrl = new URL(buildWorldAthleticsRankingUrl({
    scope: "KE", season: 2026, gender: "M", ageKey: "u20", event: 1500
  }));
  assert.equal(kenyaUrl.hostname, "worldathletics.org");
  assert.equal(kenyaUrl.searchParams.get("regionType"), "countries");
  assert.equal(kenyaUrl.searchParams.get("region"), "KEN");
  assert.equal(kenyaUrl.searchParams.get("bestResultsOnly"), "true");

  const html = `<table><thead><tr>
    <th>Rank</th><th>Mark</th><th>WIND</th><th>Competitor</th><th>DOB</th><th></th>
    <th>Pos</th><th></th><th>Venue</th><th>Date</th><th>Results Score</th>
  </tr></thead><tbody><tr>
    <td>1</td><td>3:38.14</td><td></td><td>Lawi NGETICH</td><td>30 AUG 2008</td><td>KEN</td>
    <td>1</td><td></td><td>Nairobi (KEN)</td><td>23 MAY 2026</td><td>1132</td>
  </tr></tbody></table>`;
  const parsed = parseWorldAthleticsRankingHtml(html, kenyaUrl.toString(), {
    scope: "KE", season: 2026, gender: "M", ageKey: "u20", event: 1500
  });
  assert.equal(parsed.rows[0].performance, "3:38.14");
  assert.equal(parsed.rows[0].regionName, "KEN");
  assert.equal("points" in parsed.rows[0], false);
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
  assert.equal(usaCategoryAvailability("17-18", 1500).available, true);
  assert.equal(usaCategoryAvailability("17-18", 5000).available, false);
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

test("lê faixas AAU agrupadas e preserva a melhor marca oficial do atleta", () => {
  const html = `<pre>
Boys 1500 Meters 13 year old
===================================================================
    Name                    Year Team                    Finals  H#
===================================================================
  1 # 2669 Elliott Strandber  13 New England            4:27.23   2
  2 #  867 Elijah Lynn        13 Chester Chee           4:29.57   2
Boys 1500 Meters 13 year old
===================================================================
  1 # 2669 Elliott Strandber  13 New England            4:25.10
Boys 1500 Meters 14 year old
===================================================================
  1 # 3000 Outro Atleta       12 Clube Oficial          4:20.00
Girls 1500 Meters 13 year old
===================================================================
  1 # 4000 Atleta Feminina    13 Clube                  4:10.00
</pre>`;
  const parsed = parseAauRankingHtml(html, "https://image.aausports.org/results.htm", {
    season: 2026,
    gender: "M",
    ageKey: "13-14",
    event: 1500
  });

  assert.equal(parsed.rows.length, 3);
  assert.equal(parsed.rows[0].athleteName, "Outro Atleta");
  assert.equal(parsed.rows[1].athleteName, "Elliott Strandber");
  assert.equal(parsed.rows[1].performance, "4:25.10");
  assert.equal(parsed.rows[1].sourceKey, "aau-club-2026");
});

test("unifica fontes americanas, elimina duplicidade provável e limita em 100", () => {
  const sourceA = {
    sourceUrl: "https://example.com/a",
    ageLabel: "13–14 anos",
    rows: Array.from({ length: 75 }, (_, index) => ({
      position: index + 1,
      performance: `4:${String(index).padStart(2, "0")}.00`,
      performanceMilliseconds: 240_000 + index * 1_000,
      athleteName: `Atleta ${index}`,
      athleteAge: 13
    }))
  };
  const sourceB = {
    sourceUrl: "https://example.com/b",
    ageLabel: "13–14 anos",
    rows: [
      {
        position: 1,
        performance: "3:59.00",
        performanceMilliseconds: 239_000,
        athleteName: "Atleta 0",
        athleteAge: 13
      },
      ...Array.from({ length: 75 }, (_, index) => ({
        position: index + 2,
        performance: `5:${String(index).padStart(2, "0")}.00`,
        performanceMilliseconds: 300_000 + index * 1_000,
        athleteName: `Outro ${index}`,
        athleteAge: 14
      }))
    ]
  };
  const unified = unifyUsaRankingResults([sourceA, sourceB], {
    season: 2026,
    gender: "M",
    ageKey: "13-14",
    event: 1500
  });

  assert.equal(unified.rows.length, 100);
  assert.equal(unified.rows[0].athleteName, "Atleta 0");
  assert.equal(unified.rows[0].performance, "3:59.00");
  assert.equal(unified.rows.filter((row) => row.athleteName === "Atleta 0").length, 1);
});
