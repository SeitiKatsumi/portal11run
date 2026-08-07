"use client";

import { ArrowUpRight, Database, Search, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { federationSources, stateFederationResults, type StateFederationResult } from "@/lib/state-federation-results";
import styles from "@/app/referencias/ranking-japao/ranking-japao.module.css";

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

export function StateFederationResultsExplorer() {
  const [state, setState] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [event, setEvent] = useState(1000);
  const [athlete, setAthlete] = useState("");
  const [team, setTeam] = useState("");
  const [cbatResults, setCbatResults] = useState<StateFederationResult[]>([]);
  const [loadingCbat, setLoadingCbat] = useState(false);
  const [cbatError, setCbatError] = useState("");

  useEffect(() => {
    if (event === 1000) {
      setCbatResults([]);
      setCbatError("");
      return;
    }
    const controller = new AbortController();
    let active = true;
    const query = new URLSearchParams({
      country: "BR", season: "2026", gender, age: "sub16", event: String(event), limit: "100"
    });
    if (state) query.set("region", state);
    setLoadingCbat(true);
    setCbatError("");
    fetch(`/api/references/international-rankings?${query}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Não foi possível consultar a CBAt.");
        if (!active) return;
        setCbatResults(payload.results.map((row: {
          id: string; athlete_name: string; birth_date_original: string | null; athlete_age: number | null;
          team_name: string | null; performance: string; meet_name: string | null; meet_location: string | null;
          performance_date: string | null; region_name: string | null; source_url: string;
        }) => ({
          id: `cbat-${row.id}`,
          state: row.region_name ?? state,
          event: event as StateFederationResult["event"],
          gender,
          athlete: row.athlete_name,
          birthYear: Number(row.birth_date_original) || (row.athlete_age ? 2026 - row.athlete_age : 0),
          team: row.team_name ?? "Equipe não informada",
          performance: row.performance,
          competition: row.meet_name ?? "Ranking homologado CBAt",
          location: row.meet_location ?? row.region_name ?? "Brasil",
          date: row.performance_date ?? "2026-01-01",
          federation: "CBAt homologado",
          sourceUrl: row.source_url
        })));
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!active) return;
        setCbatResults([]);
        setCbatError(error instanceof Error ? error.message : "Não foi possível consultar a CBAt.");
      })
      .finally(() => { if (active) setLoadingCbat(false); });
    return () => { active = false; controller.abort(); };
  }, [event, gender, state]);

  const results = useMemo(() => [...stateFederationResults, ...cbatResults]
    .filter((row) => !state || row.state === state)
    .filter((row) => row.gender === gender && row.event === event)
    .filter((row) => !athlete || normalize(row.athlete).includes(normalize(athlete)))
    .filter((row) => !team || normalize(row.team).includes(normalize(team)))
    .filter((row, index, rows) => rows.findIndex((candidate) => normalize(candidate.athlete) === normalize(row.athlete) && candidate.performance === row.performance) === index)
    .sort((a, b) => a.performance.localeCompare(b.performance)), [athlete, cbatResults, event, gender, state, team]);
  const selectedSource = federationSources.find((item) => item.state === state);

  return <>
    <section className={styles.filters} aria-labelledby="state-results-filters">
      <div className={styles.filterHeading}><div><span className={styles.eyebrow}>Federações estaduais</span><h2 id="state-results-filters">Filtre os resultados oficiais</h2></div><span className={styles.liveBadge}><span /> 27 filiadas pesquisadas</span></div>
      <div className={styles.primaryFilters}>
        <label><span>Estado</span><select value={state} onChange={(e) => setState(e.target.value)}><option value="">Todos os estados</option>{federationSources.map((source) => <option key={source.state} value={source.state}>{source.state} · {source.acronym}</option>)}</select></label>
        <label><span>Gênero</span><select value={gender} onChange={(e) => setGender(e.target.value as "M" | "F")}><option value="M">Masculino</option><option value="F">Feminino</option></select></label>
        <label><span>Prova encontrada</span><select value={event} onChange={(e) => setEvent(Number(e.target.value))}><option value="800">800 m</option><option value="1000">1.000 m</option><option value="1500">1.500 m</option><option value="2000">2.000 m</option><option value="3000">3.000 m</option><option value="5000">5.000 m</option></select></label>
      </div>
      <div className={styles.secondaryFilters}><label><Search size={16}/><input value={athlete} onChange={(e) => setAthlete(e.target.value)} placeholder="Buscar atleta"/></label><label><Search size={16}/><input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Buscar clube ou equipe"/></label><button type="button" onClick={() => { setState(""); setGender("M"); setEvent(1000); setAthlete(""); setTeam(""); }}>Limpar</button></div>
    </section>
    <section className={styles.rankingPanel}>
      <div className={styles.rankingHeader}><div><span className={styles.eyebrow}>Temporada 2026 · fonte estadual</span><h2>{event.toLocaleString("pt-BR")} m · {gender === "M" ? "masculino" : "feminino"}{state ? ` · ${state}` : ""}</h2><p>{results.length} marcas oficiais encontradas nesta combinação</p></div></div>
      {loadingCbat ? <div className={styles.statusBar}><span>Consultando marcas homologadas na CBAt para complementar a federação estadual...</span></div> : null}
      {cbatError ? <div className={`${styles.statusBar} ${styles.statusError}`}><span>{cbatError}</span></div> : null}
      {state && selectedSource?.status !== "results" && !results.length && !loadingCbat ? <div className={styles.empty}><Database size={26}/><strong>Resultado completo ainda não localizado</strong><p>{selectedSource?.note} Também não foi encontrada marca homologada na CBAt para esta combinação.</p><a href={selectedSource?.url} target="_blank" rel="noopener noreferrer">Abrir fonte estadual <ArrowUpRight size={15}/></a></div> : null}
      {results.length ? <><div className={styles.desktopTable}><table><thead><tr><th>Pos.</th><th>Marca</th><th>Atleta</th><th>Nasc.</th><th>Clube / equipe</th><th>UF</th><th>Competição / local</th><th>Data</th><th>Fonte</th></tr></thead><tbody>{results.map((row, index) => <tr key={row.id}><td><span className={styles.position}>{index + 1}</span><small>Estadual</small></td><td><strong className={styles.performance}>{row.performance}</strong></td><td><span className={styles.officialName}>{row.athlete}</span></td><td>{row.birthYear}</td><td>{row.team}</td><td>{row.state}</td><td><span>{row.competition}</span><small>{row.location}</small></td><td>{formatDate(row.date)}</td><td><span className={styles.sourceBadge}>{row.federation}</span><div className={styles.proofs}><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir boletim ${row.federation}`}><ArrowUpRight size={16}/></a></div></td></tr>)}</tbody></table></div><div className={styles.mobileCards}>{results.map((row, index) => <article key={row.id}><header><span className={styles.position}>{index + 1}</span><strong className={styles.performance}>{row.performance}</strong><span>{row.federation}</span></header><div className={styles.mobileName}><strong>{row.athlete}</strong><span>{row.team}</span></div><dl><div><dt>Prova</dt><dd>{row.event.toLocaleString("pt-BR")} m</dd></div><div><dt>UF / nascimento</dt><dd>{row.state} · {row.birthYear}</dd></div><div><dt>Competição</dt><dd>{row.competition}</dd></div><div><dt>Local / data</dt><dd>{row.location}<small>{formatDate(row.date)}</small></dd></div></dl><footer className={styles.proofs}><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16}/> Abrir boletim oficial</a></footer></article>)}</div></> : state && selectedSource?.status === "results" ? <div className={styles.empty}><Database size={26}/><strong>Sem marca nesta combinação</strong><p>A federação publicou resultados, mas não há marca encontrada para os filtros escolhidos.</p></div> : null}
      <div className={styles.namePolicy}><ShieldCheck size={16}/><span>O boletim da federação estadual tem prioridade. Quando ele não está disponível ou é incompleto, a lista é complementada por marcas homologadas pela CBAt para a UF. Dados do Desafio Virtual 11Run não são usados.</span></div>
    </section>
  </>;
}
