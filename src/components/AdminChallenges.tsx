"use client";

import { useMemo, useState } from "react";
import { Award, BarChart3, BookOpenCheck, CalendarCheck2, Download, FileSearch, Gauge, Lightbulb, Save, Settings2, ShieldCheck, Trash2, WalletCards } from "lucide-react";
import styles from "./AdminChallenges.module.css";

type Row = Record<string, unknown>;
type AdminData = {
  metrics: { pending: number; approved: number; ideas: number; benefitsPending: number };
  submissions: Row[];
  ideas: Row[];
  benefits: Row[];
  athleteOverview: Row[];
  audits: Row[];
  settings: Row;
  badges: Row[];
};

const tabs = [
  ["overview", "Visão geral", Gauge], ["school", "Escolar", BookOpenCheck], ["attendance", "Assiduidade", CalendarCheck2],
  ["evolution", "Evolução", BarChart3], ["ideas", "Ideias", Lightbulb], ["benefits", "Benefícios", WalletCards],
  ["badges", "Conquistas", Award], ["settings", "Configurações", Settings2], ["audit", "Auditoria", ShieldCheck],
] as const;

const statusLabel: Record<string, string> = {
  SUBMITTED: "Enviado", UNDER_REVIEW: "Em revisão", CORRECTION_REQUESTED: "Correção solicitada", APPROVED: "Aprovado",
  COMPLETED: "Concluído", REJECTED: "Rejeitado", PENDING_APPROVAL: "Aguardando aprovação", PLANNING: "Em planejamento",
  IN_DEVELOPMENT: "Em desenvolvimento", IMPLEMENTED: "Implementado", DUPLICATE: "Duplicado",
};

function text(value: unknown, fallback = "—") { return value === null || value === undefined || value === "" ? fallback : String(value); }
function date(value: unknown) { if (!value) return "—"; return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(String(value))); }
function json(value: unknown) { try { return JSON.stringify(value ?? {}, null, 2); } catch { return "{}"; } }

