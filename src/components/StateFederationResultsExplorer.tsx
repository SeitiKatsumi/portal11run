"use client";

import { ArrowUpRight, Database, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { federationSources, stateFederationResults } from "@/lib/state-federation-results";
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

  const results = useMemo(() => stateFederationResults
    .filter((row) => !state || row.state === state)
    .filter((row) => row.gender === gender && row.event === event)
    .filter((row) => !athlete || normalize(row.athlete).includes(normalize(athlete)))
    .filter((row) => !team || normalize(row.team).includes(normalize(team)))
    .sort((a, b) => a.performance.localeCompare(b.performance)), [athlete, event, gender, state, team]);
  const selectedSource = federationSources.find((item) => item.state === state);

  return <>
    <section className={styles.filters} aria-labelledby="state-results-filters">
      <div className={styles.filterHeading}><div><span className={styles.eyebrow}>Federações estaduais</span><h2 id="state-results-filters">Filtre os resultados oficiais</h2></div><span className={styles.liveBadge}><span /> 27 filiadas pesquisadas</span></div>
      <div className={styles.primaryFilters}>
        <label><span>Estado</span><select value={state} onChange={(e) => setState(e.target.value)}><option value="">Todos os estados</option>{federationSources.map((source) => <option key={source.state} value={source.state}>{source.state} · {source.acronym}</option>)}</select></label>
        <label><span>Gênero</span><select value={gender} onChange={(e) => setGender(e.target.value as "M" | "F")}><option value="M">Masculino</option><option value="F">Feminino</option></select></label>
        <label><span>Prova encontrada</span><select value={event} onChange={(e) => setEvent(Number(e.target.value))}><option value="1000">1.000 m</option><option value="2000">2.000 m</option></select></label>
      </div>
      <div className={styles.secondaryFilters}><label><Search size={16}/><input value={athlete} onChange={(e) => setAthlete(e.target.value)} placeholder="Buscar atleta"/></label><label><Search size={16}/><input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Buscar clube ou equipe"/></label><button type="button" onClick={() => { setState(""); setGender("M"); setEvent(1000); setAthlete(""); setTeam(""); }}>Limpar</button></div>
    </section>
    <section className={styles.rankingPanel}>
      <div className={styles.rankingHeader}><div><span className={styles.eyebrow}>Temporada 2026 · fonte estadual</span><h2>{event.toLocaleString("pt-BR")} m · {gender === "M" ? "masculino" : "feminino"}{state ? ` · ${state}` : ""}</h2><p>{results.length} marcas oficiais encontradas nesta combinação</p></div></div>
      {state && selectedSource?.status !== "results" ? <div className={styles.empty}><Database size={26}/><strong>Resultado completo ainda não localizado</strong><p>{selectedSource?.note} A federação continuará identificada no monitoramento, sem uso de dados do Desafio Virtual ou preenchimento artificial.</p><a href={selectedSource?.url} target="_blank" rel="noopener noreferrer">Abrir fonte oficial <ArrowUpRight size={15}/></a></div> : null}
      {results.length ? <><div className={styles.desktopTable}><table><thead><tr><th>Pos.</th><th>Marca</th><th>Atleta</th><th>Nasc.</th><th>Clube / equipe</th><th>UF</th><th>Competição / local</th><th>Data</th><th>Fonte</th></tr></thead><tbody>{results.map((row, index) => <tr key={row.id}><td><span className={styles.position}>{index + 1}</span><small>Estadual</small></td><td><strong className={styles.performance}>{row.performance}</strong></td><td><span className={styles.officialName}>{row.athlete}</span></td><td>{row.birthYear}</td><td>{row.team}</td><td>{row.state}</td><td><span>{row.competition}</span><small>{row.location}</small></td><td>{formatDate(row.date)}</td><td><div className={styles.proofs}><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Abrir boletim ${row.federation}`}><ArrowUpRight size={16}/></a></div></td></tr>)}</tbody></table></div><div className={styles.mobileCards}>{results.map((row, index) => <article key={row.id}><header><span className={styles.position}>{index + 1}</span><strong className={styles.performance}>{row.performance}</strong><span>{row.federation}</span></header><div className={styles.mobileName}><strong>{row.athlete}</strong><span>{row.team}</span></div><dl><div><dt>Prova</dt><dd>{row.event.toLocaleString("pt-BR")} m</dd></div><div><dt>UF / nascimento</dt><dd>{row.state} · {row.birthYear}</dd></div><div><dt>Competição</dt><dd>{row.competition}</dd></div><div><dt>Local / data</dt><dd>{row.location}<small>{formatDate(row.date)}</small></dd></div></dl><footer className={styles.proofs}><a href={row.sourceUrl} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16}/> Abrir boletim oficial</a></footer></article>)}</div></> : state && selectedSource?.status === "results" ? <div className={styles.empty}><Database size={26}/><strong>Sem marca nesta combinação</strong><p>A federação publicou resultados, mas não há marca encontrada para os filtros escolhidos.</p></div> : null}
      <div className={styles.namePolicy}><ShieldCheck size={16}/><span>Somente boletins e páginas oficiais das federações estaduais entram nesta lista. Resultados nacionais da CBAt e marcas do Desafio Virtual 11Run não são usados.</span></div>
    </section>
  </>;
}
