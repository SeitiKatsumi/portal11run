import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import type { EventLandingContent } from "@/lib/event-content";
import { isVinhedoRegistrationOpen } from "@/lib/vinhedo-registration";
import { VinhedoRegistrationForm } from "@/components/VinhedoRegistrationForm";
import styles from "./EventLanding.module.css";

export function VinhedoLanding({ event }: { event: EventLandingContent }) {
  const registrationOpen = isVinhedoRegistrationOpen();

  return <article className={`${styles.page} ${styles.vinhedo}`}>
    <Link href="/" className={styles.back}><ArrowLeft size={16} aria-hidden="true" />Portal 11RUN<span>/ Eventos</span></Link>
    <figure className={styles.banner} aria-label="Banner do evento, formato 1920 por 700">
      <Image src={event.bannerSrc} alt={event.bannerAlt} fill sizes="(max-width: 720px) calc(100vw - 28px), (max-width: 1328px) calc(100vw - 48px), 1280px" priority className={styles.bannerImage} />
    </figure>

    <header className={styles.vinhedoCopy}>
      <span className={styles.eyebrow}>Um convite da Prefeitura de Vinhedo</span>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      {event.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </header>

    <dl className={styles.vinhedoDetails}>
      <div><CalendarDays size={21} aria-hidden="true" /><dt>Data</dt><dd><time dateTime={event.dateTime}>{event.dateLabel}</time></dd></div>
      <div><Clock3 size={21} aria-hidden="true" /><dt>Horário</dt><dd>{event.timeLabel}</dd></div>
      <div><MapPin size={21} aria-hidden="true" /><dt>Local</dt><dd>{event.venue}</dd></div>
      <div><MapPin size={21} aria-hidden="true" /><dt>Endereço</dt><dd>{event.address}<a href={event.directionsUrl} className={styles.textLink} target="_blank" rel="noopener noreferrer">Como chegar<ArrowUpRight size={16} aria-hidden="true" /></a></dd></div>
    </dl>

    <div className={styles.vinhedoInvite}>
      <p>{event.introTitle}</p>
      {registrationOpen ? <a className={styles.primaryButton} href="#inscricoes">INSCREVA SEU FILHO GRATUITAMENTE ATÉ O DIA 02/11.<ArrowUpRight size={19} aria-hidden="true" /></a> : <p className={styles.availability}>Inscrições encerradas em 02/11/2026.</p>}
    </div>

    <section className={styles.registration} id="inscricoes" aria-labelledby="inscricoes-titulo">
      <div className={styles.registrationHeading}><h2 id="inscricoes-titulo">Inscrição gratuita</h2><p>{event.registrationText}</p></div>
      <VinhedoRegistrationForm initialOpen={registrationOpen} />
    </section>
  </article>;
}