export function AdminChallenges({ initialData }: { initialData: AdminData }) {
  const [data, setData] = useState(initialData);
  const [tab, setTab] = useState<(typeof tabs)[number][0]>("overview");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function mutate(payload: Row) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/challenges", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json();
      if (!response.ok || !body.ok) throw new Error(body.error || "Não foi possível salvar.");
      setData(body.data); setMessage("Alteração salva e registrada na auditoria.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao salvar."); }
    finally { setBusy(false); }
  }

  const school = useMemo(() => data.submissions.filter((row) => row.type === "SCHOOL"), [data]);
  const attendance = useMemo(() => data.submissions.filter((row) => row.type === "ATTENDANCE"), [data]);

  return <main className={`admin-panel ${styles.panel}`}>
    <header className={styles.hero}><div><span className="eyebrow">módulo gamificado</span><h1>Gestão de Desafios</h1><p>Validação humana, regras configuráveis e histórico rastreável para cada conquista 11RUN.</p></div><a className={styles.export} href="/api/admin/challenges/export"><Download size={17}/>Exportar relatório</a></header>
    <nav className={styles.tabs} aria-label="Seções da gestão de desafios">{tabs.map(([id,label,Icon]) => <button key={id} type="button" className={tab === id ? styles.active : ""} onClick={() => setTab(id)}><Icon size={16}/>{label}</button>)}</nav>
    {message ? <p className={styles.message} role="status">{message}</p> : null}

    {tab === "overview" ? <section className={styles.section}>
      <div className={styles.metrics}>{[["Pendências",data.metrics.pending],["Aprovados",data.metrics.approved],["Ideias",data.metrics.ideas],["Benefícios pendentes",data.metrics.benefitsPending]].map(([label,value])=><article key={String(label)}><span>{label}</span><strong>{value}</strong></article>)}</div>
      <div className={styles.split}><article><h2>Fila prioritária</h2>{data.submissions.slice(0,6).map(row=><div className={styles.line} key={text(row.id)}><span><strong>{text(row.athlete_name)}</strong><small>{text(row.challenge_name)} · {date(row.submitted_at)}</small></span><b data-status={text(row.status)}>{statusLabel[text(row.status)] ?? text(row.status)}</b></div>)}{!data.submissions.length?<p className={styles.empty}>Nenhuma entrega registrada.</p>:null}</article><article><h2>Atletas e pontuação</h2>{data.athleteOverview.slice(0,8).map(row=>{const score=(row.score??{}) as Row; return <div className={styles.line} key={text(row.id)}><span><strong>{text(row.athlete_name)}</strong><small>{text(score.name)}</small></span><b>{text(score.score)} pts</b></div>})}</article></div>
    </section> : null}

    {(tab === "school" || tab === "attendance") ? <ReviewList rows={tab === "school" ? school : attendance} busy={busy} onReview={mutate}/> : null}

    {tab === "evolution" ? <section className={styles.section}><header className={styles.heading}><div><span className="eyebrow">desempenho individual</span><h2>Evolução nos 1.000 m</h2></div><p>Somente a trajetória pessoal do atleta é exibida, sem comparação pública.</p></header><div className={styles.tableWrap}><table><thead><tr><th>Atleta</th><th>Testes válidos</th><th>Primeira marca</th><th>Melhor marca</th><th>Evolução</th><th>Nível</th></tr></thead><tbody>{data.athleteOverview.map(row=>{const evolution=(row.evolution??{}) as Row;const score=(row.score??{}) as Row;return <tr key={text(row.id)}><td><strong>{text(row.athlete_name)}</strong></td><td>{text(evolution.totalTests,"0")}</td><td>{text(evolution.firstTime)}</td><td>{text(evolution.bestTime)}</td><td>{evolution.evolutionFromFirst!==null&&evolution.evolutionFromFirst!==undefined?`${text(evolution.evolutionFromFirst)}%`:"—"}</td><td>{text(score.name)}</td></tr>})}</tbody></table></div></section> : null}

    {tab === "ideas" ? <section className={styles.section}><header className={styles.heading}><div><span className="eyebrow">cocriação</span><h2>Ideias dos atletas</h2></div></header><div className={styles.cards}>{data.ideas.map(row=><form className={styles.reviewCard} key={text(row.id)} action={async formData=>{await mutate({action:"review-idea",id:row.id,status:formData.get("status"),response:formData.get("response")})}}><header><span>{text(row.category)}</span><b>{statusLabel[text(row.status)]??text(row.status)}</b></header><h3>{text(row.title)}</h3><small>{text(row.athlete_name)} · {date(row.created_at)}</small><p>{text(row.description)}</p><dl><dt>Problema</dt><dd>{text(row.problem)}</dd><dt>Melhoria esperada</dt><dd>{text(row.expected_improvement)}</dd></dl><label>Status<select name="status" defaultValue={text(row.status)}>{["SUBMITTED","UNDER_REVIEW","APPROVED","PLANNING","IN_DEVELOPMENT","IMPLEMENTED","REJECTED","DUPLICATE"].map(status=><option key={status} value={status}>{statusLabel[status]}</option>)}</select></label><label>Resposta da equipe<textarea name="response" defaultValue={text(row.admin_response,"")} rows={3}/></label><button disabled={busy}><Save size={16}/>Salvar análise</button></form>)}</div></section> : null}

    {tab === "benefits" ? <section className={styles.section}><header className={styles.heading}><div><span className="eyebrow">aprovação final</span><h2>Benefícios projetados</h2></div><p>Nenhum valor financeiro é alterado automaticamente.</p></header><div className={styles.cards}>{data.benefits.map(row=><form className={styles.reviewCard} key={text(row.id)} action={async formData=>{await mutate({action:"review-benefit",id:row.id,approved:formData.get("decision")==="approve",validFrom:formData.get("validFrom"),validUntil:formData.get("validUntil"),notes:formData.get("notes")})}}><header><span>{text(row.source_type)}</span><b>{statusLabel[text(row.status)]??text(row.status)}</b></header><h3>{text(row.athlete_name)}</h3><strong className={styles.large}>{text(row.percentage)}%</strong><p>Valor atual: R$ {(Number(row.previous_value_cents??0)/100).toFixed(2)} · projetado: R$ {(Number(row.projected_value_cents??0)/100).toFixed(2)}</p><div className={styles.formGrid}><label>Vigência inicial<input name="validFrom" type="date" defaultValue={text(row.valid_from,"")}/></label><label>Vigência final<input name="validUntil" type="date" defaultValue={text(row.valid_until,"")}/></label></div><label>Justificativa<textarea name="notes" rows={2}/></label><div className={styles.actions}><button name="decision" value="approve" disabled={busy}>Aprovar</button><button className={styles.ghost} name="decision" value="reject" disabled={busy}>Rejeitar</button></div></form>)}</div></section> : null}

    {tab === "badges" ? <section className={styles.section}><header className={styles.heading}><div><span className="eyebrow">gamificação</span><h2>Catálogo de conquistas</h2></div></header><form className={styles.createBadge} action={async formData=>{await mutate({action:"create-badge",name:formData.get("name"),description:formData.get("description"),icon:formData.get("icon"),challengeType:formData.get("challengeType"),requirement:formData.get("requirement")})}}><label>Nova conquista<input name="name" minLength={3} placeholder="Nome do badge" required/></label><label>Dimensão<select name="challengeType">{["SCHOOL","ATTENDANCE","EVOLUTION","IDEAS","GENERAL"].map(type=><option key={type}>{type}</option>)}</select></label><label>Ícone<input name="icon" defaultValue="award"/></label><label>Descrição<input name="description" minLength={8} required/></label><label>Requisito<input name="requirement" placeholder="Como desbloquear"/></label><button disabled={busy}><Award size={16}/>Criar conquista</button></form><div className={styles.cards}>{data.badges.map(row=><form className={styles.reviewCard} key={text(row.id)} action={async formData=>{await mutate({action:"update-badge",id:row.id,name:formData.get("name"),description:formData.get("description"),icon:formData.get("icon"),active:formData.get("active")==="on"})}}><header><span>{text(row.challenge_type)}</span><Award/></header><label>Nome<input name="name" defaultValue={text(row.name)}/></label><label>Descrição<textarea name="description" defaultValue={text(row.description)} rows={3}/></label><label>Ícone<input name="icon" defaultValue={text(row.icon)}/></label><label className={styles.check}><input type="checkbox" name="active" defaultChecked={Boolean(row.active)}/>Ativa</label><button disabled={busy}><Save size={16}/>Salvar conquista</button></form>)}</div></section> : null}

    {tab === "settings" ? <SettingsForm settings={data.settings} busy={busy} onSave={mutate}/> : null}

    {tab === "audit" ? <section className={styles.section}><header className={styles.heading}><div><span className="eyebrow">rastreabilidade</span><h2>Histórico de auditoria</h2></div></header><div className={styles.tableWrap}><table><thead><tr><th>Data</th><th>Ator</th><th>Ação</th><th>Entidade</th><th>Justificativa</th></tr></thead><tbody>{data.audits.map(row=><tr key={text(row.id)}><td>{date(row.created_at)}</td><td>{text(row.actor)}</td><td>{text(row.action)}</td><td>{text(row.entity_type)} · {text(row.entity_id)}</td><td>{text(row.justification)}</td></tr>)}</tbody></table></div></section> : null}
  </main>;
}

