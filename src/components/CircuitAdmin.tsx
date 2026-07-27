"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  Medal,
  Pencil,
  RefreshCw,
  Save,
  ShieldAlert,
  Users,
  X,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { useState } from "react";
import type { CircuitOfficialResult } from "@/lib/virtual-circuit";
import styles from "./CircuitAdmin.module.css";

type Metrics = {
  athletes: number;
  guardians: number;
  submissions: number;
  receivedToday: number;
  underReview: number;
  approved: number;
  rejected: number;
  projectedShirts: number;
};

type Evidence = {
  id: string;
  evidence_type: string;
  original_url: string | null;
  private_file_id: string | null;
  accessibility_status: string;
};

type Submission = {
  id: string;
  athlete_name: string;
  public_name: string;
  category_age: number;
  gender: string;
  formattedTime: string;
  submission_type: string;
  status: string;
  activity_date: string;
  city: string;
  state: string;
  guardian_name: string;
  guardian_email: string;
  guardian_phone: string;
  document_file_id: string;
  medical_status?: string | null;
  clearance_method?: string | null;
  medical_certificate_file_id?: string | null;
  promised_due_date?: string | null;
  evidence?: Evidence[];
} & Record<string, unknown>;

type OfficialDraft = {
  publicName: string;
  categoryAge: string;
  gender: "FEMALE" | "MALE";
  activityDate: string;
  time: string;
  city: string;
  state: string;
  competitionName: string;
};

const labels: Record<string, string> = {
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  CORRECTION_REQUESTED: "Correção solicitada",
  DISQUALIFIED: "Desclassificada"
};

