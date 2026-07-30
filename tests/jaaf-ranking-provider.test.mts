import assert from "node:assert/strict";
import test from "node:test";
import {
  buildJaafRankingUrl,
  parseJaafRankingHtml
} from "../src/lib/jaaf-ranking-provider.ts";
import {
  jaafDateToIso,
  japanSchoolLevel,
  performanceToMilliseconds,
  referenceAgeToSchoolYear
} from "../src/lib/japan-ranking-core.ts";

test("monta somente URLs oficiais da JAAF", () => {
  const url = buildJaafRankingUrl({
    baseUrl: "https://www.jaaf.or.jp/remote/juniorhighschool/2026/ranking/",
    season: 2026,
    event: 800,
    eventId: 104,
    typeId: 1,
    gender: "M",
    schoolYear: 1
  });
  assert.match(url, /event_id=104/);
  assert.match(url, /school_year=1/);
  assert.throws(() => buildJaafRankingUrl({
    baseUrl: "https://example.com/ranking/",
    season: 2026,
    event: 800,
    eventId: 104,
    typeId: 1,
    gender: "M",
    schoolYear: 1
  }), /allowlist/);
});

test("normaliza marca e data japonesas", () => {
  assert.equal(performanceToMilliseconds("2:05.59"), 125_590);
  assert.equal(performanceToMilliseconds("59.42"), 59_420);
  assert.equal(jaafDateToIso("6月20日", 2026), "2026-06-20");
});

test("converte o colegial japonês até a referência Sub-20", () => {
  assert.equal(japanSchoolLevel(14), "junior");
  assert.equal(japanSchoolLevel(17), "high");
  assert.equal(referenceAgeToSchoolYear(15), 1);
  assert.equal(referenceAgeToSchoolYear(17), 3);
  const url = buildJaafRankingUrl({
    baseUrl: "https://www.jaaf.or.jp/remote/highschool/2026/ranking/",
    season: 2026,
    event: 5000,
    eventId: 106,
    typeId: 1,
    gender: "M",
    schoolYear: 3
  });
  assert.match(url, /highschool/);
  assert.match(url, /event_id=106/);
});

test("parser identifica colunas pelo cabeçalho e preserva o japonês", () => {
  const html = `
    <html><body><p>2026年7月6日更新</p>
    <table><tr>
      <th>順位</th><th>ポイント</th><th>記録</th><th>氏名</th><th>都道府県</th>
      <th>学校/クラブ</th><th>学年</th><th>競技日</th><th>記録証</th><th>参加<br>認定証</th>
    </tr><tr>
      <td>378</td><td>630.0</td><td>2:05.59</td><td>染谷駿斗</td><td>千葉</td>
      <td>常盤平</td><td>1年</td><td>6月20日</td>
      <td><a class="popup-modal" href="#kirokusho_104_10729680">jpg</a></td>
      <td><a href="/remote/juniorhighschool/2026/ranking/?record_view=104_10729680&filetype=pdf">pdf</a></td>
    </tr></table></body></html>`;
  const parsed = parseJaafRankingHtml(
    html,
    "https://www.jaaf.or.jp/remote/juniorhighschool/2026/ranking/?event_id=104",
    2026,
    1
  );
  assert.equal(parsed.sourceUpdatedAt, "2026年7月6日");
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].athleteNameJapanese, "染谷駿斗");
  assert.equal(parsed.rows[0].teamJapanese, "常盤平");
  assert.equal(parsed.rows[0].performanceDate, "2026-06-20");
  assert.match(parsed.rows[0].proofPdfUrl ?? "", /^https:\/\/www\.jaaf\.or\.jp/);
});
