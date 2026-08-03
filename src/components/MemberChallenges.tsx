"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Award,
  Bell,
  BookOpenCheck,
  CalendarCheck2,
  ChevronRight,
  Flame,
  Lightbulb,
  Medal,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Upload,
  WalletCards,
  X
} from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "./MemberChallenges.module.css";

type Row = Record<string, unknown>;
type ChallengeDashboard = {
  score: { score: number; name: string; next: string | null; pointsToNext: number };
  benefit: { currentValueCents: number; schoolPercent: number; attendancePercent: number; totalPercent: number; projectedValueCents: number; applicationDate: string | null };
  settings: { maximumCombinedBenefit: number; ideaLimitPerWeek: number; ideaCycle: "monthly" | "quarterly" | "semiannual" | "annual" };
  cards: {
    school: { status: string; latest: Row | null };
    attendance: { status: string; latest: Row | null; approvedMonths: number; currentStreak: number; bestAttendance: number | null };
    evolution: { status: string; marks: Array<{ id: string; time: string; date: string; location: string; seconds: number }>; totalTests: number; bestTime: string | null; bestDate: string | null; evolutionFromFirst: number | null; evolutionLastTwo: number | null; differenceSeconds: number | null; trend: string };
    ideas: { status: string; rows: Row[]; total: number; valid: number; approved: number; developing: number; implemented: number; position: number | null };
  };
  badges: { earned: Row[]; all: Row[] };
  notifications: Row[];
  history: Row[];
  submissions: Row[];
  ideaRanking: Array<{ position: number; displayName: string; validIdeas: number; implemented: number }>;
  ideaCategories: string[];
};

type Modal = "school" | "attendance" | "evolution" | "ideas" | "achievements" | null;

const statusLabels: Record<string, string> = {
  NOT_STARTED: "Não iniciado",
  IN_PROGRESS: "Em andamento",
  SUBMITTED: "Enviado",
  UNDER_REVIEW: "Em análise",
  CORRECTION_REQUESTED: "Aguardando correção",
  APPROVED: "Aprovado",
  COMPLETED: "Concluído",
  REJECTED: "Revisado"
};

function statusProgress(status: string) {
  return { NOT_STARTED: 0, IN_PROGRESS: 45, SUBMITTED: 65, UNDER_REVIEW: 78, CORRECTION_REQUESTED: 58, APPROVED: 100, COMPLETED: 100, REJECTED: 35 }[status] ?? 0;
}

function money(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function date(value: unknown) {
  if (!value) return "Ainda não atualizado";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(String(value)));
}

function secondsLabel(value: number) {
  const minutes = Math.floor(value / 60);
  return `${minutes}:${(value - minutes * 60).toFixed(2).padStart(5, "0")}`;
}

function ChallengeCard({ icon, title, text, status, detail, points, updatedAt, onOpen }: {
  icon: React.ReactNode;
  title: string;
  text: string;
  status: string;
  detail: string;
  points: string;
  updatedAt?: unknown;
  onOpen: () => void;
}) {
  const progress = statusProgress(status);
  return <article className={`${styles.challengeCard} ${progress === 100 ? styles.complete : ""}`}>
    <header><span className={styles.cardIcon}>{icon}</span><span className={styles.status}>{statusLabels[status] ?? status}</span></header>
    <div><h3>{title}</h3><p>{text}</p></div>
    <div className={styles.cardResult}><strong>{detail}</strong><span>{points}</span></div>
    <div className={styles.progress} aria-label={`${progress}% concluído`}><i style={{ width: `${progress}%` }} /></div>
    <footer><small>Atualizado: {date(updatedAt)}</small><button type="button" onClick={onOpen}>Ver desafio <ChevronRight size={16} /></button></footer>
  </article>;
}

function FileField({ accept, onFile }: { accept: string; onFile: (file: File | null) => void }) {
  return <label className={styles.fileField}><Upload size={20} /><span><strong>Escolher documento</strong><small>Até 10 MB</small></span><input type="file" accept={accept} onChange={(event) => onFile(event.target.files?.[0] ?? null)} required /></label>;
}