export function CircuitAdmin({
  initialMetrics,
  initialSubmissions,
  initialOfficialResults
}: {
  initialMetrics: Metrics;
  initialSubmissions: Submission[];
  initialOfficialResults: CircuitOfficialResult[];
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [items, setItems] = useState(initialSubmissions);
  const [officialResults, setOfficialResults] = useState(initialOfficialResults);
  const [active, setActive] = useState<Submission | null>(null);
  const [activeOfficial, setActiveOfficial] = useState<CircuitOfficialResult | null>(null);
  const [officialDraft, setOfficialDraft] = useState<OfficialDraft | null>(null);
  const [reason, setReason] = useState("");
  const [verifiedTime, setVerifiedTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    const response = await fetch("/api/admin/circuito-virtual");
    const json = await response.json();
    setMetrics(json.metrics);
    setItems(json.submissions);
    setOfficialResults(json.officialResults);
  }

  async function openSubmission(id: string) {
    setError("");
    const response = await fetch(`/api/admin/circuito-virtual/submissions/${id}`);
    const json = await response.json();
    if (!response.ok) return setError(json.error || "Falha ao carregar.");
    setActive(json.submission);
  }

  async function decide(status: string) {
    if (!active || !reason.trim()) return setError("Informe uma justificativa para registrar a decisão.");
    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/circuito-virtual/submissions/${active.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason, verifiedTime: verifiedTime || undefined })
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) return setError(json.error || "Falha ao atualizar.");
    setActive(null);
    setReason("");
    setVerifiedTime("");
    await refresh();
  }

  function openOfficial(item: CircuitOfficialResult) {
    setError("");
    setActiveOfficial(item);
    setOfficialDraft({
      publicName: item.public_name,
      categoryAge: String(item.category_age),
      gender: item.gender,
      activityDate: item.activity_date,
      time: item.formattedTime,
      city: item.city,
      state: item.state,
      competitionName: item.competition_name
    });
  }

  function closeOfficial() {
    setActiveOfficial(null);
    setOfficialDraft(null);
    setError("");
  }

  async function saveOfficial() {
    if (!activeOfficial || !officialDraft) return;
    setBusy(true);
    setError("");
    const response = await fetch(`/api/admin/circuito-virtual/official-results/${activeOfficial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(officialDraft)
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) return setError(json.error || "Falha ao atualizar resultado oficial.");
    closeOfficial();
    await refresh();
  }

  const totalActivities = metrics.submissions + officialResults.length;
  const totalApproved = metrics.approved + officialResults.length;

  return (
    <main className={`admin-panel ${styles.panel}`}>
      <section className={styles.hero}>
        <div>
          <span>Circuito Virtual</span>
          <h1>Inscrições, validação e ranking.</h1>
          <p>Gerencie envios do formulário e marcas oficiais importadas no mesmo painel.</p>
        </div>
        <button onClick={refresh}><RefreshCw size={16} />Atualizar</button>
      </section>

      <section className={styles.metrics}>
        {([
          [Users, "Atletas", metrics.athletes],
          [ClipboardCheck, "Atividades", totalActivities],
          [ShieldAlert, "Em análise", metrics.underReview],
          [CheckCircle2, "Aprovadas", totalApproved],
          [XCircle, "Rejeitadas", metrics.rejected],
          [Medal, "Camisetas projetadas", metrics.projectedShirts]
        ] as Array<[LucideIcon, string, number]>).map(([Icon, label, value]) => (
          <article key={label}>
            <Icon size={19} />
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className={styles.queue}>
        <div className={styles.sectionTitle}>
          <div><span>Fila técnica</span><h2>Atividades recebidas</h2></div>
          <button type="button" onClick={() => window.open("/api/admin/circuito-virtual/export", "_blank")}>
            <FileDown size={16} />Exportar CSV
          </button>
        </div>
        <div className={styles.table}>
          <div className={styles.head}>
            <span>Atleta</span><span>Categoria</span><span>Marca</span><span>Modalidade</span><span>Status</span><span></span>
          </div>
          {items.map((item) => (
            <button className={styles.row} key={item.id} onClick={() => openSubmission(item.id)}>
              <strong>{item.athlete_name}</strong>
              <span>{item.category_age} anos · {item.gender === "FEMALE" ? "F" : "M"}</span>
              <b>{item.formattedTime}</b>
              <span>{item.submission_type.replaceAll("_", " ")}</span>
              <em>{labels[item.status] || item.status}</em>
              <span>Revisar →</span>
            </button>
          ))}
          {!items.length && <p className={styles.empty}>Nenhuma atividade recebida ainda.</p>}
        </div>
      </section>

      <section className={styles.queue}>
        <div className={styles.sectionTitle}>
          <div>
            <span>Ranking publicado</span>
            <h2>Marcas oficiais importadas</h2>
            <p>Estas marcas aparecem diretamente no ranking público e permanecem editáveis.</p>
          </div>
          <strong className={styles.resultCount}>{officialResults.length} registros</strong>
        </div>
        <div className={`${styles.table} ${styles.officialTable}`}>
          <div className={`${styles.head} ${styles.officialHead}`}>
            <span>Atleta</span><span>Categoria</span><span>Data</span><span>Local</span><span>Marca</span><span></span>
          </div>
          {officialResults.map((item) => (
            <button
              className={`${styles.row} ${styles.officialRow}`}
              key={item.id}
              onClick={() => openOfficial(item)}
            >
              <strong>{item.public_name}</strong>
              <span>{item.category_age} anos · {item.gender === "FEMALE" ? "F" : "M"}</span>
              <span>{new Date(`${item.activity_date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
              <span>{item.city}/{item.state}</span>
              <b>{item.formattedTime}</b>
              <span className={styles.editLabel}><Pencil size={15} />Editar</span>
            </button>
          ))}
        </div>
      </section>

      {active && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.drawer}>
            <button className={styles.close} onClick={() => setActive(null)}>×</button>
            <span className={styles.kicker}>Revisão técnica</span>
            <h2>{active.athlete_name}</h2>
            <div className={styles.details}>
              <p><small>Nome público</small><strong>{active.public_name}</strong></p>
              <p><small>Categoria</small><strong>{active.category_age} anos · {active.gender === "FEMALE" ? "Feminino" : "Masculino"}</strong></p>
              <p><small>Marca declarada</small><strong>{active.formattedTime}</strong></p>
              <p><small>Atividade</small><strong>{active.activity_date} · {active.city}/{active.state}</strong></p>
              <p><small>Responsável</small><strong>{active.guardian_name}</strong><span>{active.guardian_email} · {active.guardian_phone}</span></p>
              <p><small>Status</small><strong>{labels[active.status] || active.status}</strong></p>
              <p>
                <small>Aptidão médica</small>
                <strong>{active.medical_status === "PENDING_CERTIFICATE" ? "Atestado pendente" : active.medical_status ? "Atestado recebido" : "Não informado"}</strong>
                {active.promised_due_date ? <span>Compromisso até {new Date(active.promised_due_date).toLocaleDateString("pt-BR")}</span> : null}
              </p>
            </div>
            <div className={styles.evidence}>
              <strong>Evidências privadas</strong>
              <div><span>Documento de identidade e idade</span><a href={`/api/admin/circuito-virtual/files/${active.document_file_id}`} target="_blank" rel="noreferrer">Baixar documento</a></div>
              {active.medical_certificate_file_id
                ? <div><span>Atestado médico · dado sensível</span><a href={`/api/admin/circuito-virtual/files/${active.medical_certificate_file_id}`} target="_blank" rel="noreferrer">Abrir atestado</a></div>
                : <div><span>Atestado médico pendente — aprovação bloqueada</span></div>}
              {active.evidence?.map((item) => (
                <div key={item.id}>
                  <span>{item.evidence_type.replaceAll("_", " ")}</span>
                  {item.original_url ? <a href={item.original_url} target="_blank" rel="noreferrer">Abrir link seguro ↗</a> : null}
                  {item.private_file_id ? <a href={`/api/admin/circuito-virtual/files/${item.private_file_id}`} target="_blank" rel="noreferrer">Baixar documento</a> : null}
                </div>
              ))}
            </div>
            <label>Marca verificada (opcional)<input placeholder="03:42.18" value={verifiedTime} onChange={(event) => setVerifiedTime(event.target.value)} /></label>
            <label>Justificativa obrigatória<textarea rows={4} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Registre as evidências e o motivo da decisão." /></label>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.actions}>
              <button disabled={busy || active.medical_status === "PENDING_CERTIFICATE" || !active.medical_status} onClick={() => decide("APPROVED")}><CheckCircle2 />Aprovar</button>
              <button disabled={busy} onClick={() => decide("CORRECTION_REQUESTED")}><ShieldAlert />Pedir correção</button>
              <button disabled={busy} onClick={() => decide("REJECTED")}><XCircle />Rejeitar</button>
            </div>
          </div>
        </div>
      )}

      {activeOfficial && officialDraft && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Editar resultado oficial">
          <div className={styles.drawer}>
            <button className={styles.close} onClick={closeOfficial}><X size={18} /></button>
            <span className={styles.kicker}>Resultado oficial importado</span>
            <h2>Editar marca</h2>
            <div className={styles.officialForm}>
              <label className={styles.fullField}>Nome público
                <input value={officialDraft.publicName} onChange={(event) => setOfficialDraft({ ...officialDraft, publicName: event.target.value })} />
              </label>
              <label>Idade/categoria
                <select value={officialDraft.categoryAge} onChange={(event) => setOfficialDraft({ ...officialDraft, categoryAge: event.target.value })}>
                  {[9, 10, 11, 12, 13].map((age) => <option key={age} value={age}>{age} anos</option>)}
                </select>
              </label>
              <label>Gênero esportivo
                <select value={officialDraft.gender} onChange={(event) => setOfficialDraft({ ...officialDraft, gender: event.target.value as "FEMALE" | "MALE" })}>
                  <option value="FEMALE">Feminino</option>
                  <option value="MALE">Masculino</option>
                </select>
              </label>
              <label>Data
                <input type="date" value={officialDraft.activityDate} onChange={(event) => setOfficialDraft({ ...officialDraft, activityDate: event.target.value })} />
              </label>
              <label>Marca (MM:SS.CC)
                <input value={officialDraft.time} onChange={(event) => setOfficialDraft({ ...officialDraft, time: event.target.value })} />
              </label>
              <label>Cidade
                <input value={officialDraft.city} onChange={(event) => setOfficialDraft({ ...officialDraft, city: event.target.value })} />
              </label>
              <label>UF
                <input maxLength={2} value={officialDraft.state} onChange={(event) => setOfficialDraft({ ...officialDraft, state: event.target.value.toUpperCase() })} />
              </label>
              <label className={styles.fullField}>Competição
                <input value={officialDraft.competitionName} onChange={(event) => setOfficialDraft({ ...officialDraft, competitionName: event.target.value })} />
              </label>
            </div>
            <p className={styles.syncNotice}>Ao salvar, a alteração é refletida imediatamente no ranking público.</p>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.officialActions}>
              <button type="button" onClick={closeOfficial}>Cancelar</button>
              <button type="button" disabled={busy} onClick={saveOfficial}><Save size={17} />{busy ? "Salvando..." : "Salvar alterações"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
