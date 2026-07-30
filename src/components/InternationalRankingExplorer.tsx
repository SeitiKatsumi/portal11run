"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Database,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/app/referencias/ranking-japao/ranking-japao.module.css";

type Country = "BR" | "KE" | "NO" | "UG" | "US" | "WORLD";

type RankingResult = {
  id: string;
  position: number;
  display_position: number;
  performance: string;
  athlete_name: string;
  athlete_age: number | null;
  team_name: string | null;
  region_name: string | null;
  birth_date: string | null;
  birth_date_original: string | null;
  meet_name: string | null;
  meet_location: string | null;
  performance_date: string | null;
  performance_date_original: string | null;
  round_label: string | null;
  source_status: string | null;
  source_url: string;
  source_key: string;
};

type RankingResponse = {
  country: Country;
  season: number;
  count: number;
  config: { available: boolean; note: string | null };
  source: {
    name: string;
    authority: string;
    sourceUrl: string;
    supportingSources: Array<{ name: string; url: string }>;
  };
  sync: {
    id: string;
    status: string;
    message: string | null;
    created_at: string;
    started_at: string | null;
    completed_at: string | null;
  } | null;
  import: {
    id: string;
    source_url: string;
    source_updated_at: string | null;
    completed_at: string | null;
    record_count: number;
    round_label: string | null;
    status: string;
  } | null;
  results: RankingResult[];
  regions: Array<{ value: string }>;
  resultSources: Array<{
    key: string;
    shortName: string;
    name: string;
    organization: string;
    coverage: string;
    statusLabel: string;
    sourceUrl: string;
  }>;
};

const terminalJobs = new Set(["completed", "error"]);
const ages = {
  BR: [
    ["sub16", "Sub-16"],
    ["sub18", "Sub-18"]
  ],
  KE: [
    ["u18", "Sub-18"],
    ["u20", "Sub-20"]
  ],
  NO: [
    ["13", "13 anos"],
    ["14", "14 anos"],
    ["15", "15 anos"],
    ["16", "16 anos"],
    ["17", "17 anos"],
    ["18-19", "Sub-20 (18–19 anos)"]
  ],
  UG: [
    ["u18", "Sub-18"],
    ["u20", "Sub-20"]
  ],
  US: [
    ["8-under", "8 anos e abaixo"],
    ["9-10", "9–10 anos"],
    ["11-12", "11–12 anos"],
    ["13-14", "13–14 anos"],
    ["15-16", "15–16 anos"],
    ["17-18", "Sub-20 (17–18 anos)"]
  ],
  WORLD: [
    ["u18", "Sub-18"],
    ["u20", "Sub-20"],
    ["senior", "Adulto"]
  ]
} satisfies Record<Country, Array<[string, string]>>;

const events: Record<Country, number[]> = {
  BR: [800, 1500, 2000, 3000, 5000],
  KE: [800, 1500, 3000, 5000],
  NO: [800, 1500, 3000, 5000],
  UG: [800, 1500, 3000, 5000],
  US: [800, 1500, 3000],
  WORLD: [800, 1500, 3000, 5000, 10000]
};

