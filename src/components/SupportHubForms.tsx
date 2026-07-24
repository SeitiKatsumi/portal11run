"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Clipboard, FileCheck2, QrCode, Send } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import {
  brazilianStates,
  supporterTypes,
  supportTypes,
  volunteerContributionTypes,
  volunteerProfessions
} from "@/lib/support-hub-options";
import type { SupportHubSettings } from "@/lib/support-hub";
import styles from "@/app/apoie/support.module.css";

type FormState = { kind: "idle" | "loading" | "success" | "error"; message?: string; protocol?: string };

function StateMessage({ state }: { state: FormState }) {
  if (state.kind === "idle" || state.kind === "loading") return null;
  return (
    <p className={state.kind === "error" ? styles.formError : styles.formSuccess} role="status">
      {state.kind === "success" ? <Check size={17} /> : null}
      {state.message}
      {state.protocol ? <strong> Protocolo {state.protocol}</strong> : null}
    </p>
  );
}

function StateSelect({ name = "state" }: { name?: string }) {
  return (
    <select name={name} required defaultValue="">
      <option value="" disabled>Selecione</option>
      {brazilianStates.map((state) => <option value={state} key={state}>{state}</option>)}
    </select>
  );
}

function ConsentFields({ extra = false }: { extra?: boolean }) {
  return (
    <div className={styles.consents}>
      <label><input type="checkbox" name="consent" required /> <span>Autorizo o uso dos dados para esta finalidade e aceito a <Link href="/politica-de-privacidade" target="_blank">Política de Privacidade</Link>.</span></label>
      {extra ? <label><input type="checkbox" name="truth" required /> <span>Declaro que as informações são verdadeiras.</span></label> : null}
      {extra ? <label><input type="checkbox" name="contactAuthorization" required /> <span>Autorizo o contato da equipe 11RUN.</span></label> : null}
    </div>
  );
}

