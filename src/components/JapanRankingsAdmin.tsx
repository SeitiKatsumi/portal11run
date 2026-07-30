"use client";

import { ArrowUpRight, CheckCircle2, History, LoaderCircle, RefreshCw, Save, ShieldAlert } from "lucide-react";
import { useState } from "react";
import styles from "./JapanRankingsAdmin.module.css";

type AdminData = {
  seasons: Array<{ year: number; base_url: string; active: number; current: number; refresh_hour: number; refresh_interval_hours: number; last_automatic_check_at: string | null }>;
  configs: Array<{
    id: string; season: number; event_meters: number; gender: "M" | "F"; event_id: number | null;
    type_id: number; active: number; source_note: string | null; last_sync_at: string | null; published_records: number | null;
  }>;
  imports: Array<{
    id: string; season: number; event_meters: number; gender: "M" | "F"; reference_age: number;
    status: string; record_count: number; source_url: string; source_updated_at: string | null; published: number; created_at: string;
  }>;
  jobs: Array<{ id: string; kind: string; status: string; progress: number; total: number; message: string | null; created_at: string }>;
  pendingNames: Array<{ original_text: string; occurrences: number }>;
  corrections: Array<{ id: string; original_text: string; display_text: string; entity_type: string }>;
};

function date(value: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "Nunca";
}

