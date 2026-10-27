"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send, ShieldCheck } from "lucide-react";
import { isVinhedoRegistrationOpen } from "@/lib/vinhedo-registration";
import formStyles from "./EventRegistrationForm.module.css";
import styles from "./VinhedoRegistrationForm.module.css";

export function VinhedoRegistrationForm({ initialOpen }: { initialOpen: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [registrationOpen, setRegistrationOpen] = useState(initialOpen);
  const submitLock = useRef(false);
  const successPanel = useRef<HTMLDivElement>(null);
  const errorPanel = useRef<HTMLParagraphElement>(null);
  const birthMax = new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });

  useEffect(() => {
    const updateDeadline = () => setRegistrationOpen(isVinhedoRegistrationOpen());
    updateDeadline();
    const timer = window.setInterval(updateDeadline, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!registrationId) return;
    successPanel.current?.focus({ preventScroll: true });
    successPanel.current?.scrollIntoView({ block: "start" });
  }, [registrationId]);

  useEffect(() => {
    if (error) errorPanel.current?.focus();
  }, [error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;
    if (!isVinhedoRegistrationOpen()) {
      setRegistrationOpen(false);
      return;
    }
    const form = new FormData(event.currentTarget);
    submitLock.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/event-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: "inauguracao-centro-olimpico-vinhedo-2026",
          registration_type: "individual",
          name: form.get("name"),
          phone: form.get("phone"),
          participants: [{ name: form.get("student_name"), birth_date: form.get("birth_date"), gender: form.get("gender"), school_year: form.get("school_year") }],
          consent: form.get("consent") === "on",
          guardian_authorization: form.get("guardian_authorization") === "on",
          website: form.get("website")
        })
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok || typeof result.registrationId !== "string") throw new Error(result?.error || "Não foi possível concluir a inscrição. Tente novamente.");
      setRegistrationId(result.registrationId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Confira sua conexão e tente novamente.");
    } finally {
      submitLock.current = false;
      setPending(false);
    }
  }

  if (registrationId) return <div ref={successPanel} tabIndex={-1} className={formStyles.success} role="status" aria-live="polite">
    <CheckCircle2 size={38} aria-hidden="true" />
    <h3>Inscrição recebida!</h3>
    <p>Seu filho está inscrito gratuitamente. Guarde o protocolo para falar com a organização.</p>
    <code>{registrationId}</code>
    <p>14 de novembro de 2026, a partir das 7h30 — chegada dos alunos.<br />Centro de Excelência em Atletismo de Vinhedo.<br />Rua Joana Fabri Thomé — Jardim São Matheus, Vinhedo/SP.</p>
    {registrationOpen ? <button type="button" className="button button-secondary" onClick={() => { setRegistrationId(null); setError(""); }}>Inscrever outro filho</button> : null}
  </div>;

  if (!registrationOpen) return <div className={styles.closed} role="status">
    <h3>Inscrições encerradas</h3>
    <p>O prazo de inscrição foi até 02 de novembro de 2026.</p>
  </div>;

  return <form className={formStyles.form} onSubmit={submit} aria-busy={pending}>
    <fieldset className={formStyles.section} disabled={pending}>
      <legend>Dados do responsável</legend>
      <div className={formStyles.grid}>
        <label>Nome completo do responsável legal<input name="name" required minLength={2} maxLength={120} autoComplete="name" /></label>
        <label>WhatsApp<input name="phone" type="tel" required minLength={10} maxLength={24} autoComplete="tel" placeholder="(11) 99999-9999" /></label>
      </div>
    </fieldset>

    <fieldset className={formStyles.section} disabled={pending}>
      <legend>Dados do aluno</legend>
      <div className={formStyles.grid}>
        <label className={formStyles.full}>Nome completo do aluno<input name="student_name" required minLength={2} maxLength={120} autoComplete="off" /></label>
        <label>Data de nascimento<input name="birth_date" type="date" required max={birthMax} /></label>
        <label>Gênero<select name="gender" defaultValue="Não informar"><option>Não informar</option><option>Feminino</option><option>Masculino</option></select></label>
        <fieldset className={`${formStyles.full} ${styles.years}`}>
          <legend>Série</legend>
          <div className={styles.yearOptions}>{[1, 2, 3, 4, 5].map((year) => <label className={styles.yearOption} key={year}><input name="school_year" type="radio" value={year} required /><span>{year}º Ano</span></label>)}</div>
        </fieldset>
      </div>
    </fieldset>

    <fieldset className={formStyles.consent} disabled={pending}>
      <legend><ShieldCheck size={19} aria-hidden="true" />Autorização e privacidade</legend>
      <label><input name="guardian_authorization" type="checkbox" required /><span>Sou o responsável legal e autorizo a participação da criança ou adolescente neste evento, com acompanhamento de um adulto responsável.</span></label>
      <label><input name="consent" type="checkbox" required /><span>Concordo com o uso dos dados informados para organizar esta inscrição e receber orientações sobre o evento, conforme a <Link href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer">Política de Privacidade</Link>.</span></label>
      <p>Os dados dos participantes são acessíveis à equipe autorizada. Não publicamos a lista de alunos.</p>
    </fieldset>
    <div className={formStyles.trap} aria-hidden="true"><label>Deixe este campo em branco<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    {error ? <p ref={errorPanel} tabIndex={-1} className={formStyles.error} role="alert">{error}</p> : null}
    <button type="submit" className={`button ${formStyles.submit}`} disabled={pending}>{pending ? <Loader2 size={18} className={formStyles.spinner} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}{pending ? "Enviando inscrição…" : "Inscrever meu filho gratuitamente"}</button>
    <p className={formStyles.footnote}>Inscrições gratuitas até 02/11/2026.</p>
  </form>;
}
