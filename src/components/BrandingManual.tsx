"use client";

import { Check, Clipboard, Download, FileArchive, ShieldCheck, Upload } from "lucide-react";
import { FormEvent, useState } from "react";
import styles from "./BrandingManual.module.css";

const assets = "/assets/branding/originais";
const sections = [
  ["essencia", "Essência"], ["assinaturas", "Assinaturas"], ["construcao", "Construção"],
  ["cores", "Cores"], ["tipografia", "Tipografia"], ["nomenclatura", "Nomenclatura"],
  ["usos", "Usos"], ["downloads", "Downloads"], ["autorizacao", "Autorização"], ["termos", "Termos"]
] as const;

const colors = [
  ["Preto", "#000000", "0 · 0 · 0", "0 · 0 · 0 · 100"],
  ["Branco", "#FFFFFF", "255 · 255 · 255", "0 · 0 · 0 · 0"],
  ["Grafite", "#1A1A1A", "26 · 26 · 26", "0 · 0 · 0 · 90"],
  ["Cinza", "#707070", "112 · 112 · 112", "0 · 0 · 0 · 56"],
  ["Cinza claro", "#EDEDED", "237 · 237 · 237", "0 · 0 · 0 · 7"],
  ["Fundo cinza", "#F7F7F7", "247 · 247 · 247", "0 · 0 · 0 · 3"]
] as const;