export function JapanRankingsAdmin({ initialData }: { initialData: AdminData }) {
  const [data, setData] = useState(initialData);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const response = await fetch("/api/admin/references/japan-rankings", { cache: "no-store" });
    if (response.ok) setData(await response.json());
  }

  async function refreshAll() {
    setBusy(true);
    setMessage("A atualização dos rankings ativos entrou na fila.");
    const response = await fetch("/api/admin/references/japan-rankings/refresh-all", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ season: data.seasons[0]?.year ?? 2026 })
    });
    const payload = await response.json();
    setMessage(response.ok ? `Processamento ${payload.jobId} iniciado para ${payload.total} rankings.` : payload.error);
    setBusy(false);
    void reload();
  }

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    const response = await fetch("/api/admin/references/japan-rankings", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (response.ok) {
      setData(payload.data);
      setMessage("Alteração salva com segurança.");
    } else setMessage(payload.error);
    setBusy(false);
  }

  return (
    <section className="admin-panel admin-subpanel">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">referências internacionais</span>
          <h1>Ranking escolar do Japão</h1>
          <p>Monitore a coleta da JAAF, os lotes publicados e as transliterações revisadas. A versão pública só muda depois de uma importação completa e válida.</p>
        </div>
        <button className="button primary" type="button" onClick={refreshAll} disabled={busy}>
          {busy ? <LoaderCircle className={styles.spin} size={17} /> : <RefreshCw size={17} />}
          Atualizar todos
        </button>
      </div>

      {message ? <div className={styles.notice}><CheckCircle2 size={17} /><span>{message}</span></div> : null}

      <div className={styles.kpis}>
        <article><span>Combinações previstas</span><strong>18</strong><small>3 provas × 3 idades × 2 gêneros</small></article>
        <article><span>Ativas na fonte</span><strong>{data.configs.filter((item) => item.active).length * 3}</strong><small>3.000 m feminino ausente em 2026</small></article>
        <article><span>Resultados publicados</span><strong>{data.configs.reduce((sum, item) => sum + Number(item.published_records ?? 0), 0)}</strong><small>Somando os lotes atuais</small></article>
        <article><span>Romaji pendente</span><strong>{data.pendingNames.length}</strong><small>Primeiros 100 para revisão</small></article>
      </div>

      {data.seasons.map((season) => (
        <form className={styles.seasonForm} key={season.year} onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          void patch({
            action: "season", year: Number(form.get("year")), baseUrl: form.get("baseUrl"),
            refreshHour: Number(form.get("refreshHour")), refreshIntervalHours: Number(form.get("refreshIntervalHours")),
            active: form.get("active") === "on", current: form.get("current") === "on"
          });
        }}>
          <div><span>Temporada e automação</span><h2>Fonte {season.year}</h2></div>
          <input name="year" type="hidden" value={season.year} />
          <label className={styles.wide}><span>URL-base oficial</span><input name="baseUrl" type="url" defaultValue={season.base_url} required /></label>
          <label><span>Hora diária</span><input name="refreshHour" type="number" min="0" max="23" defaultValue={season.refresh_hour} /></label>
          <label><span>Intervalo (horas)</span><input name="refreshIntervalHours" type="number" min="1" max="168" defaultValue={season.refresh_interval_hours ?? 24} /></label>
          <label className={styles.inlineCheck}><input name="active" type="checkbox" defaultChecked={Boolean(season.active)} /> Ativa</label>
          <label className={styles.inlineCheck}><input name="current" type="checkbox" defaultChecked={Boolean(season.current)} /> Atual</label>
          <button type="submit" disabled={busy}><Save size={15} /> Salvar temporada</button>
        </form>
      ))}

      <div className={styles.sectionTitle}><div><span>Configuração central</span><h2>Provas e IDs oficiais</h2></div><p>Os três anos escolares reutilizam o mesmo ID de prova.</p></div>
      <div className={styles.configGrid}>
        {data.configs.map((config) => (
          <form className={styles.configCard} key={config.id} onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void patch({
              action: "config", id: config.id,
              eventId: form.get("eventId") ? Number(form.get("eventId")) : null,
              typeId: Number(form.get("typeId")),
              active: form.get("active") === "on",
              sourceNote: String(form.get("sourceNote") ?? "")
            });
          }}>
            <header><div><span>{config.gender === "M" ? "Masculino" : "Feminino"}</span><strong>{config.event_meters.toLocaleString("pt-BR")} m</strong></div><em className={config.active ? styles.ok : styles.warning}>{config.active ? "Ativo" : "Indisponível"}</em></header>
            <div className={styles.formRow}><label><span>Event ID</span><input name="eventId" type="number" defaultValue={config.event_id ?? ""} placeholder="Não confirmado" /></label><label><span>Type ID</span><input name="typeId" type="number" defaultValue={config.type_id} /></label></div>
            <label className={styles.check}><input name="active" type="checkbox" defaultChecked={Boolean(config.active)} /> Categoria ativa</label>
            <label><span>Nota da fonte</span><textarea name="sourceNote" defaultValue={config.source_note ?? ""} rows={2} /></label>
            <footer><small>{config.published_records ?? 0} registros · {date(config.last_sync_at)}</small><button type="submit" disabled={busy}><Save size={15} /> Salvar</button></footer>
          </form>
        ))}
      </div>

      <div className={styles.twoColumns}>
        <section>
          <div className={styles.sectionTitle}><div><span>Revisão humana</span><h2>Romaji pendente</h2></div></div>
          <div className={styles.pendingList}>
            {data.pendingNames.slice(0, 16).map((item) => (
              <form key={item.original_text} onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void patch({ action: "correction", entityType: "athlete", originalText: item.original_text, displayText: form.get("displayText") });
              }}>
                <div><strong lang="ja">{item.original_text}</strong><small>{item.occurrences} ocorrência(s)</small></div>
                <input name="displayText" required placeholder="Hepburn Romaji revisado" />
                <button type="submit" aria-label={`Salvar romaji de ${item.original_text}`}><Save size={15} /></button>
              </form>
            ))}
            {!data.pendingNames.length ? <p>Nenhum nome pendente nos lotes atuais.</p> : null}
          </div>
        </section>

        <section>
          <div className={styles.sectionTitle}><div><span>Fila persistida</span><h2>Processamentos</h2></div><button type="button" onClick={() => void reload()}><RefreshCw size={15} /> Recarregar</button></div>
          <div className={styles.jobs}>
            {data.jobs.slice(0, 15).map((job) => (
              <article key={job.id}>
                {job.status === "error" ? <ShieldAlert size={17} /> : job.status === "completed" ? <CheckCircle2 size={17} /> : <LoaderCircle size={17} />}
                <div><strong>{job.message ?? job.status}</strong><span>{job.progress}/{job.total} · {date(job.created_at)}</span></div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className={styles.sectionTitle}><div><span>Versões preservadas</span><h2>Histórico de importações</h2></div></div>
      <div className={styles.history}>
        {data.imports.map((item) => (
          <article key={item.id}>
            <div><strong>{item.event_meters.toLocaleString("pt-BR")} m · {item.gender} · {item.reference_age} anos</strong><span>{item.record_count} resultados · JAAF {item.source_updated_at ?? "sem data"}</span></div>
            <em className={item.published ? styles.ok : ""}>{item.published ? "Publicado" : "Arquivado"}</em>
            <a href={item.source_url} target="_blank" rel="noopener noreferrer" aria-label="Abrir fonte"><ArrowUpRight size={16} /></a>
            {!item.published ? <button type="button" onClick={() => void patch({ action: "restore", importId: item.id })}><History size={15} /> Restaurar</button> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
