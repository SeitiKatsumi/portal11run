import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Facebook, Flag, Instagram, MapPin, MessageCircle, Users } from "lucide-react";
import styles from "./EventLanding.module.css";

type EventLandingHeroProps = {
  title: ReactNode;
  description: string;
  dateLabel: string;
  city: string;
  bannerSrc: string;
  bannerAlt: string;
  directionsUrl?: string;
  instagramUrl?: string;
  whatsapp: string;
  free: boolean;
  registrationUrl?: string;
  registrationNote?: string;
  schoolEnabled?: boolean;
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  breadcrumbLabel?: string;
  canonicalPath: string;
};

export function EventLandingHero({ title, description, dateLabel, city, bannerSrc, bannerAlt, directionsUrl, instagramUrl, whatsapp, free, registrationUrl, registrationNote, schoolEnabled, primaryCta, secondaryCta, breadcrumbLabel = "Eventos", canonicalPath }: EventLandingHeroProps) {
  const registrationHref = registrationUrl ?? "#inscricoes";
  const externalRegistration = /^https?:\/\//.test(registrationHref);
  const socialUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://11run.com.br${canonicalPath}`)}`;

  return <>
    <Link href="/" className={styles.back}><ArrowLeft size={16} aria-hidden="true" />Portal 11RUN<span>/ {breadcrumbLabel}</span></Link>

    <figure className={styles.banner} aria-label="Banner do evento, formato 1920 por 700">
      <Image src={bannerSrc} alt={bannerAlt} fill sizes="(max-width: 720px) calc(100vw - 28px), (max-width: 1328px) calc(100vw - 48px), 1280px" priority className={styles.bannerImage} />
      <figcaption className={styles.bannerLabel}><Flag size={14} aria-hidden="true" />11RUN · Encontros que movem</figcaption>
    </figure>

    <header className={styles.hero}>
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span className={styles.dot} />{dateLabel} · {city}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className={styles.signupCallout}>
        <span className={styles.availability}><Check size={16} aria-hidden="true" />{free ? "Inscrições gratuitas" : "Inscrições no TicketSports"}</span>
        {primaryCta ?? <a className={styles.primaryButton} href={registrationHref} {...(externalRegistration ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{free ? "Quero participar" : "Inscrever no TicketSports"}<ArrowUpRight size={19} aria-hidden="true" /></a>}
        {schoolEnabled ? <a href="#inscricoes-escola" className={styles.schoolButton}><Users size={17} aria-hidden="true" />Inscrever escola ou grupo<ArrowRight size={16} aria-hidden="true" /></a> : null}
        {secondaryCta}
        <small>{registrationNote ?? (free ? "Pelo site ou na hora, no local do evento." : "Valores e vagas na plataforma oficial.")}</small>
      </div>
      <nav className={styles.quickLinks} aria-label="Acesso e redes do evento">
        {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={19} aria-hidden="true" /><span>Como chegar</span><ArrowUpRight size={14} aria-hidden="true" /></a> : null}
        {instagramUrl ? <a href={instagramUrl} target="_blank" rel="noopener noreferrer"><Instagram size={19} aria-hidden="true" /><span>Instagram</span><ArrowUpRight size={14} aria-hidden="true" /></a> : <a href={socialUrl} target="_blank" rel="noopener noreferrer"><Facebook size={19} aria-hidden="true" /><span>Compartilhar</span><ArrowUpRight size={14} aria-hidden="true" /></a>}
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} aria-hidden="true" /><span>WhatsApp</span><ArrowUpRight size={14} aria-hidden="true" /></a>
      </nav>
    </header>
  </>;
}