export function BrandingManual() {
  const [copied, setCopied] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [downloadAccepted, setDownloadAccepted] = useState(false);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    window.setTimeout(() => setCopied(""), 1200);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const response = await fetch("/api/branding/requests", { method: "POST", body: new FormData(event.currentTarget) });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? `Solicitação recebida. Protocolo ${result.id}.` : result.error || "Não foi possível enviar.");
    if (response.ok) event.currentTarget.reset();
    setSending(false);
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Manual oficial da marca</p>
        <h1>Branding 11Run</h1>
        <p>Diretrizes para utilização correta da nossa marca.</p>
        <nav aria-label="Navegação do manual">
          {sections.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
      </section>

      <section className={styles.panel} id="essencia">
        <header><p className={styles.eyebrow}>01 · Essência</p><h2>Uma identidade construída para avançar.</h2></header>
        <div className={styles.split}>
          <p>A 11Run conecta formação, performance e oportunidade. Sua identidade combina precisão técnica, movimento e visão de longo prazo.</p>
          <div className={styles.values}><span>Movimento</span><span>Futuro</span><span>Base</span><span>Disciplina</span><span>Coletividade</span></div>
        </div>
      </section>

      <section className={styles.panel} id="assinaturas">
        <header><p className={styles.eyebrow}>02 · Assinaturas oficiais</p><h2>Uma marca, quatro aplicações.</h2></header>
        <div className={styles.logoGrid}>
          <LogoCard title="Horizontal · positiva" src={`${assets}/11run-horizontal-preto.png`} dark={false} />
          <LogoCard title="Horizontal · negativa" src={`${assets}/11run-horizontal-branco.png`} dark />
          <LogoCard title="Vertical · positiva" src={`${assets}/11run-vertical-preto.png`} dark={false} />
          <LogoCard title="Vertical · negativa" src={`${assets}/11run-vertical-branco.png`} dark />
        </div>
        <p className={styles.note}>Use somente os arquivos oficiais. Não redesenhe, distorça, recomponha ou altere proporções, tipografia e espaçamentos.</p>
      </section>

      <section className={styles.panel} id="construcao">
        <header><p className={styles.eyebrow}>03 · Construção</p><h2>Respiro e legibilidade preservam reconhecimento.</h2></header>
        <div className={styles.ruleGrid}>
          <article><div className={styles.safeArea}><img src={`${assets}/11run-horizontal-preto.png`} alt="Diagrama de área de proteção" /></div><h3>Área de proteção</h3><p>Mantenha ao redor da assinatura uma margem mínima equivalente à altura do símbolo.</p></article>
          <article><div className={styles.sizes}><span>Digital</span><strong>120 px</strong><span>Impresso</span><strong>30 mm</strong></div><h3>Tamanho mínimo</h3><p>Abaixo destes limites, prefira a assinatura vertical ou o símbolo autorizado.</p></article>
          <article><div className={styles.orientation}><span>Horizontal</span><span>Vertical</span></div><h3>Escolha da versão</h3><p>Horizontal em cabeçalhos e faixas; vertical em cards, avatares e áreas mais compactas.</p></article>
        </div>
      </section>

      <section className={styles.panel} id="cores">
        <header><p className={styles.eyebrow}>04 · Paleta</p><h2>Cores sóbrias, contraste máximo.</h2></header>
        <div className={styles.colorGrid}>
          {colors.map(([name, hex, rgb, cmyk]) => (
            <button key={hex} type="button" onClick={() => copy(hex)} className={styles.colorCard}>
              <i style={{ background: hex }} /><span>{name}</span><strong>{hex}</strong><small>RGB {rgb}</small><small>CMYK {cmyk}</small>
              {copied === hex ? <Check size={15} /> : <Clipboard size={15} />}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.panel} id="tipografia">
        <header><p className={styles.eyebrow}>05 · Tipografia</p><h2>Clareza antes de ornamento.</h2></header>
        <div className={styles.typeGrid}>
          <article><span>Display</span><strong>Inter Light</strong><p>Grandes títulos, mensagens institucionais e números de impacto.</p></article>
          <article><span>Interface</span><strong>Inter Regular</strong><p>Textos, navegação, formulários e comunicação funcional.</p></article>
          <article><span>Ênfase</span><strong>INTER MEDIUM</strong><p>Rótulos, chamadas curtas e informações de maior prioridade.</p></article>
        </div>
      </section>

      <section className={styles.panel} id="nomenclatura">
        <header><p className={styles.eyebrow}>06 · Nomenclatura</p><h2>O nome também é parte da marca.</h2></header>
        <div className={styles.namingGrid}>
          <article><span>Forma oficial</span><strong>11Run</strong><p>Utilize esta grafia em textos institucionais, materiais oficiais e assinaturas de comunicação.</p></article>
          <article><span>Evite variações</span><div><s>11 Run</s><s>Onze Run</s><s>Onzerun</s><s>11RUN</s><s>11run</s><s>Eleven Run</s></div></article>
        </div>
      </section>

      <section className={styles.panel} id="usos">
        <header><p className={styles.eyebrow}>07 · Aplicação</p><h2>Consistência em cada ponto de contato.</h2></header>
        <div className={styles.backgrounds}>
          <div className={styles.light}><img src={`${assets}/11run-horizontal-preto.png`} alt="Marca preta em fundo claro" /></div>
          <div className={styles.dark}><img src={`${assets}/11run-horizontal-branco.png`} alt="Marca branca em fundo escuro" /></div>
          <div className={styles.photo}><img src={`${assets}/11run-horizontal-branco.png`} alt="Marca branca em fundo fotográfico escuro" /></div>
        </div>
        <div className={styles.donts}>
          {["Não distorcer", "Não rotacionar", "Não alterar cores", "Não aplicar sombras", "Não usar sem contraste", "Não modificar a composição"].map((item) => <span key={item}>× {item}</span>)}
        </div>
        <div className={styles.coBrand}>
          <h3>Co-branding e aplicações</h3>
          <p>Em materiais com parceiros, preserve hierarquia equivalente, área de proteção e separador visual. Patrocinadores nunca integram a assinatura da 11Run.</p>
          <div><span>Uniformes</span><span>Eventos</span><span>Imprensa</span><span>Redes sociais</span><span>Apresentações</span><span>Ambientes digitais</span></div>
        </div>
      </section>

      <section className={styles.panel} id="downloads">
        <header><p className={styles.eyebrow}>08 · Arquivos oficiais</p><h2>Baixe, aplique e preserve.</h2></header>
        <label className={styles.downloadConsent}><input type="checkbox" checked={downloadAccepted} onChange={(event) => setDownloadAccepted(event.target.checked)} /><span>Li e aceito as condições de uso da marca 11Run descritas nesta página.</span></label>
        <a className={`${styles.download} ${!downloadAccepted ? styles.downloadDisabled : ""}`} href={downloadAccepted ? "/assets/branding/kit-oficial-11run-png.zip" : undefined} download={downloadAccepted}>
          <FileArchive size={28} /><span><strong>Kit oficial 11Run</strong><small>4 assinaturas PNG em alta resolução · originais preservados</small></span><Download size={20} />
        </a>
        <p className={styles.note}>Os arquivos disponibilizados não autorizam uso comercial, associação institucional ou alteração da marca.</p>
      </section>

      <section className={styles.panel} id="autorizacao">
        <header><p className={styles.eyebrow}>09 · Autorização</p><h2>Solicite o uso da marca.</h2></header>
        <div className={styles.formGrid}>
          <aside><ShieldCheck size={28} /><h3>Uso responsável</h3><p>Toda aplicação externa, comercial, promocional, editorial ou em co-branding deve ser aprovada previamente pela 11Run.</p><p>Documentos enviados são privados e usados somente na análise da solicitação.</p></aside>
          <form onSubmit={submit}>
            <label>Nome completo<input name="name" required maxLength={120} /></label>
            <label>E-mail<input name="email" type="email" required maxLength={180} /></label>
            <label>Telefone<input name="phone" required maxLength={30} /></label>
            <label>Empresa ou organização<input name="organization" required maxLength={160} /></label>
            <label className={styles.full}>Uso pretendido<textarea name="intendedUse" required maxLength={1500} /></label>
            <label className={styles.full}>Canais e período de veiculação<input name="channels" required maxLength={500} /></label>
            <label className={styles.full}>Observações<textarea name="notes" maxLength={1000} /></label>
            <label className={`${styles.upload} ${styles.full}`}><Upload size={20} />Anexos (PDF, JPG ou PNG · até 8 MB cada)<input name="files" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" /></label>
            <input className={styles.trap} name="website" tabIndex={-1} autoComplete="off" />
            <label className={`${styles.check} ${styles.full}`}><input name="terms" type="checkbox" value="accepted" required />Li e aceito a <a href="/politica-de-privacidade">Política de Privacidade</a>, os <a href="/termos-de-uso">Termos de Uso</a> e as condições de uso da marca.</label>
            <label className={styles.challenge}>Validação: quanto é 9 + 9?<input name="challenge" required inputMode="numeric" /></label>
            <button disabled={sending} type="submit">{sending ? "Enviando…" : "Enviar para análise"}</button>
            {message && <p className={`${styles.full} ${styles.message}`} role="status">{message}</p>}
          </form>
        </div>
      </section>

      <section className={styles.panel} id="termos">
        <header><p className={styles.eyebrow}>10 · Condições de uso</p><h2>Autorização não transfere propriedade.</h2></header>
        <div className={styles.termsGrid}>
          <article><strong>Propriedade</strong><p>A marca e seus arquivos permanecem propriedade da 11Run. O download não concede cessão, licença ampla ou direito de registro.</p></article>
          <article><strong>Finalidade aprovada</strong><p>O uso é restrito à finalidade, aos canais e ao período aprovados. Alterações posteriores exigem nova análise.</p></article>
          <article><strong>Sem sublicença</strong><p>É proibido repassar, sublicenciar, vender, modificar ou disponibilizar os arquivos a terceiros sem autorização expressa.</p></article>
          <article><strong>Revogação</strong><p>A autorização pode ser revogada. Quando solicitado, o material deve ser corrigido ou removido imediatamente.</p></article>
          <article><strong>Uso indevido</strong><p>Aplicações não autorizadas podem resultar em solicitação de retirada e demais medidas cabíveis para proteção da marca.</p></article>
        </div>
      </section>
    </main>
  );
}

function LogoCard({ title, src, dark }: { title: string; src: string; dark: boolean }) {
  return <figure className={dark ? styles.logoDark : styles.logoLight}><img src={src} alt={title} /><figcaption>{title}</figcaption></figure>;
}
