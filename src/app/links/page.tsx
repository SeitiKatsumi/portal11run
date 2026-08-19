import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Globe2,
  House,
  Mail,
  Medal,
  MessageCircle,
  Orbit
} from "lucide-react";
import styles from "./links.module.css";

export const metadata: Metadata = {
  title: "Links oficiais",
  description: "Acesse rapidamente os principais projetos, desafios e ferramentas da 11RUN.",
  alternates: { canonical: "/links" }
};

const links = [
  {
    label: "Projeto 11RUN Futuro",
    description: "Formação, oportunidades e futuro para jovens atletas.",
    href: "/onze-futuro",
    icon: Medal
  },
  {
    label: "Desafio Virtual 2026",
    description: "Corra 1.000 metros e entre para o ranking nacional.",
    href: "/projetos/circuito-virtual-11run",
    icon: Globe2
  },
  {
    label: "Você nas Olimpíadas?",
    description: "Descubra até onde a sua marca pode sonhar.",
    href: "/referencias/calculadoras/chance-olimpica",
    icon: Orbit
  },
  {
    label: "Portal 11RUN",
    description: "Explore todo o ecossistema 11RUN.",
    href: "/",
    icon: House
  }
];

export default function LinksPage() {
  return (
    <div className={styles.page} id="links-page">
      <div className={styles.orbitOne} aria-hidden="true" />
      <div className={styles.orbitTwo} aria-hidden="true" />

      <section className={styles.shell} aria-labelledby="links-title">
        <header className={styles.header}>
          <Link href="/" aria-label="Ir para o Portal 11RUN">
            <Image src="/assets/logos/onzerun-menu.png" alt="11RUN" width={152} height={54} priority />
          </Link>
          <span>Links oficiais</span>
          <h1 id="links-title">Tudo o que move a 11RUN, em um só lugar.</h1>
          <p>Projetos, desafios e ferramentas para quem acredita que cada passo pode abrir um novo caminho.</p>
        </header>

        <nav className={styles.links} aria-label="Links rápidos da 11RUN">
          {links.map(({ label, description, href, icon: Icon }, index) => (
            <Link href={href} className={styles.linkCard} key={href}>
              <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.icon}><Icon size={21} strokeWidth={1.65} /></span>
              <span className={styles.copy}>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <ArrowUpRight className={styles.arrow} size={20} strokeWidth={1.65} />
            </Link>
          ))}
        </nav>

        <footer className={styles.contact}>
          <span>Fale com a 11RUN</span>
          <div>
            <a
              href="https://wa.me/5511999385329"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Conversar com a 11RUN pelo WhatsApp"
              title="WhatsApp"
            >
              <MessageCircle size={23} strokeWidth={1.55} />
            </a>
            <a
              href="mailto:11run@elevenmind.com.br"
              aria-label="Enviar e-mail para 11run@elevenmind.com.br"
              title="E-mail"
            >
              <Mail size={23} strokeWidth={1.55} />
            </a>
          </div>
          <small>11run@elevenmind.com.br</small>
        </footer>
      </section>
    </div>
  );
}