function ReviewList({rows,busy,onReview}:{rows:Row[];busy:boolean;onReview:(payload:Row)=>Promise<void>}) {
  const [athlete, setAthlete] = useState("");
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");
  const filtered = rows.filter((row) => (!athlete || text(row.athlete_name, "").toLowerCase().includes(athlete.toLowerCase())) && (!period || text(row.period_reference, "").includes(period)) && (!status || row.status === status));
  return <section className={styles.section}><header className={styles.heading}><div><span className="eyebrow">revisão humana obrigatória</span><h2>Entregas para análise</h2></div><p>Confira documento, leitura assistiva, confiança e alertas antes de decidir.</p></header><div className={styles.filterBar}><label>Atleta<input value={athlete} onChange={event=>setAthlete(event.target.value)} placeholder="Buscar atleta"/></label><label>Período<input value={period} onChange={event=>setPeriod(event.target.value)} placeholder="2026-T2 ou 2026-07"/></label><label>Status<select value={status} onChange={event=>setStatus(event.target.value)}><option value="">Todos</option>{["SUBMITTED","UNDER_REVIEW","CORRECTION_REQUESTED","APPROVED","COMPLETED","REJECTED"].map(item=><option key={item} value={item}>{statusLabel[item]}</option>)}</select></label></div><div className={styles.cards}>{filtered.map(row=>{const normalized=(row.normalized_data??{}) as Row;const submitted=(row.submitted_data??{}) as Row;const warnings=Array.isArray(row.warnings)?row.warnings:[];return <form className={styles.reviewCard} key={text(row.id)} action={async formData=>{await onReview({action:"review-submission",id:row.id,status:formData.get("status"),correctedValue:formData.get("correctedValue"),notes:formData.get("notes")})}}><header><span>{text(row.period_reference)}</span><b>{statusLabel[text(row.status)]??text(row.status)}</b></header><h3>{text(row.athlete_name)}</h3><small>{date(row.submitted_at)} · {text(row.original_name)}</small><a className={styles.file} href={`/api/admin/challenges/files/${text(row.file_id)}`} target="_blank"><FileSearch size={16}/>Abrir documento privado</a><div className={styles.aiBox}><span>Leitura assistiva · {row.confidence_score!==null&&row.confidence_score!==undefined?`${Math.round(Number(row.confidence_score)*100)}% de confiança`:"aguardando"}</span><strong>{normalized.average!==undefined?`Média normalizada: ${Number(normalized.average).toFixed(2)}`:`Assiduidade informada: ${text(submitted.attendance)}%`}</strong>{warnings.map((warning,index)=><small key={index}>{String(warning)}</small>)}</div><label>Valor confirmado<input name="correctedValue" type="number" step="0.01" min="0" defaultValue={normalized.average!==undefined?Number(normalized.average):Number(submitted.attendance??0)}/></label><label>Decisão<select name="status" defaultValue={text(row.status)}>{["UNDER_REVIEW","CORRECTION_REQUESTED","APPROVED","COMPLETED","REJECTED"].map(item=><option key={item} value={item}>{statusLabel[item]}</option>)}</select></label><label>Notas da revisão<textarea name="notes" rows={3}/></label><div className={styles.actions}><button disabled={busy}><Save size={16}/>Registrar decisão</button><button type="button" className={styles.danger} disabled={busy} onClick={async()=>{if(window.confirm("Excluir permanentemente este boletim e o arquivo privado?"))await onReview({action:"delete-submission",id:row.id})}}><Trash2 size={16}/>Excluir boletim</button></div></form>})}{!filtered.length?<p className={styles.empty}>Nenhuma entrega corresponde aos filtros.</p>:null}</div></section>;
}

