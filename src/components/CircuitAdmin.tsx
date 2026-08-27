"use client";

import {
  CheckCircle2,
  ClipboardCheck,
  FileDown,
  Medal,
  Eye,
  EyeOff,
  Plus,
  Pencil,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CircuitOfficialResult } from "@/lib/virtual-circuit";
import { CIRCUIT_CATEGORY_AGES, circuitCategoryLabel, circuitCategoryName } from "@/lib/virtual-circuit-category";
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
  submissionType?: "OFFICIAL_COMPETITION" | "TRACK_400M" | "OPEN_COURSE";
};

const labels: Record<string, string> = {
  UNDER_REVIEW: "Em análise",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  CORRECTION_REQUESTED: "Correção solicitada",
  DISQUALIFIED: "Desclassificada",
  HIDDEN: "Oculta"
};

type SortOrder = "date-desc" | "date-asc" | "name-asc" | "name-desc";

function filterAndSort<T extends { activity_date: string }>(rows: T[], name: (row: T) => string, search: string, date: string, sort: SortOrder) {
  const query = search.trim().toLocaleLowerCase("pt-BR");
  return rows
    .filter((row) => (!query || name(row).toLocaleLowerCase("pt-BR").includes(query)) && (!date || row.activity_date === date))
    .sort((a, b) => sort.startsWith("name")
      ? name(a).localeCompare(name(b), "pt-BR") * (sort === "name-desc" ? -1 : 1)
      : a.activity_date.localeCompare(b.activity_date) * (sort === "date-desc" ? -1 : 1));
}

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
  const [submissionDraft, setSubmissionDraft] = useState<OfficialDraft | null>(null);
  const [creatingOfficial, setCreatingOfficial] = useState(false);
  const [reason, setReason] = useState("");
  const [verifiedTime, setVerifiedTime] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("date-desc");

  const filteredItems = useMemo(() => filterAndSort(items, (item) => item.public_name || item.athlete_name, search, dateFilter, sortOrder), [items, search, dateFilter, sortOrder]);
  const filteredOfficialResults = useMemo(() => filterAndSort(officialResults, (item) => item.public_name, search, dateFilter, sortOrder), [officialResults, search, dateFilter, sortOrder]);

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
    const item = json.submission as Submission;
    setActive(item);
    setSubmissionDraft({
      publicName: item.public_name,
      categoryAge: String(item.category_age),
      gender: item.gender as "FEMALE" | "MALE",
      activityDate: item.activity_date,
      time: item.formattedTime,
      city: item.city,
      state: item.state,
      competitionName: "",
      submissionType: item.submission_type as OfficialDraft["submissionType"]
    });
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

  function openCreateOfficial() {
    setError("");
    setCreatingOfficial(true);
    setOfficialDraft({ publicName: "", categoryAge: "9", gender: "FEMALE", activityDate: "", time: "", city: "", state: "", competitionName: "Teste inserido pelo admin", submissionType: "TRACK_400M" });
  }

  function closeCreateOfficial() {
    setCreatingOfficial(false);
    setOfficialDraft(null);
    setError("");
  }

  async function createOfficial() {
    if (!officialDraft) return;
    setBusy(true); setError("");
    const response = await fetch("/api/admin/circuito-virtual/official-results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(officialDraft) });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) return setError(json.error || "Falha ao adicionar atleta.");
    closeCreateOfficial();
    await refresh();
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

  async function saveSubmission() {
    if (!active || !submissionDraft) return;
    await mutateSubmission("PATCH", { action: "edit", ...submissionDraft });
  }

  async function mutateSubmission(method: "PATCH" | "DELETE", body?: Record<string, unknown>) {
    if (!active) return;
    if (method === "DELETE" && !window.confirm(`Excluir definitivamente o registro de ${active.public_name}?`)) return;
    setBusy(true); setError("");
    const response = await fetch(`/api/admin/circuito-virtual/submissions/${active.id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) return setError(json.error || "Falha ao atualizar registro.");
    setActive(null); setSubmissionDraft(null); await refresh();
  }

  async function mutateOfficial(method: "PATCH" | "DELETE", body?: Record<string, unknown>) {
    if (!activeOfficial) return;
    if (method === "DELETE" && !window.confirm(`Excluir definitivamente o registro de ${activeOfficial.public_name}?`)) return;
    setBusy(true); setError("");
    const response = await fetch(`/api/admin/circuito-virtual/official-results/${activeOfficial.id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
    const json = await response.json();
    setBusy(false);
    if (!response.ok) return setError(json.error || "Falha ao atualizar registro.");
    closeOfficial(); await refresh();
  }

  const totalActivities = metrics.submissions + officialResults.length;
  const totalApproved = metrics.approved + officialResults.filter((item) => item.status === "APPROVED").length;

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

      <section className={styles.filters} aria-label="Filtros dos registros">
        <label><Search size={17} /><span>Buscar atleta</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ex.: Emanuelly" /></label>
        <label><span>Data da atividade</span><input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} /></label>
        <label><span>Ordenar</span><select value={sortOrder} onChange={(event) => setSortOrder(event.target.value as SortOrder)}><option value="date-desc">Data mais recente</option><option value="date-asc">Data mais antiga</option><option value="name-asc">Nome A–Z</option><option value="name-desc">Nome Z–A</option></select></label>
        <button type="button" onClick={() => { setSearch(""); setDateFilter(""); setSortOrder("date-desc"); }}>Limpar filtros</button>
      </section>

      <section className={styles.queue}>
        <div className={styles.sectionTitle}>
          <div><span>Cadastros do desafio</span><h2>Inscrições e atividades</h2><p>Inclui pendências, aprovadas e ocultas. Aqui também aparecem atletas cadastrados pelo formulário, como Emanuelly.</p></div>
          <button type="button" onClick={() => window.open("/api/admin/circuito-virtual/export", "_blank")}>
            <FileDown size={16} />Exportar CSV
          </button>
        </div>
        <div className={styles.table}>
          <div className={styles.head}>
            <span>Atleta</span><span>Categoria</span><span>Marca</span><span>Modalidade</span><span>Status</span><span></span>
          </div>
          {filteredItems.map((item) => (
            <button className={styles.row} key={item.id} onClick={() => openSubmission(item.id)}>
              <strong>{item.public_name || item.athlete_name}</strong>
              <span>{circuitCategoryName(item.category_age)} · {item.category_age} anos · {item.gender === "FEMALE" ? "F" : "M"}</span>
              <b>{item.formattedTime}</b>
              <span>{item.submission_type.replaceAll("_", " ")}</span>
              <em>{labels[item.status] || item.status}</em>
              <span>{item.status === "HIDDEN" ? "Oculto · Gerenciar →" : "Gerenciar →"}</span>
            </button>
          ))}
          {!filteredItems.length && <p className={styles.empty}>Nenhum cadastro corresponde aos filtros.</p>}
        </div>
      </section>

      <section className={styles.queue}>
        <div className={styles.sectionTitle}>
          <div>
            <span>Ranking publicado</span>
            <h2>Marcas oficiais importadas</h2>
            <p>Estas marcas aparecem diretamente no ranking público e permanecem editáveis.</p>
          </div>
          <div className={styles.titleActions}><strong className={styles.resultCount}>{officialResults.length} registros</strong><button type="button" onClick={openCreateOfficial}><Plus size={16} />Adicionar atleta</button></div>
        </div>
        <div className={`${styles.table} ${styles.officialTable}`}>
          <div className={`${styles.head} ${styles.officialHead}`}>
            <span>Atleta</span><span>Categoria</span><span>Data</span><span>Local</span><span>Marca</span><span></span>
          </div>
          {filteredOfficialResults.map((item) => (
            <button
              className={`${styles.row} ${styles.officialRow}`}
              key={item.id}
              onClick={() => openOfficial(item)}
            >
              <strong>{item.public_name}</strong>
              <span>{circuitCategoryName(item.category_age)} · {item.category_age} anos · {item.gender === "FEMALE" ? "F" : "M"}</span>
              <span>{new Date(`${item.activity_date}T12:00:00`).toLocaleDateString("pt-BR")}</span>
              <span>{item.city}/{item.state}</span>
              <b>{item.formattedTime}</b>
              <span className={styles.editLabel}>{item.status === "HIDDEN" ? <EyeOff size={15} /> : <Pencil size={15} />}{item.status === "HIDDEN" ? "Oculto · Gerenciar" : "Gerenciar"}</span>
            </button>
          ))}
          {!filteredOfficialResults.length && <p className={styles.empty}>Nenhuma marca oficial corresponde aos filtros.</p>}
        </div>
      </section>

      {active && submissionDraft && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.drawer}>
            <button className={styles.close} onClick={() => { setActive(null); setSubmissionDraft(null); }}>×</button>
            <span className={styles.kicker}>Cadastro e atividade</span>
            <h2>{active.athlete_name}</h2>
            <div className={styles.details}>
              <p><small>Nome público</small><strong>{active.public_name}</strong></p>
              <p><small>Categoria</small><strong>{circuitCategoryLabel(active.category_age)} · {active.gender === "FEMALE" ? "Feminino" : "Masculino"}</strong></p>
              <p><small>Marca declarada</small><strong>{active.formattedTime}</strong></p>
              <p><small>Atividade</small><strong>{active.activity_date} · {active.city}/{active.state}</strong></p>
              <p><small>Responsável</small><strong>{active.guardian_name}</strong><span>{active.guardian_email} · {active.guardian_phone}</span></p>
              <p><small>Status</small><strong>{labels[active.status] || active.status}</strong></p>
              <p>
                <small>Saúde e responsabilidade</small>
                <strong>{active.medical_status === "VERIFIED" ? "Termo do responsável aceito" : "Atestado dispensado pela regra atual"}</strong>
                <span>A homologação não depende de documento médico.</span>
              </p>
            </div>
            <div className={styles.officialForm}>
              <label className={styles.fullField}>Nome público<input value={submissionDraft.publicName} onChange={(event) => setSubmissionDraft({ ...submissionDraft, publicName: event.target.value })} /></label>
              <label>Categoria 2026<select value={submissionDraft.categoryAge} onChange={(event) => setSubmissionDraft({ ...submissionDraft, categoryAge: event.target.value })}>{CIRCUIT_CATEGORY_AGES.map((age) => <option key={age} value={age}>{circuitCategoryLabel(age)}</option>)}</select></label>
              <label>Gênero esportivo<select value={submissionDraft.gender} onChange={(event) => setSubmissionDraft({ ...submissionDraft, gender: event.target.value as "FEMALE" | "MALE" })}><option value="FEMALE">Feminino</option><option value="MALE">Masculino</option></select></label>
              <label>Modalidade<select value={submissionDraft.submissionType} onChange={(event) => setSubmissionDraft({ ...submissionDraft, submissionType: event.target.value as OfficialDraft["submissionType"] })}><option value="TRACK_400M">Pista de 400 m</option><option value="OPEN_COURSE">Percurso livre</option><option value="OFFICIAL_COMPETITION">Competição oficial</option></select></label>
              <label>Data<input type="date" value={submissionDraft.activityDate} onChange={(event) => setSubmissionDraft({ ...submissionDraft, activityDate: event.target.value })} /></label>
              <label>Marca (MM:SS.CC)<input value={submissionDraft.time} onChange={(event) => setSubmissionDraft({ ...submissionDraft, time: event.target.value })} /></label>
              <label>Cidade<input value={submissionDraft.city} onChange={(event) => setSubmissionDraft({ ...submissionDraft, city: event.target.value })} /></label>
              <label>UF<input maxLength={2} value={submissionDraft.state} onChange={(event) => setSubmissionDraft({ ...submissionDraft, state: event.target.value.toUpperCase() })} /></label>
            </div>
            <div className={styles.recordActions}>
              <button type="button" disabled={busy} onClick={saveSubmission}><Save size={16} />Salvar edição</button>
              <button type="button" disabled={busy} onClick={() => mutateSubmission("PATCH", { action: active.status === "HIDDEN" ? "restore" : "hide" })}>{active.status === "HIDDEN" ? <Eye size={16} /> : <EyeOff size={16} />}{active.status === "HIDDEN" ? "Restaurar" : "Ocultar"}</button>
              <button type="button" className={styles.danger} disabled={busy} onClick={() => mutateSubmission("DELETE")}><Trash2 size={16} />Excluir</button>
            </div>
            <div className={styles.evidence}>
              <strong>Evidências privadas</strong>
              <div><span>Documento de identidade e idade</span><a href={`/api/admin/circuito-virtual/files/${active.document_file_id}`} target="_blank" rel="noreferrer">Baixar documento</a></div>
              {active.medical_certificate_file_id
                ? <div><span>Documento médico enviado antes da mudança de regra · não obrigatório</span><a href={`/api/admin/circuito-virtual/files/${active.medical_certificate_file_id}`} target="_blank" rel="noreferrer">Abrir arquivo histórico</a></div>
                : null}
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
            {!["APPROVED", "HIDDEN"].includes(active.status) && <div className={styles.actions}>
              <button disabled={busy} onClick={() => decide("APPROVED")}><CheckCircle2 />Aprovar</button>
              <button disabled={busy} onClick={() => decide("CORRECTION_REQUESTED")}><ShieldAlert />Pedir correção</button>
              <button disabled={busy} onClick={() => decide("REJECTED")}><XCircle />Rejeitar</button>
            </div>}
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
              <label>Categoria 2026
                <select value={officialDraft.categoryAge} onChange={(event) => setOfficialDraft({ ...officialDraft, categoryAge: event.target.value })}>
                  {CIRCUIT_CATEGORY_AGES.map((age) => <option key={age} value={age}>{circuitCategoryLabel(age)}</option>)}
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
            <div className={styles.recordActions}>
              <button type="button" disabled={busy} onClick={() => mutateOfficial("PATCH", { action: activeOfficial.status === "HIDDEN" ? "restore" : "hide" })}>{activeOfficial.status === "HIDDEN" ? <Eye size={16} /> : <EyeOff size={16} />}{activeOfficial.status === "HIDDEN" ? "Restaurar no ranking" : "Ocultar do ranking"}</button>
              <button type="button" className={styles.danger} disabled={busy} onClick={() => mutateOfficial("DELETE")}><Trash2 size={16} />Excluir definitivamente</button>
            </div>
          </div>
        </div>
      )}

      {creatingOfficial && officialDraft && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Adicionar atleta diretamente">
          <div className={styles.drawer}>
            <button className={styles.close} onClick={closeCreateOfficial}><X size={18} /></button>
            <span className={styles.kicker}>Inclusão administrativa direta</span>
            <h2>Adicionar atleta</h2>
            <p className={styles.syncNotice}>Este fluxo dispensa o cadastro público. Ao salvar, a marca será aprovada e publicada imediatamente no ranking do desafio.</p>
            <div className={styles.officialForm}>
              <label className={styles.fullField}>Nome do atleta<input autoFocus value={officialDraft.publicName} onChange={event=>setOfficialDraft({...officialDraft,publicName:event.target.value})}/></label>
              <label>Categoria 2026<select value={officialDraft.categoryAge} onChange={event=>setOfficialDraft({...officialDraft,categoryAge:event.target.value})}>{CIRCUIT_CATEGORY_AGES.map(age=><option key={age} value={age}>{circuitCategoryLabel(age)}</option>)}</select></label>
              <label>Gênero esportivo<select value={officialDraft.gender} onChange={event=>setOfficialDraft({...officialDraft,gender:event.target.value as "FEMALE"|"MALE"})}><option value="FEMALE">Feminino</option><option value="MALE">Masculino</option></select></label>
              <label>Modalidade<select value={officialDraft.submissionType} onChange={event=>setOfficialDraft({...officialDraft,submissionType:event.target.value as OfficialDraft["submissionType"]})}><option value="TRACK_400M">Pista de 400 m</option><option value="OPEN_COURSE">Percurso livre</option><option value="OFFICIAL_COMPETITION">Competição oficial</option></select></label>
              <label>Data do teste<input type="date" value={officialDraft.activityDate} onChange={event=>setOfficialDraft({...officialDraft,activityDate:event.target.value})}/></label>
              <label>Marca (MM:SS.CC)<input placeholder="03:26.70" value={officialDraft.time} onChange={event=>setOfficialDraft({...officialDraft,time:event.target.value})}/></label>
              <label>Cidade<input value={officialDraft.city} onChange={event=>setOfficialDraft({...officialDraft,city:event.target.value})}/></label>
              <label>UF<input maxLength={2} value={officialDraft.state} onChange={event=>setOfficialDraft({...officialDraft,state:event.target.value.toUpperCase()})}/></label>
              <label className={styles.fullField}>Competição ou identificação do teste<input value={officialDraft.competitionName} onChange={event=>setOfficialDraft({...officialDraft,competitionName:event.target.value})}/></label>
            </div>
            {error&&<p className={styles.error}>{error}</p>}
            <div className={styles.officialActions}><button type="button" onClick={closeCreateOfficial}>Cancelar</button><button type="button" disabled={busy} onClick={createOfficial}><Save size={17}/>{busy?"Salvando...":"Adicionar ao desafio"}</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