function formatDate(value: string | null, fallback?: string | null) {
  if (!value) return fallback || "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function formatDateTime(value: string | null) {
  if (!value) return "Aguardando sincronização";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function medalClass(position: number) {
  if (position === 1) return styles.gold;
  if (position === 2) return styles.silver;
  if (position === 3) return styles.bronze;
  return "";
}

export function InternationalRankingExplorer({ country }: { country: Country }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const gender = params.get("genero") === "feminino" ? "F" : "M";
  const selectedAge = params.get("idade");
  const age = ages[country].some(([key]) => key === selectedAge) ? String(selectedAge) : ages[country][0][0];
  const parsedEvent = Number(params.get("prova"));
  const event = events[country].includes(parsedEvent) ? parsedEvent : 800;
  const [search, setSearch] = useState(params.get("busca") ?? "");
  const [team, setTeam] = useState(params.get("equipe") ?? "");
  const [region, setRegion] = useState(params.get("regiao") ?? "");
  const [resultSource, setResultSource] = useState(params.get("fonte") ?? "");
  const [data, setData] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [job, setJob] = useState<{ id: string; status: string; message: string } | null>(null);
  const emptyPolls = useRef(0);

  const updateUrl = useCallback((patch: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(patch).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [params, pathname, router]);

  const apiQuery = useMemo(() => {
    const query = new URLSearchParams({
      country,
      season: "2026",
      gender,
      age,
      event: String(event),
      limit: "100"
    });
    if (search.trim()) query.set("search", search.trim());
    if (team.trim()) query.set("team", team.trim());
    if (region) query.set("region", region);
    if (resultSource) query.set("source", resultSource);
    return query.toString();
  }, [age, country, event, gender, region, resultSource, search, team]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/references/international-rankings?${apiQuery}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível carregar o ranking.");
      setData(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o ranking.");
    } finally {
      setLoading(false);
    }
  }, [apiQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 180);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (
      !data?.config.available
      || data.import
      || data.sync?.status === "error"
      || data.sync?.status === "completed"
      || emptyPolls.current >= 10
    ) return;
    emptyPolls.current += 1;
    const timer = window.setTimeout(() => void load(true), 4000);
    return () => window.clearTimeout(timer);
  }, [data, load]);

  useEffect(() => {
    emptyPolls.current = 0;
    setRegion("");
    setResultSource("");
  }, [age, country, event, gender]);

  useEffect(() => {
    if (!job || !job.id || terminalJobs.has(job.status)) return;
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/references/international-rankings/jobs/${job.id}`);
      const payload = await response.json();
      if (response.ok) {
        setJob({ id: payload.id, status: payload.status, message: payload.message });
        if (terminalJobs.has(payload.status)) void load(true);
      }
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [job, load]);

  async function refresh() {
    setJob({ id: "", status: "queued", message: "Preparando a atualização..." });
    try {
      const response = await fetch("/api/references/international-rankings/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country, season: 2026, gender, age, event })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível atualizar.");
      setJob({ id: payload.jobId ?? "", status: payload.status, message: payload.message });
      if (payload.recent || payload.status === "completed") void load(true);
    } catch (refreshError) {
      setJob({
        id: "",
        status: "error",
        message: refreshError instanceof Error ? refreshError.message : "Não foi possível atualizar."
      });
    }
  }

  const ageLabel = ages[country].find(([key]) => key === age)?.[1] ?? age;
  const countryLabel = country === "BR" ? "Brasil"
    : country === "KE" ? "Quênia"
      : country === "NO" ? "Noruega"
        : country === "UG" ? "Uganda"
          : country === "US" ? "EUA"
            : "Mundial";
  const sourceState = data?.import?.status ?? (country === "US" ? "Competição em andamento" : "Ranking nacional");
  const showingEntryMarks = country === "US" && data?.import?.round_label === "Marcas de entrada";
  const firstSyncFailed = !data?.import && data?.sync?.status === "error";
  const firstSyncFinishedEmpty = !data?.import && data?.sync?.status === "completed";
  const isWorldAthletics = country === "KE" || country === "UG" || country === "WORLD";
  const sourceName = (key: string) => data?.resultSources.find((source) => source.key === key)?.shortName
    ?? (country === "BR" ? "CBAt"
      : country === "NO" ? "Min Friidrett"
        : country === "US" ? "Fonte oficial"
          : "World Athletics");

  return (
    <>
      <section className={styles.filters} aria-labelledby={`${country}-filters-title`}>
        <div className={styles.filterHeading}>
          <div>
            <span className={styles.eyebrow}>Consulta internacional</span>
            <h2 id={`${country}-filters-title`}>Escolha uma referência</h2>
          </div>
          <span className={styles.liveBadge}><span /> {
            country === "US" ? "Top 100 · fontes unificadas"
              : country === "BR" ? "Top 100 · CBAt oficial"
                : country === "KE" || country === "UG" || country === "WORLD" ? "Top 100 · World Athletics"
                  : "Fonte conectada"
          }</span>
        </div>

        <div className={styles.primaryFilters}>
          <label>
            <span>Gênero</span>
            <select value={gender} onChange={(e) => updateUrl({ genero: e.target.value === "F" ? "feminino" : "masculino" })}>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </label>
          <label>
            <span>Faixa etária</span>
            <select value={age} onChange={(e) => updateUrl({ idade: e.target.value })}>
              {ages[country].map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
          <label>
            <span>Prova</span>
            <select value={event} onChange={(e) => updateUrl({ prova: e.target.value })}>
              {events[country].map((value) => <option key={value} value={value}>{value.toLocaleString("pt-BR")} m</option>)}
            </select>
          </label>
        </div>

        <div className={styles.secondaryFilters}>
          <label><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar atleta" /></label>
          {!isWorldAthletics ? <label><Search size={16} /><input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Buscar clube ou equipe" /></label> : null}
          <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Filtrar por região">
            <option value="">{
              country === "BR" ? "Todos os estados"
                : country === "NO" ? "Todas as regiões"
                  : country === "US" ? "Todas as associações"
                    : "Todas as nacionalidades"
            }</option>
            {data?.regions.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
          </select>
          {country === "US" ? (
            <select value={resultSource} onChange={(e) => setResultSource(e.target.value)} aria-label="Filtrar por fonte oficial">
              <option value="">USATF + AAU</option>
              {data?.resultSources.map((source) => <option key={source.key} value={source.key}>{source.shortName}</option>)}
            </select>
          ) : null}
          <button type="button" onClick={() => {
            setSearch("");
            setTeam("");
            setRegion("");
            setResultSource("");
            updateUrl({ busca: "", equipe: "", regiao: "", fonte: "" });
          }}>Limpar</button>
        </div>
      </section>

      <section className={styles.rankingPanel}>
        <div className={styles.rankingHeader}>
          <div>
            <span className={styles.eyebrow}>Temporada 2026 · {data?.source.name ?? countryLabel}</span>
            <h2>{event.toLocaleString("pt-BR")} m · {gender === "M" ? "masculino" : "feminino"}, {ageLabel}</h2>
            <p>{data?.count ?? 0} melhores marcas exibidas · limite de 100 · {sourceState}</p>
          </div>
          <button className={styles.refreshButton} type="button" onClick={refresh} disabled={!data?.config.available || Boolean(job && !terminalJobs.has(job.status))}>
            {job && !terminalJobs.has(job.status) ? <LoaderCircle className={styles.spinning} size={17} /> : <RefreshCw size={17} />}
            Atualizar ranking
          </button>
        </div>

        {job ? <div className={`${styles.statusBar} ${job.status === "error" ? styles.statusError : ""}`}>
          {job.status === "error" ? <Clock3 size={17} /> : terminalJobs.has(job.status) ? <CheckCircle2 size={17} /> : <LoaderCircle className={styles.spinning} size={17} />}
          <span>{job.message}</span>
        </div> : null}
        {error ? <div className={`${styles.statusBar} ${styles.statusError}`}><span>{error}</span></div> : null}
        {!loading && country === "US" && data?.import ? (
          <div className={styles.coverageBar}>
            <CheckCircle2 size={17} />
            <span><strong>Ranking único:</strong> resultados USATF e AAU comparados pela marca, com duplicidades removidas e a origem preservada em cada linha.</span>
          </div>
        ) : null}
        {!loading && showingEntryMarks ? (
          <div className={styles.statusBar}>
            <Clock3 size={17} />
            <span><strong>Resultados ainda não publicados.</strong> Exibindo os inscritos ordenados pelas marcas de entrada oficiais. A tabela será atualizada automaticamente quando a prova terminar.</span>
          </div>
        ) : null}

        {loading ? <div className={styles.skeletons}>{Array.from({ length: 6 }).map((_, index) => <span key={index} />)}</div> : null}
        {!loading && data && !data.config.available ? (
          <div className={styles.unavailable}><ShieldCheck size={26} /><div><strong>Categoria não prevista na fonte</strong><p>{data.config.note}</p></div></div>
        ) : null}
        {!loading && data?.config.available && data.import && !data.results.length ? (
          <div className={styles.empty}><Database size={26} /><strong>Nenhuma marca publicada nesta combinação</strong><p>{data.import.status}. A 11Run continuará consultando a fonte sem criar resultados artificiais.</p></div>
        ) : null}
        {!loading && data?.config.available && firstSyncFailed ? (
          <div className={styles.empty}><Database size={26} /><strong>Fonte temporariamente indisponível</strong><p>{data.sync?.message ?? "Não foi possível concluir a consulta agora."} Use “Atualizar ranking” para tentar novamente.</p></div>
        ) : null}
        {!loading && data?.config.available && firstSyncFinishedEmpty ? (
          <div className={styles.empty}><Database size={26} /><strong>Lista oficial ainda não publicada</strong><p>A prova está prevista no programa, mas a fonte ainda não disponibilizou inscritos ou marcas. A 11Run continuará acompanhando.</p></div>
        ) : null}
        {!loading && data?.config.available && !data.import && !firstSyncFailed && !firstSyncFinishedEmpty ? (
          <div className={styles.empty}><LoaderCircle className={styles.spinning} size={26} /><strong>Primeira sincronização em andamento</strong><p>A fonte está sendo consultada. Os resultados aparecerão aqui automaticamente.</p></div>
        ) : null}

        {!loading && data?.results.length ? (
          <>
            <div className={styles.desktopTable}>
              <table>
                <thead><tr><th>Pos.</th><th>Marca</th><th>Atleta</th>{!isWorldAthletics ? <th>Clube / equipe</th> : null}{country === "US" ? <th>Federação</th> : null}<th>{country === "BR" ? "UF" : country === "NO" ? "Nascimento" : country === "US" ? "Associação" : "País"}</th><th>Competição / local</th><th>Fase / data</th><th>Comprovação</th></tr></thead>
                <tbody>{data.results.map((row) => (
                  <tr key={row.id}>
                    <td><span className={`${styles.position} ${medalClass(row.display_position)}`}>{row.display_position}</span><small>Top unificado</small></td>
                    <td><strong className={styles.performance}>{row.performance}</strong></td>
                    <td><span className={styles.officialName}>{row.athlete_name}</span>{row.athlete_age ? <small>{row.athlete_age} anos</small> : null}</td>
                    {!isWorldAthletics ? <td><span>{row.team_name ?? "—"}</span></td> : null}
                    {country === "US" ? <td><span className={styles.sourceBadge}>{sourceName(row.source_key)}</span><small>{row.source_status}</small></td> : null}
                    <td><span>{country === "NO" ? formatDate(row.birth_date, row.birth_date_original) : row.region_name ?? "—"}</span></td>
                    <td><span>{row.meet_name ?? "—"}</span><small>{row.meet_location}</small></td>
                    <td><span>{row.round_label ?? "Ranking"}</span><small>{formatDate(row.performance_date, row.performance_date_original)}</small></td>
                    <td><div className={styles.proofs}><a href={row.source_url} target="_blank" rel="noopener noreferrer" aria-label="Abrir fonte"><ArrowUpRight size={16} /></a></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {data.results.map((row) => (
                <article key={row.id}>
                  <header><span className={`${styles.position} ${medalClass(row.display_position)}`}>{row.display_position}</span><strong className={styles.performance}>{row.performance}</strong><span>{sourceName(row.source_key)}</span></header>
                  <div className={styles.mobileName}><strong>{row.athlete_name}</strong><span>{isWorldAthletics ? `World Athletics · ${row.region_name ?? "mundo"}` : row.team_name ?? "Sem equipe informada"}</span></div>
                  <dl>
                    <div><dt>Categoria</dt><dd>{ageLabel}{row.athlete_age ? ` · ${row.athlete_age} anos` : ""}</dd></div>
                    <div><dt>{country === "BR" ? "UF" : country === "NO" ? "Nascimento" : country === "US" ? "Associação" : "País"}</dt><dd>{country === "NO" ? formatDate(row.birth_date, row.birth_date_original) : row.region_name ?? "—"}</dd></div>
                    {country === "US" ? <div><dt>Fonte</dt><dd>{sourceName(row.source_key)}<small>{row.source_status}</small></dd></div> : null}
                    <div><dt>Competição</dt><dd>{row.meet_name ?? "—"}</dd></div>
                    <div><dt>Local / data</dt><dd>{row.meet_location ?? "—"}<small>{formatDate(row.performance_date, row.performance_date_original)}</small></dd></div>
                  </dl>
                  <footer className={styles.proofs}><a href={row.source_url} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16} /> Abrir fonte</a></footer>
                </article>
              ))}
            </div>
          </>
        ) : null}

        <div className={styles.namePolicy}>
          <ShieldCheck size={16} aria-hidden="true" />
          <span>{country === "US" ? "A posição 11Run reúne as melhores marcas oficiais disponíveis, mantém apenas o melhor resultado provável de cada atleta e limita a lista a 100 nomes. O documento de origem continua acessível em cada linha." : country === "BR" ? "A 11Run apresenta até as 100 melhores marcas publicadas pela CBAt para cada combinação. A categoria e a classificação oficial permanecem vinculadas à fonte original." : country === "KE" || country === "UG" || country === "WORLD" ? "A classificação considera somente o melhor tempo oficial de cada atleta na temporada. Pontos de resultado não entram na ordem exibida." : "Resultados e fases são preservados conforme a fonte. A posição 11Run apenas reorganiza marcas válidas para facilitar a comparação."}</span>
        </div>
        <footer className={styles.syncMeta}>
          <span>Status da fonte: <strong>{sourceState}</strong></span>
          <span>Sincronização 11Run: <strong>{formatDateTime(data?.import?.completed_at ?? null)}</strong></span>
        </footer>
      </section>
    </>
  );
}
