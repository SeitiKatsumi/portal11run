"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Flag, Import, Medal, RefreshCw, Save, Smartphone, Trash2, Trophy } from "lucide-react";
import styles from "./CompetitionAdmin.module.css";

type Race = { id: string; title: string; categories: string[]; distance_m: number; scheduled_time: string; status: string; started_at: string | null; paused_elapsed_ms: number };
type Entry = { id: string; race_id: string; name: string; category: string; gender: string; city: string; bib_number: number | null; result_status: string };
type Result = { id: string; raceId: string; position: number | null; bib: string; name: string; category: string; gender: string; formattedTime: string; status: string; provisional: boolean };
type State = { races: Race[]; entries: Entry[]; results: Result[] };

const statusLabels: Record<string, string> = { READY: "Preparada", ARMED: "Armada", RUNNING: "Ao vivo", HOMOLOGATED: "Homologada", CANCELLED: "Cancelada" };

function timeToMs(value: string) {
  const match = value.trim().match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})(?:[.,](\d{1,2}))?$/);
  if (!match) return null;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  const centiseconds = Number((match[4] ?? "0").padEnd(2, "0"));
  if (minutes > 59 || seconds > 59) return null;
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + centiseconds * 10;
}

export function CompetitionAdmin() {
  const [data, setData] = useState<State>({ races: [], entries: [], results: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bibStart, setBibStart] = useState("1");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("number");
  const [draftTimes, setDraftTimes] = useState<Record<string, string>>({});

  async function load() {
    const response = await fetch("/api/admin/competitions", { cache: "no-store" });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error || "Não foi possível carregar a competição.");
    setData(json);
  }

  useEffect(() => { load().catch((caught) => setError(caught.message)).finally(() => setLoading(false)); }, []);

  async function action(name: string, payload: Record<string, unknown> = {}) {
    setBusy(name); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/admin/competitions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: name, ...payload }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível concluir a ação.");
      setData(json);
      setSuccess(name === "import" ? `${json.result.imported} atletas aceitos sincronizados.` : name === "reset_competition" ? "Testes limpos. Inscrições e numeração foram preservadas." : "Operação concluída.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível concluir a ação."); }
    finally { setBusy(""); }
  }

  async function saveResult(result: Result) {
    const elapsedMs = timeToMs(draftTimes[result.id] ?? result.formattedTime);
    if (elapsedMs === null) { setError("Use o formato HH:MM:SS.cc ou MM:SS.cc."); return; }
    setBusy(result.id); setError("");
    try {
      const response = await fetch("/api/admin/competitions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finishId: result.id, elapsedMs, reason: "Correção manual no painel" }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível corrigir o tempo.");
      setData(json); setSuccess("Tempo corrigido e classificação recalculada.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível corrigir o tempo."); }
    finally { setBusy(""); }
  }

  async function changeStatus(result: Result, resultStatus: string) {
    setBusy(result.id); setError("");
    try {
      const response = await fetch("/api/admin/competitions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finishId: result.id, resultStatus, reason: `Status alterado para ${resultStatus}` }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível alterar o status.");
      setData(json);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível alterar o status."); }
    finally { setBusy(""); }
  }

  async function assignBib(entry: Entry, raw: string) {
    const bibNumber = Number(raw);
    if (!Number.isInteger(bibNumber) || bibNumber < 1 || bibNumber > 9999) { setError("Informe um número entre 0001 e 9999."); return; }
    await action("assign_bib", { entryId: entry.id, bibNumber });
  }

  async function addManual(race: Race) {
    const rawBib = window.prompt("Número da pulseira (1 a 9999):");
    if (!rawBib) return;
    const entry = data.entries.find((item) => item.race_id === race.id && item.bib_number === Number(rawBib));
    if (!entry) { setError("Atleta não encontrado nesta bateria."); return; }
    const rawTime = window.prompt("Tempo final (MM:SS.cc ou HH:MM:SS.cc):");
    if (!rawTime) return;
    const elapsedMs = timeToMs(rawTime);
    if (elapsedMs === null) { setError("Tempo inválido."); return; }
    const reason = window.prompt("Justificativa da inclusão manual:", "Leitura não capturada pelo QR");
    if (reason) await action("manual_finish", { raceId: race.id, entryId: entry.id, elapsedMs, reason });
  }

  async function advancedEdit(result: Result) {
    const rawBib = window.prompt("Número correto do atleta:", result.bib);
    if (!rawBib) return;
    const entry = data.entries.find((item) => item.bib_number === Number(rawBib));
    if (!entry) { setError("Número de atleta não encontrado."); return; }
    const adjustmentRaw = window.prompt("Ajuste em milissegundos (negativo desconta; 0 mantém):", "0");
    if (adjustmentRaw === null || !Number.isInteger(Number(adjustmentRaw))) return;
    const rankRaw = window.prompt("Ordem manual excepcional (vazio mantém classificação por tempo):", "");
    const reason = window.prompt("Justificativa obrigatória da correção:");
    if (!reason) return;
    setBusy(result.id); setError("");
    try {
      const response = await fetch("/api/admin/competitions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finishId: result.id, entryId: entry.id, adjustmentMs: Number(adjustmentRaw), manualRank: rankRaw ? Number(rankRaw) : null, reason }) });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Não foi possível editar o resultado.");
      setData(json); setSuccess("Resultado corrigido, auditado e reclassificado.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Não foi possível editar o resultado."); }
    finally { setBusy(""); }
  }

  function clearTests() {
    const confirmation = window.prompt("Esta ação zera cronômetros e invalida todas as chegadas e resultados. Inscrições e números serão preservados. Digite LIMPAR para confirmar:");
    if (confirmation === "LIMPAR") action("reset_competition", { reason: "Limpeza geral de testes confirmada no painel administrativo" });
  }

  const previewEnd = Number(bibStart) + data.entries.length - 1;
  const visibleEntries = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("pt-BR");
    const filtered = data.entries.filter((entry) => !search || [entry.name, entry.category, entry.gender, entry.city, entry.bib_number ? String(entry.bib_number).padStart(4, "0") : ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(search)));
    return [...filtered].sort((a, b) => sort === "name" ? a.name.localeCompare(b.name, "pt-BR") : sort === "category" ? Number(a.category.replace(/\D/g, "")) - Number(b.category.replace(/\D/g, "")) || a.name.localeCompare(b.name, "pt-BR") : (a.bib_number ?? 10000) - (b.bib_number ?? 10000));
  }, [data.entries, query, sort]);

  if (loading) return <section className={styles.panel}><p><RefreshCw className="spin" size={18} /> Carregando operação da prova…</p></section>;

  return <section className={styles.panel} aria-labelledby="competition-admin-title">
    <header className={styles.header}><div><span className="eyebrow">competição e cronometragem</span><h2 id="competition-admin-title">Operação da prova.</h2><p>Importe os atletas aceitos, distribua as pulseiras e abra cada largada no celular oficial.</p></div><div className={styles.actions}><button type="button" disabled={Boolean(busy)} onClick={() => action("import")}><Import size={17} />Sincronizar aceitos</button><a href="/circuito-cross-country-ivcl-11run" target="_blank" rel="noreferrer">Página pública<ArrowUpRight size={16} /></a></div></header>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}{success ? <p className={styles.success} role="status">{success}</p> : null}
    <div className={styles.numbering}><label>Número inicial<input type="number" min="1" max="9999" value={bibStart} onChange={(event) => setBibStart(event.target.value)} /><small>Ordem: categoria, gênero e nome.</small></label><button type="button" disabled={Boolean(busy) || !data.entries.length} onClick={() => { const text = `Confirmar ${data.entries.length} números, de ${String(Number(bibStart)).padStart(4, "0")} a ${String(previewEnd).padStart(4, "0")}?`; if (window.confirm(text)) action("assign_bibs", { start: Number(bibStart) }); }}><Medal size={17} />Confirmar numeração</button><p className={styles.preview}>{data.entries.length ? `Prévia: ${String(Number(bibStart)).padStart(4, "0")} a ${String(previewEnd).padStart(4, "0")} · ${data.entries.length} atletas` : "Sincronize os atletas aceitos para começar."}</p></div>
    <div className={styles.races}>{data.races.map((race) => <article className={styles.raceCard} key={race.id}><header><div><h3>{race.title}</h3><p>{race.categories.join(" · ")} · {race.distance_m.toLocaleString("pt-BR")} m · {race.scheduled_time}</p></div><span className={styles.status}>{race.status === "ARMED" && race.paused_elapsed_ms ? "Pausada" : statusLabels[race.status] ?? race.status}</span></header><div className={styles.raceActions}><a className={styles.start} href={`/cronometro/${race.id}`} target="_blank" rel="noreferrer"><Flag size={16} />Largada</a>{["ARMED", "RUNNING"].includes(race.status) ? <button type="button" onClick={() => addManual(race)}>Inserir chegada</button> : null}{race.status === "RUNNING" || (race.status === "ARMED" && race.paused_elapsed_ms > 0) ? <button type="button" onClick={() => action("homologate", { raceId: race.id })}><Trophy size={16} />Finalizar e homologar</button> : null}{race.status === "HOMOLOGATED" ? <button type="button" onClick={() => { const reason = window.prompt("Justificativa para reabrir a bateria:"); if (reason) action("reopen", { raceId: race.id, reason }); }}>Reabrir</button> : null}{race.status !== "READY" ? <button type="button" onClick={() => { if (window.confirm(`Resetar ${race.title}? O cronômetro será zerado e as chegadas desta bateria serão invalidadas.`)) action("reset", { raceId: race.id, reason: "Reset confirmado no painel administrativo" }); }}>Resetar</button> : null}<a href={`/cronometro/${race.id}`} target="_blank" rel="noreferrer"><Smartphone size={16} />Preparar celular</a></div></article>)}</div>
    <aside className={styles.testZone} aria-labelledby="test-zone-title"><div><span className="eyebrow">ambiente de testes</span><h3 id="test-zone-title">Limpar simulações</h3><p>Zera cronômetros e retira todas as chegadas e resultados atuais. Atletas inscritos e números de pulseira permanecem intactos.</p></div><button type="button" disabled={Boolean(busy)} onClick={clearTests}><Trash2 size={17} />Limpar testes</button></aside>
    <div className={styles.filters}><label>Buscar número ou atleta<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="0001, nome, categoria ou cidade" /></label><label>Ordenar<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="number">Ordem numérica</option><option value="category">Categoria</option><option value="name">Nome</option></select></label></div>
    <div className={styles.tableWrap} role="region" aria-label="Atletas numerados" tabIndex={0}><table className={styles.table}><thead><tr><th>Nº</th><th>Atleta</th><th>Categoria</th><th>Gênero</th><th>Cidade</th><th>Bateria</th></tr></thead><tbody>{visibleEntries.map((entry) => <tr key={entry.id}><td className={styles.bib} data-label="Número"><input aria-label={`Número de ${entry.name}`} defaultValue={entry.bib_number ? String(entry.bib_number).padStart(4, "0") : ""} placeholder="0000" inputMode="numeric" onBlur={(event) => { if (event.target.value && Number(event.target.value) !== entry.bib_number) assignBib(entry, event.target.value); }} /></td><td data-label="Atleta"><strong>{entry.name}</strong></td><td data-label="Categoria">{entry.category}</td><td data-label="Gênero">{entry.gender}</td><td data-label="Cidade">{entry.city}</td><td data-label="Bateria">{data.races.find((race) => race.id === entry.race_id)?.title}</td></tr>)}</tbody></table>{!visibleEntries.length ? <p className={styles.empty}>Nenhum atleta neste recorte.</p> : null}</div>
    <div><span className="eyebrow">resultados provisórios e finais</span><h3>Chegadas registradas</h3></div>
    <div className={styles.tableWrap} role="region" aria-label="Resultados da competição" tabIndex={0}><table className={styles.table}><thead><tr><th>Pos.</th><th>Nº</th><th>Atleta</th><th>Categoria</th><th>Tempo</th><th>Status</th><th>Ação</th></tr></thead><tbody>{data.results.map((result) => <tr key={result.id}><td data-label="Posição">{result.position ?? "—"}</td><td className={styles.bib} data-label="Número">{result.bib}</td><td data-label="Atleta"><strong>{result.name}</strong><br /><small>{result.gender}</small></td><td data-label="Categoria">{result.category}</td><td data-label="Tempo"><input aria-label={`Tempo de ${result.name}`} value={draftTimes[result.id] ?? result.formattedTime} onChange={(event) => setDraftTimes((current) => ({ ...current, [result.id]: event.target.value }))} /></td><td data-label="Status"><select aria-label={`Status de ${result.name}`} value={["DNS", "DNF", "DSQ"].includes(result.status) ? result.status : "ACTIVE"} onChange={(event) => changeStatus(result, event.target.value)}><option value="ACTIVE">{result.provisional ? "Provisório" : "Final"}</option><option value="DNS">DNS</option><option value="DNF">DNF</option><option value="DSQ">DSQ</option></select></td><td className={styles.rowActions} data-label="Ação"><button type="button" disabled={busy === result.id || !result.provisional} onClick={() => saveResult(result)}><Save size={15} />Salvar</button><button type="button" disabled={busy === result.id || !result.provisional} onClick={() => advancedEdit(result)}>Editar</button><button type="button" disabled={busy === result.id || !result.provisional} onClick={() => { const reason = window.prompt("Justificativa para invalidar esta leitura:"); if (reason) fetch("/api/admin/competitions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ finishId: result.id, status: "VOID", reason }) }).then((response) => response.json()).then((json) => { if (!json.ok) throw new Error(json.error); setData(json); setSuccess("Leitura invalidada e classificação recalculada."); }).catch((caught) => setError(caught.message)); }}>Invalidar</button></td></tr>)}</tbody></table>{!data.results.length ? <p className={styles.empty}>Os resultados aparecerão aqui assim que a primeira pulseira for lida.</p> : null}</div>
  </section>;
}

