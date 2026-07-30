"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  FileImage,
  FileText,
  Globe2,
  Languages,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/app/referencias/ranking-japao/ranking-japao.module.css";

type RankingResult = {
  id: string;
  position: number;
  display_position: number;
  points: number | null;
  performance: string;
  athlete_name_japanese: string;
  athlete_name_display: string | null;
  prefecture_japanese: string | null;
  prefecture_portuguese: string | null;
  team_japanese: string | null;
  team_name_display: string | null;
  reference_age: number;
  school_year: number;
  performance_date: string | null;
  performance_date_original: string | null;
  proof_image_url: string | null;
  proof_pdf_url: string | null;
  source_url: string;
};

type RankingResponse = {
  season: number;
  count: number;
  config: { available: boolean; eventId: number | null; note: string | null };
  import: {
    id: string;
    source_url: string;
    source_updated_at: string | null;
    completed_at: string | null;
    record_count: number;
  } | null;
  results: RankingResult[];
  prefectures: Array<{ value: string }>;
};

const ageLabels: Record<number, string> = {
  12: "12 anos — 1年 / Ichi-nensei",
  13: "13 anos — 2年 / Ni-nensei",
  14: "14 anos — 3年 / San-nensei"
};

const terminalJobs = new Set(["completed", "unchanged", "error"]);

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`));
}

function formatDateTime(value: string | null) {
  if (!value) return "Ainda não sincronizado";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function medalClass(position: number) {
  if (position === 1) return styles.gold;
  if (position === 2) return styles.silver;
  if (position === 3) return styles.bronze;
  return "";
}

function isLatinText(value: string | null) {
  return Boolean(value && !/[\u3040-\u30ff\u3400-\u9fff]/u.test(value));
}

function officialNamePresentation(displayName: string | null, originalName: string | null) {
  const original = originalName?.trim() || "—";
  if (displayName?.trim()) {
    return { primary: displayName.trim(), secondary: original, reviewed: true };
  }
  if (isLatinText(original)) {
    return { primary: original, secondary: "", reviewed: true };
  }
  return { primary: original, secondary: "Nome oficial · leitura em revisão", reviewed: false };
}

export function JapanRankingExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const gender = params.get("genero") === "feminino" ? "F" : "M";
  const parsedAge = Number(params.get("idade"));
  const age = [12, 13, 14].includes(parsedAge) ? parsedAge : 12;
  const parsedEvent = Number(params.get("prova"));
  const event = [800, 1500, 3000].includes(parsedEvent) ? parsedEvent : 800;
  const [search, setSearch] = useState(params.get("busca") ?? "");
  const [team, setTeam] = useState(params.get("equipe") ?? "");
  const [prefecture, setPrefecture] = useState(params.get("prefeitura") ?? "");
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
      season: "2026",
      gender,
      age: String(age),
      event: String(event),
      limit: "100"
    });
    if (search.trim()) query.set("search", search.trim());
    if (team.trim()) query.set("team", team.trim());
    if (prefecture) query.set("prefecture", prefecture);
    return query.toString();
  }, [age, event, gender, prefecture, search, team]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/references/japan-rankings?${apiQuery}`);
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
    const timer = window.setTimeout(() => void load(), 220);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!data?.config.available || data.import || emptyPolls.current >= 8) return;
    emptyPolls.current += 1;
    const timer = window.setTimeout(() => void load(true), 5000);
    return () => window.clearTimeout(timer);
  }, [data, load]);

  useEffect(() => {
    emptyPolls.current = 0;
  }, [age, event, gender]);

  useEffect(() => {
    if (!job || terminalJobs.has(job.status)) return;
    const timer = window.setTimeout(async () => {
      const response = await fetch(`/api/references/japan-rankings/jobs/${job.id}`);
      const payload = await response.json();
      if (response.ok) {
        setJob({ id: payload.id, status: payload.status, message: payload.message });
        if (terminalJobs.has(payload.status)) void load(true);
      }
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [job, load]);

  const refresh = async () => {
    setJob({ id: "", status: "queued", message: "Preparando a atualização..." });
    try {
      const response = await fetch("/api/references/japan-rankings/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season: 2026, gender, age, event })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Não foi possível atualizar.");
      setJob({ id: payload.jobId, status: payload.status, message: payload.message });
    } catch (refreshError) {
      setJob({ id: "", status: "error", message: refreshError instanceof Error ? refreshError.message : "Não foi possível atualizar." });
    }
  };

  const clearComplementary = () => {
    setSearch("");
    setTeam("");
    setPrefecture("");
    updateUrl({ busca: "", equipe: "", prefeitura: "" });
  };

  return (
    <>
      <section className={styles.filters} aria-labelledby="ranking-filters-title">
        <div className={styles.filterHeading}>
          <div>
            <span className={styles.eyebrow}>Consulta internacional</span>
            <h2 id="ranking-filters-title">Escolha uma referência</h2>
          </div>
          <span className={styles.liveBadge}><span /> Fonte oficial conectada</span>
        </div>

        <div className={styles.primaryFilters}>
          <label>
            <span>Gênero</span>
            <select value={gender} onChange={(e) => updateUrl({ genero: e.target.value === "F" ? "feminino" : "masculino" })}>
              <option value="M">Meninos</option>
              <option value="F">Meninas</option>
            </select>
          </label>
          <label>
            <span>Idade de referência</span>
            <select value={age} onChange={(e) => updateUrl({ idade: e.target.value })}>
              {[12, 13, 14].map((value) => <option key={value} value={value}>{ageLabels[value]}</option>)}
            </select>
          </label>
          <label>
            <span>Prova</span>
            <select value={event} onChange={(e) => updateUrl({ prova: e.target.value })}>
              <option value={800}>800 m</option>
              <option value={1500}>1.500 m</option>
              <option value={3000}>3.000 m</option>
            </select>
          </label>
        </div>

        <div className={styles.secondaryFilters}>
          <label>
            <Search size={16} aria-hidden="true" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar atleta" aria-label="Buscar atleta" />
          </label>
          <label>
            <Search size={16} aria-hidden="true" />
            <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Buscar escola ou clube" aria-label="Buscar escola ou clube" />
          </label>
          <select value={prefecture} onChange={(e) => setPrefecture(e.target.value)} aria-label="Filtrar por prefeitura japonesa">
            <option value="">Todas as prefeituras</option>
            {data?.prefectures.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
          </select>
          <button type="button" onClick={clearComplementary}>Limpar filtros</button>
        </div>
      </section>

      <section className={styles.rankingPanel} aria-live="polite">
        <header className={styles.rankingHeader}>
          <div>
            <span className={styles.eyebrow}>Temporada 2026 · JAAF</span>
            <h2>Ranking japonês — {event.toLocaleString("pt-BR")} m {gender === "M" ? "masculino" : "feminino"}, {age} anos</h2>
            <p>
              {data?.import ? `${data.count} resultados exibidos` : "Aguardando primeira sincronização"}
              <span aria-hidden="true"> · </span>
              {ageLabels[age]}
            </p>
          </div>
          <button className={styles.refreshButton} type="button" onClick={refresh}
            disabled={!data?.config.available || Boolean(job && !terminalJobs.has(job.status))}>
            {job && !terminalJobs.has(job.status) ? <LoaderCircle className={styles.spinning} size={17} /> : <RefreshCw size={17} />}
            {job && !terminalJobs.has(job.status) ? "Atualizando..." : "Atualizar ranking"}
          </button>
        </header>

        {job ? (
          <div className={`${styles.statusBar} ${job.status === "error" ? styles.statusError : ""}`}>
            {terminalJobs.has(job.status) && job.status !== "error" ? <CheckCircle2 size={17} /> : job.status === "error" ? <ShieldCheck size={17} /> : <LoaderCircle className={styles.spinning} size={17} />}
            <span>{job.message}</span>
          </div>
        ) : null}

        {data && !data.config.available ? (
          <div className={styles.unavailable}>
            <Globe2 size={28} />
            <div>
              <strong>Categoria não publicada na fonte oficial</strong>
              <p>{data.config.note}</p>
            </div>
          </div>
        ) : loading ? (
          <div className={styles.skeletons}>{Array.from({ length: 6 }, (_, i) => <span key={i} />)}</div>
        ) : error ? (
          <div className={styles.unavailable}><ShieldCheck size={28} /><div><strong>Fonte temporariamente indisponível</strong><p>{error} O último ranking validado continuará preservado.</p></div></div>
        ) : !data?.results.length ? (
          <div className={styles.empty}>
            <Sparkles size={30} />
            <strong>{data?.import ? "Nenhum resultado foi encontrado para os filtros selecionados." : "Nossa tecnologia está preparando este ranking em português."}</strong>
            <p>{data?.import ? "Remova os filtros complementares para ampliar a busca." : "A primeira sincronização segura pode levar alguns instantes. Esta tela se atualiza automaticamente."}</p>
          </div>
        ) : (
          <>
            <div className={styles.desktopTable}>
              <table>
                <thead><tr><th>Pos.</th><th>Marca</th><th>Atleta</th><th>Prefeitura</th><th>Escola / Clube</th><th>Referência</th><th>Data</th><th>Pontos</th><th>Comprovação</th></tr></thead>
                <tbody>
                  {data.results.map((row) => {
                    const athlete = officialNamePresentation(row.athlete_name_display, row.athlete_name_japanese);
                    const teamName = officialNamePresentation(row.team_name_display, row.team_japanese);
                    return (
                    <tr key={row.id}>
                      <td><span className={`${styles.position} ${medalClass(row.display_position)}`}>{row.display_position}</span><small>JAAF #{row.position}</small></td>
                      <td><strong className={styles.performance}>{row.performance}</strong></td>
                      <td>
                        <span className={styles.officialName} lang={athlete.reviewed ? undefined : "ja"}>{athlete.primary}</span>
                        {athlete.secondary ? <small className={athlete.reviewed ? "" : styles.reviewStatus} lang={athlete.reviewed ? "ja" : undefined}>{athlete.secondary}</small> : null}
                      </td>
                      <td><span>{row.prefecture_portuguese ?? row.prefecture_japanese ?? "—"}</span>{row.prefecture_portuguese ? <small lang="ja">{row.prefecture_japanese}</small> : null}</td>
                      <td>
                        <span className={styles.officialName} lang={teamName.reviewed ? undefined : "ja"}>{teamName.primary}</span>
                        {teamName.secondary ? <small className={teamName.reviewed ? "" : styles.reviewStatus} lang={teamName.reviewed ? "ja" : undefined}>{teamName.secondary}</small> : null}
                      </td>
                      <td><span>{row.reference_age} anos</span><small lang="ja">{row.school_year}年</small></td>
                      <td><span>{formatDate(row.performance_date)}</span><small lang="ja">{row.performance_date_original}</small></td>
                      <td>{row.points ?? "—"}</td>
                      <td><div className={styles.proofs}>{row.proof_image_url ? <a href={row.proof_image_url} target="_blank" rel="noopener noreferrer" aria-label="Ver imagem na JAAF"><FileImage size={16} /></a> : null}{row.proof_pdf_url ? <a href={row.proof_pdf_url} target="_blank" rel="noopener noreferrer" aria-label="Ver PDF na JAAF"><FileText size={16} /></a> : null}<a href={row.source_url} target="_blank" rel="noopener noreferrer" aria-label="Abrir fonte oficial"><ArrowUpRight size={16} /></a></div></td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileCards}>
              {data.results.map((row) => {
                const athlete = officialNamePresentation(row.athlete_name_display, row.athlete_name_japanese);
                const teamName = officialNamePresentation(row.team_name_display, row.team_japanese);
                return (
                <article key={row.id}>
                  <header><span className={`${styles.position} ${medalClass(row.display_position)}`}>{row.display_position}</span><strong className={styles.performance}>{row.performance}</strong><span>JAAF #{row.position} · {row.points ? `${row.points} pts` : "sem pontos"}</span></header>
                  <div className={styles.mobileName}>
                    <strong lang={athlete.reviewed ? undefined : "ja"}>{athlete.primary}</strong>
                    {athlete.secondary ? <span className={athlete.reviewed ? "" : styles.reviewStatus} lang={athlete.reviewed ? "ja" : undefined}>{athlete.secondary}</span> : null}
                  </div>
                  <dl>
                    <div><dt>Escola / clube</dt><dd lang={teamName.reviewed ? undefined : "ja"}>{teamName.primary}</dd></div>
                    <div><dt>Prefeitura</dt><dd>{row.prefecture_portuguese ?? row.prefecture_japanese ?? "—"}</dd></div>
                    <div><dt>Categoria</dt><dd>{row.reference_age} anos · {row.school_year}年</dd></div>
                    <div><dt>Data</dt><dd>{formatDate(row.performance_date)}</dd></div>
                  </dl>
                  <footer className={styles.proofs}>{row.proof_image_url ? <a href={row.proof_image_url} target="_blank" rel="noopener noreferrer"><FileImage size={16} /> Imagem</a> : null}{row.proof_pdf_url ? <a href={row.proof_pdf_url} target="_blank" rel="noopener noreferrer"><FileText size={16} /> PDF</a> : null}<a href={row.source_url} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16} /> Fonte</a></footer>
                </article>
                );
              })}
            </div>
          </>
        )}

        <div className={styles.namePolicy}>
          <Languages size={16} aria-hidden="true" />
          <span>Nomes oficiais em japonês são preservados. O romaji aparece somente após uma leitura confiável ou revisão humana.</span>
        </div>

        <footer className={styles.syncMeta}>
          <span>Atualização JAAF: <strong>{data?.import?.source_updated_at ?? "Aguardando fonte"}</strong></span>
          <span>Sincronização 11Run: <strong>{formatDateTime(data?.import?.completed_at ?? null)}</strong></span>
        </footer>
      </section>
    </>
  );
}