export function SponsorshipForm() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [state, setState] = useState<FormState>({ kind: "idle" });

  function toggle(value: string) {
    setSelectedTypes((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "loading" });
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries()) as Record<string, unknown>;
    payload.supportTypes = selectedTypes;
    payload.consent = form.get("consent") === "on";
    try {
      const response = await fetch("/api/support/sponsorship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Não foi possível enviar.");
      event.currentTarget.reset();
      setSelectedTypes([]);
      setState({ kind: "success", message: "Recebemos seu interesse. Nossa equipe entrará em contato.", protocol: result.protocol });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Não foi possível enviar." });
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" />
      <div className={styles.formHeading}><span>Contato comercial</span><h2>Vamos construir uma parceria.</h2><p>Os dados abaixo ficam restritos à equipe administrativa da 11RUN.</p></div>
      <div className={styles.formGrid}>
        <label><span>Nome completo *</span><input name="name" required maxLength={180} /></label>
        <label><span>Empresa ou organização</span><input name="company" maxLength={180} /></label>
        <label><span>Cargo</span><input name="role" maxLength={120} /></label>
        <label><span>E-mail *</span><input name="email" type="email" required /></label>
        <label><span>Telefone / WhatsApp *</span><input name="phone" inputMode="tel" required /></label>
        <label><span>Cidade *</span><input name="city" required /></label>
        <label><span>Estado *</span><StateSelect /></label>
        <label><span>Tipo de apoiador *</span><select name="supporterType" required defaultValue=""><option value="" disabled>Selecione</option>{supporterTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <fieldset className={styles.choiceGroup}><legend>Modalidade de apoio *</legend><div>{supportTypes.map((item) => <label key={item} className={selectedTypes.includes(item) ? styles.choiceActive : ""}><input type="checkbox" checked={selectedTypes.includes(item)} onChange={() => toggle(item)} /><span>{item}</span></label>)}</div></fieldset>
      <div className={styles.formGrid}>
        <label><span>Valor aproximado</span><input name="estimatedValue" inputMode="decimal" placeholder="Ex.: R$ 5.000" /></label>
        <label><span>Periodicidade</span><select name="periodicity" defaultValue=""><option value="">A definir</option>{["Pontual", "Mensal", "Trimestral", "Semestral", "Anual"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Projeto ou área de interesse</span><input name="projectInterest" /></label>
        <label><span>Melhor horário para contato</span><input name="bestContactTime" /></label>
        <label className={styles.wide}><span>Mensagem</span><textarea name="message" rows={5} maxLength={3000} /></label>
      </div>
      <ConsentFields />
      <StateMessage state={state} />
      <button className={styles.submit} disabled={state.kind === "loading"}><Send size={18} />{state.kind === "loading" ? "Enviando..." : "Quero ser patrocinador"}</button>
    </form>
  );
}

type DonationResult = FormState & { qrCode?: string; pixPayload?: string };

export function DonationForm({ settings }: { settings: SupportHubSettings }) {
  const [amountCents, setAmountCents] = useState(settings.donationValues[1] ?? 5000);
  const [other, setOther] = useState("");
  const [result, setResult] = useState<DonationResult>({ kind: "idle" });
  const currentAmount = other ? Math.round(Number(other.replace(",", ".")) * 100) : amountCents;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult({ kind: "loading" });
    const form = new FormData(event.currentTarget);
    form.set("amountCents", String(currentAmount));
    try {
      const response = await fetch("/api/support/donation", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || "Não foi possível gerar o PIX.");
      setResult({
        kind: "success",
        message: "Obrigado por acreditar em nossos atletas. Sua contribuição já faz parte dessa história.",
        protocol: data.protocol,
        qrCode: data.qrCode,
        pixPayload: data.pixPayload
      });
    } catch (error) {
      setResult({ kind: "error", message: error instanceof Error ? error.message : "Não foi possível gerar o PIX." });
    }
  }

  async function copyPix() {
    if (result.pixPayload) await navigator.clipboard.writeText(result.pixPayload);
  }

  if (result.kind === "success" && result.qrCode && result.pixPayload) {
    return (
      <section className={styles.pixResult} aria-live="polite">
        <div className={styles.pixIcon}><QrCode /></div>
        <span>PIX pronto para pagamento</span>
        <h2>{(currentAmount / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</h2>
        <div className={styles.qr}><Image src={result.qrCode} alt="QR Code PIX da doação" width={280} height={280} unoptimized /></div>
        <p>Abra o aplicativo do seu banco, escolha pagar com PIX e leia o QR Code. A confirmação será feita após a conciliação.</p>
        <textarea readOnly value={result.pixPayload} aria-label="Código PIX Copia e Cola" />
        <div className={styles.pixActions}>
          <button type="button" onClick={copyPix}><Clipboard size={17} /> Copiar código PIX</button>
          <button type="button" onClick={() => setResult({ kind: "idle" })}>Alterar dados ou valor</button>
        </div>
        <StateMessage state={result} />
      </section>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" />
      <div className={styles.formHeading}><span>Doação direta via PIX</span><h2>Escolha o valor da contribuição.</h2><p>O PIX será gerado com valor exato e protocolo próprio.</p></div>
      <div className={styles.amounts}>{settings.donationValues.map((value) => <button type="button" className={!other && amountCents === value ? styles.amountActive : ""} key={value} onClick={() => { setAmountCents(value); setOther(""); }}>{(value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</button>)}<label><span>Outro</span><input aria-label="Outro valor em reais" value={other} onChange={(event) => setOther(event.target.value.replace(/[^\d,.]/g, ""))} inputMode="decimal" placeholder="R$" /></label></div>
      <div className={styles.formGrid}>
        <label><span>Nome completo *</span><input name="name" required /></label>
        <label><span>E-mail *</span><input name="email" type="email" required /></label>
        <label><span>Telefone / WhatsApp</span><input name="phone" inputMode="tel" /></label>
        <label><span>CPF ou CNPJ</span><input name="document" /></label>
        <label><span>Cidade *</span><input name="city" required /></label>
        <label><span>Estado *</span><StateSelect /></label>
        <label className={styles.wide}><span>Projeto de destino *</span><select name="project" required>{settings.donationProjects.map((project) => <option key={project}>{project}</option>)}</select></label>
        <label className={styles.wide}><span>Mensagem opcional</span><textarea name="message" rows={3} /></label>
      </div>
      <details className={styles.optional}>
        <summary>Já fez a transferência? Envie o comprovante opcional</summary>
        <div className={styles.formGrid}>
          <label><span>Comprovante (PDF, JPG ou PNG)</span><input name="receipt" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" /></label>
          <label><span>Data da transferência</span><input name="transferDate" type="date" /></label>
          <label><span>Nome do titular</span><input name="accountHolder" /></label>
          <label><span>Identificador da transação</span><input name="transactionId" /></label>
        </div>
      </details>
      <label className={styles.singleCheck}><input type="checkbox" name="anonymous" /> <span>Quero que esta doação seja tratada como anônima.</span></label>
      <ConsentFields />
      <StateMessage state={result} />
      <button className={styles.submit} disabled={result.kind === "loading" || currentAmount < 100}><QrCode size={18} />{result.kind === "loading" ? "Gerando..." : "Gerar PIX para doação"}</button>
    </form>
  );
}

export function VolunteerForm() {
  const [profession, setProfession] = useState("");
  const [contributions, setContributions] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const contributionSet = useMemo(() => new Set(contributions), [contributions]);

  function toggle(value: string, current: string[], setter: (value: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "loading" });
    const form = new FormData(event.currentTarget);
    form.set("contributionTypes", JSON.stringify(contributions));
    form.set("periods", JSON.stringify(periods));
    try {
      const response = await fetch("/api/support/volunteer", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "Não foi possível enviar.");
      event.currentTarget.reset();
      setProfession("");
      setContributions([]);
      setPeriods([]);
      setState({ kind: "success", message: "Recebemos seu cadastro. Obrigado por colocar seu conhecimento a serviço de novos sonhos.", protocol: result.protocol });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Não foi possível enviar." });
    }
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" />
      <div className={styles.formHeading}><span>Rede de voluntários</span><h2>Conte como você pode contribuir.</h2><p>Currículos e documentos ficam em armazenamento privado.</p></div>
      <div className={styles.formGrid}>
        <label><span>Nome completo *</span><input name="name" required /></label>
        <label><span>Data de nascimento *</span><input name="birthDate" type="date" required /></label>
        <label><span>E-mail *</span><input name="email" type="email" required /></label>
        <label><span>Telefone / WhatsApp *</span><input name="phone" required inputMode="tel" /></label>
        <label><span>Cidade *</span><input name="city" required /></label>
        <label><span>Estado *</span><StateSelect /></label>
        <label><span>Profissão *</span><select name="profession" required value={profession} onChange={(event) => setProfession(event.target.value)}><option value="">Selecione</option>{volunteerProfessions.map((item) => <option key={item}>{item}</option>)}</select></label>
        {profession === "Outra profissão" ? <label><span>Qual profissão? *</span><input name="otherProfession" required /></label> : null}
        <label><span>Empresa ou instituição</span><input name="company" /></label>
        <label><span>Registro profissional</span><input name="professionalRegistration" /></label>
        <label><span>LinkedIn, site ou portfólio</span><input name="portfolioUrl" type="url" /></label>
        <label className={styles.wide}><span>Mini currículo ou apresentação</span><textarea name="presentation" rows={4} /></label>
      </div>
      <fieldset className={styles.choiceGroup}><legend>Tipo de contribuição *</legend><div>{volunteerContributionTypes.map((item) => <label key={item} className={contributionSet.has(item) ? styles.choiceActive : ""}><input type="checkbox" checked={contributionSet.has(item)} onChange={() => toggle(item, contributions, setContributions)} /><span>{item}</span></label>)}</div></fieldset>
      <div className={styles.formGrid}>
        <label className={styles.wide}><span>Dias disponíveis</span><input name="availableDays" placeholder="Ex.: terças e quintas" /></label>
        <fieldset className={`${styles.choiceGroup} ${styles.wide}`}><legend>Períodos</legend><div>{["Manhã", "Tarde", "Noite"].map((item) => <label key={item} className={periods.includes(item) ? styles.choiceActive : ""}><input type="checkbox" checked={periods.includes(item)} onChange={() => toggle(item, periods, setPeriods)} /><span>{item}</span></label>)}</div></fieldset>
        <label><span>Frequência</span><select name="frequency" defaultValue=""><option value="">A definir</option>{["Pontual", "Semanal", "Quinzenal", "Mensal", "Sob demanda"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Modalidade</span><select name="workMode" defaultValue=""><option value="">A definir</option>{["Presencial", "Remota", "Híbrida"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label><span>Distância máxima para deslocamento</span><input name="travelDistance" /></label>
        <label className={styles.singleCheck}><input type="checkbox" name="eventsTravel" /><span>Disponível para eventos e viagens</span></label>
        <label className={styles.wide}><span>Experiência com crianças ou adolescentes</span><textarea name="childExperience" rows={3} /></label>
        <label className={styles.wide}><span>Experiência no esporte</span><textarea name="sportExperience" rows={3} /></label>
        <label className={styles.wide}><span>Experiência em projetos sociais</span><textarea name="socialExperience" rows={3} /></label>
        <label className={styles.wide}><span>Por que deseja apoiar a 11RUN? *</span><textarea name="motivation" rows={4} required /></label>
        <label className={styles.wide}><span>Como acredita que pode contribuir? *</span><textarea name="contributionDescription" rows={4} required /></label>
        <label className={styles.wide}><span>Currículo, certificado ou portfólio (opcional)</span><input name="attachment" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" /><small>PDF, JPG ou PNG, até 10 MB.</small></label>
      </div>
      <ConsentFields extra />
      <StateMessage state={state} />
      <button className={styles.submit} disabled={state.kind === "loading"}><FileCheck2 size={18} />{state.kind === "loading" ? "Enviando..." : "Enviar cadastro de voluntariado"}</button>
    </form>
  );
}