export function MemberChallenges({ initialData, readOnly = false }: { initialData: ChallengeDashboard; readOnly?: boolean }) {
  const [data, setData] = useState(initialData);
  const [modal, setModal] = useState<Modal>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [schoolFile, setSchoolFile] = useState<File | null>(null);
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [ideaFile, setIdeaFile] = useState<File | null>(null);
  const chartData = useMemo(() => data.cards.evolution.marks.map((mark) => ({ date: new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${mark.date}T12:00:00Z`)), seconds: mark.seconds, time: mark.time })), [data.cards.evolution.marks]);

  async function refresh() {
    const response = await fetch("/api/members/challenges", { cache: "no-store" });
    const result = await response.json();
    if (response.ok) setData(result.dashboard);
  }

  async function upload(file: File, purpose: string) {
    const form = new FormData();
    form.set("file", file);
    form.set("purpose", purpose);
    const response = await fetch("/api/members/challenges/upload", { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Falha no upload.");
    return result.file.id as string;
  }

  function success(text: string) {
    setMessage(text);
    setCelebrate(true);
    window.setTimeout(() => setCelebrate(false), 1800);
  }

  async function submitSchool(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!schoolFile) return setMessage("Selecione o boletim.");
    setLoading(true); setMessage("Enviando e analisando o documento…");
    try {
      const form = new FormData(event.currentTarget);
      const fileId = await upload(schoolFile, "SCHOOL_REPORT");
      const response = await fetch("/api/members/challenges/school", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quarter: Number(form.get("quarter")), year: Number(form.get("year")), observation: form.get("observation"), guardianAccepted: form.get("guardianAccepted") === "on", fileId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Falha ao enviar boletim.");
      await refresh(); success(result.analysis?.ok ? "Boletim recebido. A leitura assistiva foi concluída e aguarda revisão." : "Boletim recebido. A equipe fará a leitura manual.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao enviar boletim."); }
    finally { setLoading(false); }
  }

  async function submitAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!attendanceFile) return setMessage("Selecione a planilha.");
    setLoading(true); setMessage("Enviando planilha…");
    try {
      const form = new FormData(event.currentTarget);
      const fileId = await upload(attendanceFile, "ATTENDANCE_PLAN");
      const response = await fetch("/api/members/challenges/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ month: Number(form.get("month")), year: Number(form.get("year")), attendance: Number(form.get("attendance")), observation: form.get("observation"), truthAccepted: form.get("truthAccepted") === "on", fileId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Falha ao enviar assiduidade.");
      await refresh(); success("Assiduidade enviada. A informação aguarda validação da equipe.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao enviar assiduidade."); }
    finally { setLoading(false); }
  }

  async function submitIdea(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage("Enviando sua ideia…");
    try {
      const form = new FormData(event.currentTarget);
      const imageFileId = ideaFile ? await upload(ideaFile, "IDEA_IMAGE") : undefined;
      const response = await fetch("/api/members/challenges/ideas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), category: form.get("category"), description: form.get("description"), problem: form.get("problem"), expectedImprovement: form.get("expectedImprovement"), imageFileId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Falha ao enviar ideia.");
      await refresh(); success("Ideia enviada. Obrigado por ajudar a construir o 11RUN!");
      event.currentTarget.reset(); setIdeaFile(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao enviar ideia."); }
    finally { setLoading(false); }
  }

  const schoolLatest = data.cards.school.latest;
  const schoolNormalized = (schoolLatest?.normalized_data ?? {}) as Row;
  const schoolSubmitted = (schoolLatest?.submitted_data ?? {}) as Row;
  const attendanceLatest = data.cards.attendance.latest;
  const attendanceSubmitted = (attendanceLatest?.submitted_data ?? {}) as Row;
  const earnedIds = new Set(data.badges.earned.map((badge) => String(badge.id)));
  const currentYear = new Date().getFullYear();

  return <section className={styles.module} aria-labelledby="member-challenges-title">
    {celebrate ? <div className={styles.confetti} aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div> : null}
    <header className={styles.moduleHeader}>
      <div><span className="eyebrow">formação completa</span><h2 id="member-challenges-title">Desafios 11RUN</h2><p>Complete seus desafios, acompanhe sua evolução e ajude a construir o futuro do projeto.</p></div>
      <button className={styles.achievementsButton} type="button" onClick={() => { setModal("achievements"); setMessage(""); }}><Trophy size={20} /><span>Minhas Conquistas</span><strong>{data.badges.earned.length}</strong></button>
    </header>

    <div className={styles.scorePanel}>
      <div className={styles.scoreDial} style={{ "--score": `${Math.min(100, data.score.score / 7)}%` } as React.CSSProperties}><strong>{data.score.score}</strong><span>Score 11RUN</span></div>
      <div><span className="eyebrow">nível atual</span><h3>{data.score.name}</h3><p>Seu score representa participação e compromisso. Ele não é um ranking de talento e nunca reduz sua ajuda de custo.</p><div className={styles.levelProgress}><i style={{ width: data.score.next ? `${Math.max(8, 100 - Math.min(100, data.score.pointsToNext / 2.5))}%` : "100%" }} /></div><small>{data.score.next ? `${data.score.pointsToNext} pontos para ${data.score.next}` : "Nível máximo conquistado"}</small></div>
      <div className={styles.scoreBadges}>{data.badges.earned.slice(0, 3).map((badge) => <span key={String(badge.id)}><Medal size={16} />{String(badge.name)}</span>)}{!data.badges.earned.length ? <span><Target size={16} />Sua primeira conquista está próxima</span> : null}</div>
    </div>

    <div className={styles.cards}>
      <ChallengeCard icon={<BookOpenCheck />} title="Desafio Escolar" text="Transforme dedicação aos estudos em novas conquistas." status={data.cards.school.status} detail={schoolNormalized.average !== undefined && schoolNormalized.average !== null ? `Média ${Number(schoolNormalized.average).toFixed(1)}` : "Envie seu boletim"} points={Number(schoolLatest?.suggested_benefit_percent ?? schoolSubmitted.approvedBenefitPercent ?? 0) ? `Até ${Number(schoolLatest?.suggested_benefit_percent ?? schoolSubmitted.approvedBenefitPercent)}% projetado` : "Compromisso escolar"} updatedAt={schoolLatest?.updated_at} onOpen={() => { setModal("school"); setMessage(""); }} />
      <ChallengeCard icon={<CalendarCheck2 />} title="Desafio de Assiduidade" text="Registre sua presença e constância nos treinamentos." status={data.cards.attendance.status} detail={attendanceSubmitted.attendance !== undefined ? `${attendanceSubmitted.attendance}% no mês` : "Envie sua planilha"} points={data.cards.attendance.currentStreak ? `${data.cards.attendance.currentStreak} mês(es) em sequência` : attendanceSubmitted.suggestedBenefitPercent ? `${attendanceSubmitted.suggestedBenefitPercent}% projetado` : "Disciplina e constância"} updatedAt={attendanceLatest?.updated_at} onOpen={() => { setModal("attendance"); setMessage(""); }} />
      <ChallengeCard icon={<TrendingUp />} title="Minha Evolução" text="Aqui, sua principal competição é com você mesmo." status={data.cards.evolution.status} detail={data.cards.evolution.bestTime ?? "Primeiro teste"} points={data.cards.evolution.evolutionFromFirst !== null ? `${data.cards.evolution.evolutionFromFirst}% de evolução` : `${data.cards.evolution.totalTests} teste(s)`} updatedAt={data.cards.evolution.bestDate} onOpen={() => { setModal("evolution"); setMessage(""); }} />
      <ChallengeCard icon={<Lightbulb />} title="Ideias para o Projeto" text="Sua voz ajuda a construir o futuro do 11RUN." status={data.cards.ideas.status} detail={`${data.cards.ideas.total} ideia(s)`} points={data.cards.ideas.position ? `${data.cards.ideas.position}ª posição no desafio` : "Envie a primeira ideia"} updatedAt={data.cards.ideas.rows[0]?.created_at} onOpen={() => { setModal("ideas"); setMessage(""); }} />
    </div>

    <div className={styles.bottomGrid}>
      <article className={styles.benefitPanel}><header><WalletCards /><div><span className="eyebrow">sem aplicação automática</span><h3>Benefício projetado</h3></div></header><dl><div><dt>Ajuda atual</dt><dd>{money(data.benefit.currentValueCents)}</dd></div><div><dt>Escolar aprovado</dt><dd>+{data.benefit.schoolPercent}%</dd></div><div><dt>Assiduidade aprovada</dt><dd>+{data.benefit.attendancePercent}%</dd></div><div><dt>Total aprovado</dt><dd>+{data.benefit.totalPercent}%</dd></div><div className={styles.projected}><dt>Novo valor projetado</dt><dd>{money(data.benefit.projectedValueCents)}</dd></div></dl><p>{data.benefit.applicationDate ? `Aplicação prevista a partir de ${date(`${data.benefit.applicationDate}T12:00:00Z`)}. ` : ""}Limite acumulado: {data.settings.maximumCombinedBenefit}%. A equipe administrativa sempre faz a aprovação final.</p></article>
      <article className={styles.notificationPanel}><header><Bell /><div><span className="eyebrow">atualizações</span><h3>Notificações</h3></div></header><div>{data.notifications.slice(0, 4).map((item) => <button key={String(item.id)} type="button" onClick={async () => { await fetch("/api/members/challenges", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notificationId: item.id }) }); await refresh(); }}><span>{String(item.title)}</span><small>{String(item.message)}</small></button>)}{!data.notifications.length ? <p>Suas novas conquistas e aprovações aparecerão aqui.</p> : null}</div></article>
    </div>

    {modal ? <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-label="Detalhes do desafio"><header><div><span className="eyebrow">desafios 11run</span><h2>{modal === "school" ? "Desafio Escolar" : modal === "attendance" ? "Desafio de Assiduidade" : modal === "evolution" ? "Minha Evolução" : modal === "ideas" ? "Ideias para o Projeto" : "Minhas Conquistas"}</h2></div><button type="button" onClick={() => setModal(null)} aria-label="Fechar"><X /></button></header>
      {message ? <p className={styles.message} role="status"><Sparkles size={17} />{message}</p> : null}

      {modal === "school" ? <div className={styles.modalBody}><div className={styles.context}><BookOpenCheck /><p>Envie o histórico ou boletim do trimestre. A IA organiza uma leitura assistiva, mas a equipe confirma qualquer benefício.</p></div>{schoolLatest ? <div className={styles.latest}><span>{statusLabels[data.cards.school.status]}</span><strong>{schoolNormalized.average !== undefined && schoolNormalized.average !== null ? `Média identificada: ${Number(schoolNormalized.average).toFixed(2)}` : "Leitura em revisão"}</strong><small>Confiança: {schoolLatest.confidence_score !== null && schoolLatest.confidence_score !== undefined ? `${Math.round(Number(schoolLatest.confidence_score) * 100)}%` : "aguardando"} · {String(schoolLatest.period_reference)}</small></div> : null}{!readOnly ? <form className={styles.form} onSubmit={submitSchool}><div className={styles.formGrid}><label><span>Trimestre</span><select name="quarter" required>{[1,2,3,4].map((quarter) => <option key={quarter} value={quarter}>{quarter}º trimestre</option>)}</select></label><label><span>Ano letivo</span><select name="year" defaultValue={currentYear}>{[currentYear - 1,currentYear,currentYear + 1].map((year) => <option key={year}>{year}</option>)}</select></label></div><FileField accept=".jpg,.jpeg,.png,.pdf" onFile={setSchoolFile} /><label><span>Observação opcional</span><textarea name="observation" rows={3} /></label><label className={styles.check}><input type="checkbox" name="guardianAccepted" required /><span>O responsável autoriza a análise privada deste documento escolar.</span></label><button className="button primary" disabled={loading}><Upload size={17} />{loading ? "Analisando…" : "Enviar boletim"}</button></form> : null}</div> : null}

      {modal === "attendance" ? <div className={styles.modalBody}><div className={styles.context}><Flame /><p>Envie a planilha do último mês e informe a assiduidade em intervalos de 10%. A equipe fará a validação.</p></div><div className={styles.evolutionStats}><div><span>Meses aprovados</span><strong>{data.cards.attendance.approvedMonths}</strong><small>histórico validado</small></div><div><span>Sequência atual</span><strong>{data.cards.attendance.currentStreak}</strong><small>mês(es) consecutivo(s)</small></div><div><span>Melhor assiduidade</span><strong>{data.cards.attendance.bestAttendance !== null ? `${data.cards.attendance.bestAttendance}%` : "—"}</strong><small>somente registros aprovados</small></div></div>{attendanceLatest ? <div className={styles.latest}><span>{statusLabels[data.cards.attendance.status]}</span><strong>{String(attendanceSubmitted.attendance ?? 0)}% de assiduidade autodeclarada</strong><small>{String(attendanceLatest.period_reference)} · aguardando validação quando aplicável</small></div> : null}{!readOnly ? <form className={styles.form} onSubmit={submitAttendance}><div className={styles.formGrid}><label><span>Mês</span><select name="month" defaultValue={new Date().getMonth() + 1}>{Array.from({length:12},(_,index)=><option key={index+1} value={index+1}>{new Intl.DateTimeFormat("pt-BR",{month:"long"}).format(new Date(2026,index,1))}</option>)}</select></label><label><span>Ano</span><select name="year" defaultValue={currentYear}>{[currentYear-1,currentYear,currentYear+1].map((year)=><option key={year}>{year}</option>)}</select></label><label><span>Assiduidade</span><select name="attendance">{Array.from({length:11},(_,index)=><option key={index} value={index*10}>{index*10}%</option>)}</select></label></div><FileField accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx,.csv" onFile={setAttendanceFile} /><label><span>Observação opcional</span><textarea name="observation" rows={3} /></label><label className={styles.check}><input type="checkbox" name="truthAccepted" required /><span>Confirmo que as informações enviadas são verdadeiras.</span></label><button className="button primary" disabled={loading}><Upload size={17} />{loading ? "Enviando…" : "Enviar assiduidade"}</button></form> : null}</div> : null}

      {modal === "evolution" ? <div className={styles.modalBody}><div className={styles.evolutionStats}><div><span>Melhor marca</span><strong>{data.cards.evolution.bestTime ?? "—"}</strong><small>{data.cards.evolution.bestDate ? date(`${data.cards.evolution.bestDate}T12:00:00Z`) : "Registre seu primeiro teste"}</small></div><div><span>Desde o primeiro teste</span><strong>{data.cards.evolution.evolutionFromFirst !== null ? `${data.cards.evolution.evolutionFromFirst}%` : "—"}</strong><small>{data.cards.evolution.totalTests} teste(s) válido(s)</small></div><div><span>Últimos dois testes</span><strong>{data.cards.evolution.differenceSeconds !== null && data.cards.evolution.differenceSeconds > 0 ? `${data.cards.evolution.differenceSeconds}s mais rápido` : "Consistência"}</strong><small>Nenhuma comparação com outros atletas</small></div></div>{chartData.length ? <div className={styles.chart}><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{top:16,right:18,bottom:4,left:0}}><CartesianGrid vertical={false} strokeDasharray="2 6" /><XAxis dataKey="date" axisLine={false} tickLine={false} /><YAxis reversed width={54} axisLine={false} tickLine={false} tickFormatter={(value)=>secondsLabel(Number(value))} domain={["dataMin - 3","dataMax + 3"]}/><Tooltip formatter={(value)=>[secondsLabel(Number(value)),"1.000 m"]}/><Line type="monotone" dataKey="seconds" stroke="#7e4825" strokeWidth={3} dot={{r:4}} /></LineChart></ResponsiveContainer></div> : <p className={styles.empty}>Seu primeiro resultado começará a construir este gráfico.</p>}<div className={styles.timeline}>{data.cards.evolution.marks.map((mark,index)=><div key={mark.id}><i>{index+1}</i><span>{date(`${mark.date}T12:00:00Z`)}</span><strong>{mark.time}</strong><small>{mark.location}</small></div>)}</div><p className={styles.positive}>{data.cards.evolution.totalTests < 2 ? "Seu primeiro resultado já está registrado. O próximo teste começará a mostrar sua evolução." : (data.cards.evolution.evolutionFromFirst ?? 0) > 0 ? `Você já evoluiu ${data.cards.evolution.evolutionFromFirst}% desde o primeiro teste. Continue construindo sua história!` : "Você mantém uma ótima consistência. Cada treino prepara sua próxima evolução."}</p></div> : null}

      {modal === "ideas" ? <div className={styles.modalBody}><div className={styles.ideaMetrics}>{[["Enviadas",data.cards.ideas.total],["Válidas",data.cards.ideas.valid],["Em desenvolvimento",data.cards.ideas.developing],["Implementadas",data.cards.ideas.implemented]].map(([label,value])=><div key={String(label)}><span>{label}</span><strong>{value}</strong></div>)}</div>{!readOnly ? <form className={styles.form} onSubmit={submitIdea}><label><span>Título da ideia</span><input name="title" minLength={5} maxLength={120} required /></label><label><span>Categoria</span><select name="category">{data.ideaCategories.map((category)=><option key={category}>{category}</option>)}</select></label><label><span>Descreva sua ideia</span><textarea name="description" minLength={20} rows={4} required /></label><label><span>Qual problema ela resolve?</span><textarea name="problem" minLength={10} rows={3} required /></label><label><span>Como ela melhora o projeto?</span><textarea name="expectedImprovement" minLength={10} rows={3} required /></label><FileField accept=".jpg,.jpeg,.png,.pdf" onFile={setIdeaFile} /><button className="button primary" disabled={loading}><Lightbulb size={17} />{loading ? "Enviando…" : "Enviar ideia"}</button></form> : null}<div className={styles.ideaHistory}>{data.cards.ideas.rows.map((idea)=><article key={String(idea.id)}><span>{String(idea.category)}</span><strong>{String(idea.title)}</strong><small>{String(idea.status)} · {date(idea.created_at)}</small>{idea.admin_response ? <p>Resposta da equipe: {String(idea.admin_response)}</p> : null}</article>)}</div>{data.ideaRanking.length ? <section className={styles.ideaRanking}><h3>Desafio de ideias válidas</h3><p>Somente ideias validadas pontuam. Os nomes são abreviados para proteger os atletas.</p>{data.ideaRanking.slice(0,5).map((row)=><div key={`${row.position}-${row.displayName}`}><i>{row.position}</i><strong>{row.displayName}</strong><span>{row.validIdeas} ideia(s)</span></div>)}</section> : null}</div> : null}

      {modal === "achievements" ? <div className={styles.modalBody}><div className={styles.achievementSummary}><Award /><div><strong>{data.badges.earned.length} conquistas desbloqueadas</strong><span>{data.score.name} · Score {data.score.score}</span></div></div><div className={styles.badgeGrid}>{data.badges.all.map((badge)=>{const unlocked=earnedIds.has(String(badge.id)); const earned=data.badges.earned.find((item)=>item.id===badge.id); return <article key={String(badge.id)} className={unlocked?styles.unlocked:styles.locked}><span><Medal /></span><strong>{String(badge.name)}</strong><p>{String(badge.description)}</p><small>{unlocked?`Conquistado em ${date(earned?.earned_at)}`:"Ainda bloqueado"}</small></article>})}</div><section className={styles.scoreHistory}><h3>Histórico do Score</h3>{data.history.map((item)=><div key={`${item.created_at}-${item.score}`}><span>{date(item.created_at)}</span><strong>{String(item.score)} pontos</strong><small>{String(item.level)}</small></div>)}</section></div> : null}
    </section></div> : null}
  </section>;
}
