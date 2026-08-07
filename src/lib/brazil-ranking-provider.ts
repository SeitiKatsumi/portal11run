import {
  ageLabels,
  runningPerformanceToMilliseconds,
  type BrazilAgeKey,
  type InternationalEvent,
  type InternationalGender,
  type ParsedInternationalRanking
} from "./international-ranking-core.ts";

const CBAT_HOST = "cbat.org.br";
const CBAT_API_URL = "https://cbat.org.br/api/evento-resultado/ranking";
const USER_AGENT = "11RunInternationalReferences/1.0 (+https://11run.com.br/referencias/ranking-brasil)";

const eventIds: Partial<Record<InternationalEvent, number>> = {
  800: 7,
  1500: 11,
  2000: 15,
  3000: 17,
  5000: 19
};

const categoryYears: Record<BrazilAgeKey, { min: number; max: number; id: number }> = {
  sub16: { min: 2011, max: 2013, id: 5 },
  sub18: { min: 2009, max: 2011, id: 4 }
};

type CbatRankingRow = {
  Atleta: number;
  Sexo: string;
  Nome: string;
  Nascimento: number;
  Nome_Ranking: string;
  marcar_final: string;
  Equipe?: string | null;
  UF?: string | null;
  local?: string | null;
  data_hora?: string | null;
  ranking: number;
};

type CbatRankingResponse = {
  items?: CbatRankingRow[];
  _meta?: {
    total_count?: number;
  };
};

export type BrazilRankingInput = {
  season: number;
  gender: InternationalGender;
  ageKey: BrazilAgeKey;
  event: InternationalEvent;
  region?: string;
};

function displayPerformance(value: string) {
  const normalized = value.trim().replace(",", ".");
  return normalized.replace(/^0+(?=\d+:)/, "");
}

export function buildBrazilRankingApiUrl(input: BrazilRankingInput) {
  const category = categoryYears[input.ageKey];
  const eventId = eventIds[input.event];
  if (!eventId) throw new Error("Esta prova não integra as categorias brasileiras configuradas.");
  const url = new URL(CBAT_API_URL);
  url.searchParams.set("data_inicial", `${input.season}-01-01`);
  url.searchParams.set("data_final", `${input.season}-12-31`);
  url.searchParams.set("perPage", "100");
  url.searchParams.set("id_prova_principal", String(eventId));
  url.searchParams.set("vento", "0");
  url.searchParams.set("sort", "status,marcar_final");
  url.searchParams.set("expand", "prova");
  url.searchParams.set("ano_minimo", String(category.min));
  url.searchParams.set("ano_maximo", String(category.max));
  url.searchParams.set("sexo", input.gender.toLowerCase());
  url.searchParams.set("uflist", input.region ?? "");
  url.searchParams.set("page", "1");
  return url.toString();
}

export function buildBrazilRankingPageUrl(input: BrazilRankingInput) {
  const category = categoryYears[input.ageKey];
  const eventId = eventIds[input.event];
  if (!eventId) throw new Error("Esta prova não integra as categorias brasileiras configuradas.");
  const url = new URL("https://cbat.org.br/ranking");
  url.searchParams.set("ano", String(input.season));
  url.searchParams.set("ranking", "0");
  url.searchParams.set("categoria", `ano_minimo-${category.min}.ano_maximo-${category.max}.id-${category.id}`);
  url.searchParams.set("sexo", input.gender.toLowerCase());
  url.searchParams.set("tipo", "O");
  url.searchParams.set("prova", String(eventId));
  url.searchParams.set("vento", "0");
  if (input.region) url.searchParams.set("uflist", input.region);
  url.searchParams.set("gerar", "1");
  return url.toString();
}

export function parseBrazilRankingResponse(
  payload: CbatRankingResponse,
  sourceUrl: string,
  input: BrazilRankingInput
): ParsedInternationalRanking {
  const rows = (payload.items ?? [])
    .map((row) => {
      const performance = displayPerformance(row.marcar_final);
      return {
        position: Number(row.ranking),
        performance,
        performanceMilliseconds: runningPerformanceToMilliseconds(performance),
        athleteName: row.Nome.trim(),
        athleteAge: input.season - Number(row.Nascimento),
        teamName: row.Equipe?.trim() || undefined,
        regionName: row.UF?.trim() || undefined,
        birthDateOriginal: String(row.Nascimento),
        meetName: "Ranking Brasileiro CBAt",
        meetLocation: row.local?.trim() || undefined,
        performanceDate: row.data_hora?.slice(0, 10),
        roundLabel: "Melhor marca na temporada",
        sourceStatus: "Resultado oficial CBAt",
        sourceKey: "cbat-ranking-2026",
        sourceUrl
      };
    })
    .filter((row) => row.performanceMilliseconds !== undefined)
    .sort((a, b) => Number(a.performanceMilliseconds) - Number(b.performanceMilliseconds))
    .slice(0, 100)
    .map((row, index) => ({ ...row, position: index + 1 }));

  return {
    sourceUrl,
    sourceUpdatedAt: new Date().toISOString(),
    ageLabel: ageLabels[input.ageKey],
    roundLabel: "Top 100 CBAt",
    sourceStatus: `Ranking Brasileiro 2026 · ${payload._meta?.total_count ?? rows.length} marcas disponíveis`,
    rows
  };
}

async function fetchCbatJson(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || parsed.hostname !== CBAT_HOST) {
    throw new Error("Fonte CBAt fora da allowlist.");
  }
  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`A fonte oficial da CBAt respondeu com HTTP ${response.status}.`);
  return response.json() as Promise<CbatRankingResponse>;
}

export class BrazilRankingProvider {
  async fetchRanking(input: BrazilRankingInput): Promise<ParsedInternationalRanking> {
    if (input.season !== 2026) throw new Error("O ranking nacional configurado corresponde à temporada 2026.");
    const apiUrl = buildBrazilRankingApiUrl(input);
    const pageUrl = buildBrazilRankingPageUrl(input);
    const payload = await fetchCbatJson(apiUrl);
    return parseBrazilRankingResponse(payload, pageUrl, input);
  }
}
