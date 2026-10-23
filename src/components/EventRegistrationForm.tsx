"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardPaste, Loader2, Plus, Send, ShieldCheck, Trash2, Users } from "lucide-react";
import { parseParticipantList, type EventParticipant } from "@/lib/event-participants";
import styles from "./EventRegistrationForm.module.css";

type EventId = "finalissima-desafio-virtual-2026" | "inauguracao-centro-olimpico-vinhedo-2026";
const emptyParticipant = (): EventParticipant => ({ name: "", birth_date: "", gender: "Não informar" });
const states = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export function EventRegistrationForm({ eventId, schoolEnabled = false }: { eventId: EventId; schoolEnabled?: boolean }) {
  const [mode, setMode] = useState<"individual" | "school">("individual");
  const [participants, setParticipants] = useState<EventParticipant[]>([emptyParticipant()]);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState<{ registrationId: string; participantCount: number } | null>(null);
  const submitLock = useRef(false);
  const successPanel = useRef<HTMLDivElement>(null);
  const school = mode === "school";
  const final = eventId === "finalissima-desafio-virtual-2026";
  const ageLabel = final ? "9 a 13 anos em 13/11/2026" : "6 a 17 anos em 14/11/2026";
  const birthMin = final ? "2012-11-14" : "2008-11-15";
  const birthMax = final ? "2017-11-13" : "2020-11-14";
  const visibleParticipants = school ? participants : participants.slice(0, 1);

  useEffect(() => {
    function selectSchool() {
      if (schoolEnabled && window.location.hash === "#inscricoes-escola") setMode("school");
    }
    selectSchool();
    window.addEventListener("hashchange", selectSchool);
    return () => window.removeEventListener("hashchange", selectSchool);
  }, [schoolEnabled]);

  useEffect(() => {
    if (!success) return;
    successPanel.current?.focus({ preventScroll: true });
    successPanel.current?.scrollIntoView({ block: "start" });
  }, [success]);

  function updateParticipant(index: number, key: keyof EventParticipant, value: string) {
    setParticipants((current) => current.map((participant, i) => i === index ? { ...participant, [key]: value } : participant));
  }

  function importList() {
    try {
      const parsed = parseParticipantList(bulkText);
      const current = participants.filter((participant) => participant.name || participant.birth_date);
      if (current.length + parsed.length > 500) throw new Error("Cada inscrição escolar pode ter até 500 alunos.");
      setParticipants([...current, ...parsed]);
      setBulkText("");
      setBulkError("");
    } catch (cause) {
      setBulkError(cause instanceof Error ? cause.message : "Não foi possível importar a lista.");
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    if (school && bulkText.trim()) {
      setError("Adicione a lista colada aos alunos antes de enviar a inscrição.");
      return;
    }
    submitLock.current = true;
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          registration_type: mode,
          name: form.get("name"), email: form.get("email"), phone: form.get("phone"), city: form.get("city"), state: form.get("state"),
          school_name: school ? form.get("school_name") : undefined,
          participants: visibleParticipants,
          consent: form.get("consent") === "on",
          guardian_authorization: form.get("guardian_authorization") === "on",
          website: form.get("website")
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Não foi possível concluir a inscrição. Tente novamente.");
      setSuccess({ registrationId: result.registrationId, participantCount: result.participantCount });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Confira sua conexão e tente novamente.");
    } finally {
      submitLock.current = false;
      setPending(false);
    }
  }

  if (success) return <div ref={successPanel} tabIndex={-1} className={styles.success} role="status" aria-live="polite">
    <CheckCircle2 size={38} aria-hidden="true" />
    <h3>Inscrição recebida!</h3>
    <p>{success.participantCount === 1 ? "Participante inscrito" : `${success.participantCount} alunos inscritos`} gratuitamente. Guarde o protocolo para falar com a organização.</p>
    <code>{success.registrationId}</code>
    <p>{final ? "13 de novembro, às 14h · IVCL, Campinas." : "14 de novembro, a partir das 8h · Centro Olímpico de Vinhedo. Corrida das 9h às 10h."}</p>
    <button type="button" className="button button-secondary" onClick={() => { setSuccess(null); setParticipants([emptyParticipant()]); setBulkText(""); setError(""); setBulkError(""); }}>Fazer outra inscrição</button>
  </div>;

  return <form className={styles.form} onSubmit={submit}>
    {schoolEnabled ? <fieldset id="inscricoes-escola" className={styles.mode} disabled={pending}><legend>Como você quer participar?</legend>
      <label><input type="radio" name="registration_type" value="individual" checked={!school} onChange={() => setMode("individual")} />Inscrição individual</label>
      <label><input type="radio" name="registration_type" value="school" checked={school} onChange={() => setMode("school")} />Grupo de uma escola</label>
    </fieldset> : null}
    <fieldset className={styles.section} disabled={pending}>
      <legend><span>01</span>{school ? "Escola e contato responsável" : "Contato do responsável legal"}</legend>
      <p>Uma inscrição simples, gratuita e sem documentos anexos.</p>
      <div className={styles.grid}>
        {school ? <label className={styles.full}>Nome da escola<input name="school_name" required maxLength={160} autoComplete="organization" /></label> : null}
        <label className={styles.full}>{school ? "Nome do responsável pela escola" : "Nome completo do responsável legal"}<input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
        <label>E-mail<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
        <label>WhatsApp<input name="phone" type="tel" required minLength={10} maxLength={24} autoComplete="tel" placeholder="(11) 99999-9999" /></label>
        <label>Cidade<input name="city" required minLength={2} maxLength={100} autoComplete="address-level2" /></label>
        <label>Estado<select name="state" required defaultValue="SP" autoComplete="address-level1">{states.map((state) => <option key={state}>{state}</option>)}</select></label>
      </div>
    </fieldset>
    <fieldset className={styles.section} disabled={pending}>
      <legend><span>02</span>{school ? "Alunos participantes" : "Quem vai correr"}</legend>
      <p>Participantes de {ageLabel}. {school ? "Adicione um aluno por vez ou cole uma lista de sua planilha. Até 500 alunos por envio." : "Informe os dados da criança ou adolescente."}</p>
      {school ? <details className={styles.bulk}><summary><ClipboardPaste size={18} aria-hidden="true" />Colar lista de alunos</summary>
        <label htmlFor={`${eventId}-bulk`}>Copie as colunas nome, nascimento e gênero de uma planilha, sem o cabeçalho. Também aceitamos ponto e vírgula.</label>
        <textarea id={`${eventId}-bulk`} rows={5} maxLength={150000} value={bulkText} onChange={(event) => setBulkText(event.target.value)} placeholder={"Ana Silva; 12/03/2015; F\nJoão Santos; 20/08/2016; M"} />
        <small>Data: DD/MM/AAAA. Gênero: F, M ou Não informar. Confira os dados após importar.</small>
        {bulkError ? <p className={styles.error} role="alert">{bulkError}</p> : null}
        <button type="button" className="button button-secondary" onClick={importList}>Adicionar lista aos alunos</button>
      </details> : null}
      <div className={styles.participants}>
        {visibleParticipants.map((participant, index) => <div className={styles.participant} key={index}>
          {school ? <div className={styles.participantNumber}><span>Aluno {index + 1}</span><button type="button" disabled={participants.length === 1} aria-label={`Remover aluno ${index + 1}`} onClick={() => setParticipants((current) => current.filter((_, i) => i !== index))}><Trash2 size={17} aria-hidden="true" /></button></div> : null}
          <label>Nome completo do participante<input required minLength={2} maxLength={120} value={participant.name} onChange={(event) => updateParticipant(index, "name", event.target.value)} autoComplete="off" /></label>
          <label>Data de nascimento<input type="date" required min={birthMin} max={birthMax} value={participant.birth_date} onChange={(event) => updateParticipant(index, "birth_date", event.target.value)} /></label>
          <label>Gênero<select value={participant.gender} onChange={(event) => updateParticipant(index, "gender", event.target.value)}><option>Não informar</option><option>Feminino</option><option>Masculino</option></select></label>
        </div>)}
      </div>
      {school ? <div className={styles.participantActions}><button type="button" className="button button-secondary" disabled={participants.length >= 500} onClick={() => setParticipants((current) => [...current, emptyParticipant()])}><Plus size={17} aria-hidden="true" />Adicionar aluno</button><span><Users size={16} aria-hidden="true" />{participants.length} {participants.length === 1 ? "aluno na lista" : "alunos na lista"}</span></div> : null}
    </fieldset>
    <fieldset className={styles.consent} disabled={pending}>
      <legend><ShieldCheck size={19} aria-hidden="true" />Autorização e privacidade</legend>
      <label><input name="guardian_authorization" type="checkbox" required />
        <span>{school ? "Sou responsável pelo grupo escolar e confirmo que a escola possui autorização dos responsáveis legais de todos os alunos inscritos para participar deste evento." : "Sou o responsável legal e autorizo a participação da criança ou adolescente neste evento, com acompanhamento de um adulto responsável."}</span>
      </label>
      <label><input name="consent" type="checkbox" required /><span>Concordo com o uso dos dados informados para organizar esta inscrição e receber orientações sobre o evento, conforme a <Link href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>.</span></label>
      <p>Os dados dos participantes são acessíveis à equipe autorizada. Não publicamos a lista de alunos.</p>
    </fieldset>
    <div className={styles.trap} aria-hidden="true"><label>Deixe este campo em branco<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {error ? <p className={styles.error} role="alert">{error}</p> : null}
    <button type="submit" className={`button ${styles.submit}`} disabled={pending}>{pending ? <Loader2 size={18} className={styles.spinner} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}{pending ? "Enviando inscrição…" : school ? `Inscrever ${participants.length} ${participants.length === 1 ? "aluno" : "alunos"} gratuitamente` : "Garantir inscrição gratuita"}</button>
    <p className={styles.footnote}>Também haverá inscrição gratuita no local do evento.</p>
  </form>;
}