function SettingsForm({settings,busy,onSave}:{settings:Row;busy:boolean;onSave:(payload:Row)=>Promise<void>}) {
  return <section className={styles.section}><header className={styles.heading}><div><span className="eyebrow">regras do sistema</span><h2>Configuração central</h2></div><p>Alterações ficam registradas na auditoria e passam a valer nas próximas análises.</p></header><form className={styles.settings} action={async formData=>{try{await onSave({action:"update-settings",configuration:{aiConfidenceThreshold:Number(formData.get("confidence")),maximumCombinedBenefit:Number(formData.get("maximum")),ideaLimitPerWeek:Number(formData.get("ideas")),ideaCycle:String(formData.get("ideaCycle")),retentionDays:Number(formData.get("retention")),schoolBands:JSON.parse(String(formData.get("schoolBands"))),attendanceBands:JSON.parse(String(formData.get("attendanceBands"))),scoreWeights:JSON.parse(String(formData.get("scoreWeights")))}})}catch{}}}><div className={styles.formGrid}><label>Confiança mínima da IA<input name="confidence" type="number" min="0.5" max="1" step="0.01" defaultValue={Number(settings.aiConfidenceThreshold)}/></label><label>Limite acumulado (%)<input name="maximum" type="number" min="0" max="100" defaultValue={Number(settings.maximumCombinedBenefit)}/></label><label>Ideias por semana<input name="ideas" type="number" min="1" max="50" defaultValue={Number(settings.ideaLimitPerWeek)}/></label><label>Ciclo do desafio de ideias<select name="ideaCycle" defaultValue={text(settings.ideaCycle,"quarterly")}><option value="monthly">Mensal</option><option value="quarterly">Trimestral</option><option value="semiannual">Semestral</option><option value="annual">Anual</option></select></label><label>Retenção de arquivos (dias)<input name="retention" type="number" min="30" max="3650" defaultValue={Number(settings.retentionDays)}/></label></div><label>Faixas do desafio escolar <small>JSON configurável: mínimo, máximo, benefício e pontos</small><textarea name="schoolBands" rows={10} defaultValue={json(settings.schoolBands)}/></label><label>Faixas de assiduidade<textarea name="attendanceBands" rows={10} defaultValue={json(settings.attendanceBands)}/></label><label>Pesos da pontuação<textarea name="scoreWeights" rows={8} defaultValue={json(settings.scoreWeights)}/></label><button disabled={busy}><Save size={16}/>Salvar configurações</button></form></section>;
}
