import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, Clock3, Flag, MapPin, Medal, Phone, Route, Users } from "lucide-react";
import { EventLandingHero } from "@/components/EventLandingHero";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import type { EventLandingContent } from "@/lib/event-content";
import styles from "./EventLanding.module.css";

export function createEventMetadata(event: EventLandingContent): Metadata {
  return {
    title: `${event.shortTitle} · ${event.dateLabel}`,
    description: `${event.dateLabel}, às ${event.timeLabel}, em ${event.city}. ${event.description}`,
    alternates: { canonical: `/eventos/${event.id}` },
    openGraph: { title: event.title, description: event.description, images: [event.bannerSrc] }
  };
}

export function EventLanding({ event, bannerSrc = event.bannerSrc }: { event: EventLandingContent; bannerSrc?: string }) {
  const benefitsIcons = [Medal, Users, Flag];
  const isVinhedo = event.id === "inauguracao-centro-olimpico-vinhedo-2026";
  const isFinalissima = event.id === "finalissima-desafio-virtual-2026";
  const isPrincesinha = event.id === "princesinha-da-colina-2026";

  return <article className={isVinhedo ? `${styles.page} ${styles.vinhedo}` : styles.page}>
    <EventLandingHero {...event} bannerSrc={bannerSrc} canonicalPath={`/eventos/${event.id}`} />

    <dl className={styles.facts}>
      <div><CalendarDays aria-hidden="true" /><dt>Quando</dt><dd><time dateTime={event.dateTime}>{event.dateLabel}</time><small>{event.timeLabel}</small></dd></div>
      <div><MapPin aria-hidden="true" /><dt>Onde</dt><dd>{event.city}<small>{isVinhedo ? "Centro Olímpico" : isFinalissima ? "IVCL" : "Parque da Juventude"}</small></dd></div>
      <div><Users aria-hidden="true" /><dt>Para quem</dt><dd>{event.ageLabel}<small>{isVinhedo ? "Individual e grupos escolares" : "Com o responsável"}</small></dd></div>
      <div><Route aria-hidden="true" /><dt>A experiência</dt><dd>{event.format}<small>{isVinhedo ? "Inclusão e diversão" : "Premiação e encontro"}</small></dd></div>
    </dl>

    <section className={styles.intro} aria-labelledby="sobre-evento">
      <div><span className={styles.eyebrow}>Mais que uma corrida</span><h2 id="sobre-evento">{event.introTitle}</h2>{event.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{isFinalissima ? <Link href="/projetos/circuito-virtual-11run" className={styles.textLink}>Conheça o Desafio Virtual 1000m<ArrowUpRight size={17} aria-hidden="true" /></Link> : null}</div>
      <aside className={styles.highlight}><Route size={31} aria-hidden="true" /><strong>{event.highlight.value}</strong><h3>{event.highlight.label}</h3><p>{event.highlight.text}</p><span><Check size={15} aria-hidden="true" />{event.free ? "Participação gratuita" : "Categoria especial 11RUN"}</span></aside>
    </section>

    <section className={styles.benefits} aria-label="Destaques do evento">{event.benefits.map((benefit, index) => {
      const Icon = benefitsIcons[index % benefitsIcons.length];
      return <article key={benefit.title}><span className={styles.benefitIcon}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /></span><h3>{benefit.title}</h3><p>{benefit.text}</p></article>;
    })}</section>

    <section className={styles.schedule} aria-labelledby="programacao-titulo">
      <div><span className={styles.eyebrow}>Programe seu encontro</span><h2 id="programacao-titulo">O dia começa com você.</h2><p>{event.dateLabel}<br />{event.venue}</p></div>
      <ol>{event.schedule.map((item) => <li key={item.time}><span className={styles.scheduleTime}><Clock3 size={17} aria-hidden="true" />{item.time}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></li>)}</ol>
    </section>

    {isPrincesinha ? <section className={styles.flyerSection} aria-labelledby="flyer-titulo"><div><span className={styles.eyebrow}>Divulgação da organização</span><h2 id="flyer-titulo">Todos os detalhes da Princesinha.</h2><p>Confira as provas recreativas por idade e a categoria especial 11RUN de 1.000 metros. Para valores, disponibilidade de vagas e condições de participação, consulte a inscrição oficial.</p><a className={styles.textLink} href={event.registrationUrl} target="_blank" rel="noopener noreferrer">Ver evento no TicketSports<ArrowUpRight size={17} aria-hidden="true" /></a></div><figure className={styles.flyer}><Image src="/assets/eventos/princesinha-da-colina-2026.webp" alt="Flyer oficial da Princesinha da Colina, em 14 de novembro de 2026 às 14h, no Parque da Juventude em Itatiba, com provas recreativas e categoria especial 11RUN" width={1080} height={1350} sizes="(max-width: 720px) calc(100vw - 64px), 480px" className={styles.flyerImage} /><figcaption>Divulgação do evento · confira as condições no TicketSports.</figcaption><p className={styles.flyerNotice}>O flyer menciona o Desafio Virtual. Pelas regras atuais, a edição 2026 encerra em 13/11, antes desta prova de 14/11. Confirme com a organização o aproveitamento das marcas.</p></figure></section> : null}

    <section className={styles.location} aria-labelledby="local-titulo"><div className={styles.locationIcon}><MapPin size={29} strokeWidth={1.5} aria-hidden="true" /></div><div><span className={styles.eyebrow}>Nos encontramos aqui</span><h2 id="local-titulo">{event.venue}</h2><p>{event.address}</p></div><a href={event.directionsUrl} className={styles.outlineButton} target="_blank" rel="noopener noreferrer">Abrir localização<ArrowUpRight size={17} aria-hidden="true" /></a></section>

    {isVinhedo ? <section className={styles.partners} aria-label="Realização e apoio do evento"><div><span>Realização</span><div className={styles.partnerLogo}><Image src="/assets/logos/onzerun-menu.png" alt="11RUN" width={190} height={72} className={styles.runLogo} /></div></div><div><span>Apoio</span><div className={styles.partnerLogo}><Image src="/assets/eventos/prefeitura-vinhedo.webp" alt="Prefeitura de Vinhedo" width={1000} height={367} /></div></div><div><span>Apoio</span><div className={styles.partnerLogo}><Image src="/assets/ivcl-original-color.webp" alt="Instituto Vanderlei Cordeiro de Lima — IVCL" width={640} height={389} /></div></div></section> : null}

    <section className={styles.registration} id="inscricoes" aria-labelledby="inscricoes-titulo"><div className={styles.registrationHeading}><span className={styles.eyebrow}>{event.free ? "Gratuito. Simples. Para participar." : "Sua próxima largada"}</span><h2 id="inscricoes-titulo">{event.free ? "Vamos para essa largada?" : "Garanta sua participação."}</h2><p>{event.registrationText}</p></div>
      {isFinalissima ? <EventRegistrationForm eventId="finalissima-desafio-virtual-2026" /> : isVinhedo ? <EventRegistrationForm eventId="inauguracao-centro-olimpico-vinhedo-2026" schoolEnabled /> : <a className={styles.primaryButton} href={event.registrationUrl} target="_blank" rel="noopener noreferrer">Ir para inscrição no TicketSports<ArrowUpRight size={19} aria-hidden="true" /></a>}
    </section>

    <section className={styles.faq} aria-labelledby="duvidas-titulo"><div><span className={styles.eyebrow}>Antes da largada</span><h2 id="duvidas-titulo">Dúvidas frequentes.</h2><a href={`tel:+${event.whatsapp}`} className={styles.contact}><Phone size={17} aria-hidden="true" /><span>Organização<strong>{event.phoneLabel}</strong></span></a></div><div className={styles.questions}>{event.faq.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div></section>

    <Link href="/" className={styles.back}><ArrowLeft size={16} aria-hidden="true" />Voltar ao Portal 11RUN</Link>
  </article>;
}
