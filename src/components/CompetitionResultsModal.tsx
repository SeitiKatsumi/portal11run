"use client";

import { Loader2, Radio, RefreshCw, Trophy, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./CompetitionResultsModal.module.css";

type Race = { id: string; title: string; categories: string[]; status: string };
type Result = { id: string; raceId: string; raceTitle: string; position: number | null; bib: string; name: string; city: string; category: string; gender: string; formattedTime: string; status: string; provisional: boolean };
type Payload = { competition: { title: string }; races: Race[]; results: Result[]; live: boolean; updatedAt: string };

export function CompetitionResultsModal({ slug, className = "" }: { slug: string; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [race, setRace] = useState("all");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/competitions/${encodeURIComponent(slug)}/results`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível carregar os resultados.");
      setData(json); setError("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível atualizar os resultados."); }
    finally { setLoading(false); }
  }, [slug]);

  useEffect(() => {
    if (!open) return;
    setLoading(true); load();
    const interval = window.setInterval(() => { if (!document.hidden) load(); }, data?.live ? 2000 : 10000);
    return () => window.clearInterval(interval);
  }, [data?.live, load, open]);

  const categories = useMemo(() => [...new Set((data?.results ?? []).map((item) => item.category))].sort((a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""))), [data]);
  const visible = useMemo(() => (data?.results ?? []).filter((item) => (race === "all" || item.raceId === race) && (category === "all" || item.category === category) && (gender === "all" || item.gender === gender)), [category, data, gender, race]);
  const groups = useMemo(() => {
    const map = new Map<string, Result[]>();
    for (const item of visible) {
      const key = `${item.raceTitle} · ${item.category} · ${item.gender}`;
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [visible]);

  function show() { setOpen(true); dialog.current?.showModal(); }
  function close() { setOpen(false); dialog.current?.close(); }

  return <>
    <button type="button" className={`${styles.trigger} ${className}`} onClick={show}><span><Trophy size={18} />Resultados</span><span>{data?.live ? <><i className={styles.liveDot} />Ao vivo</> : "Classificação"}</span></button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="competition-results-title" onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className={styles.modal}>
        <header className={styles.header}><div><span className="eyebrow">classificação por categoria e gênero</span><h2 id="competition-results-title">Resultados</h2><p>{data?.competition.title ?? "Circuito de Cross Country IVCL 11RUN"}</p></div><button className={styles.close} type="button" onClick={close} aria-label="Fechar resultados"><X /></button></header>
        <div className={styles.toolbar}>
          <label>Bateria<select value={race} onChange={(event) => setRace(event.target.value)}><option value="all">Todas as baterias</option>{data?.races.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
          <label>Categoria<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">Todas</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Gênero<select value={gender} onChange={(event) => setGender(event.target.value)}><option value="all">Todos</option><option>Feminino</option><option>Masculino</option></select></label>
          <span className={styles.connection} data-live={data?.live}>{data?.live ? <><Radio size={15} />Ao vivo · provisório</> : <><RefreshCw size={15} />Atualização automática</>}</span>
        </div>
        <div className={styles.content} role="region" aria-live="polite" aria-label="Classificação da competição">
          {loading && !data ? <div className={styles.loader}><Loader2 className="spin" />Carregando resultados…</div> : null}
          {error ? <p className={styles.empty} role="alert">{error}</p> : null}
          {!loading && !error && !groups.length ? <p className={styles.empty}>Os resultados aparecerão aqui automaticamente após a primeira chegada registrada.</p> : null}
          {groups.map(([title, results]) => <section className={styles.group} key={title}><h3>{title}</h3><table className={styles.table}><thead><tr><th>Pos.</th><th>Nº</th><th>Atleta</th><th>Tempo</th><th>Estado</th></tr></thead><tbody>{results.map((result) => <tr key={result.id}><td className={styles.position}><span>{result.position && result.position <= 3 ? <Trophy size={16} /> : null}{result.position ? `${result.position}º` : "—"}</span></td><td className={styles.bib}>{result.bib}</td><td><strong>{result.name}</strong><br /><small>{result.city}</small></td><td className={styles.time}>{result.formattedTime}</td><td><span className={styles.status}>{result.provisional ? "Ao vivo · provisório" : "Resultado homologado"}</span></td></tr>)}</tbody></table></section>)}
          {data ? <p className={styles.footerNote}>Última atualização: {new Date(data.updatedAt).toLocaleTimeString("pt-BR")} · Em caso de reconexão, as leituras pendentes sobem automaticamente.</p> : null}
        </div>
      </div>
    </dialog>
  </>;
}
