import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { IntegralFormationExperience } from "@/components/IntegralFormationExperience";
import { formationFaq } from "@/lib/formation-integral-content";
import styles from "./page.module.css";

const title = "Formação Integral do Atleta: Educação, Esporte e Autonomia";
const description = "Entenda como educação, autonomia, pensamento crítico, dupla carreira e projeto de vida fazem parte da formação de jovens atletas dentro e fora do esporte.";
const path = "/referencias/analises/formacao-integral-do-atleta";

export const metadata: Metadata = {
  title,
  description,
  keywords: ["formação integral do atleta", "esporte e educação", "dupla carreira esportiva", "autonomia no esporte", "treinador como educador", "projeto de vida do atleta", "fundismo de base"],
  alternates: { canonical: path },
  openGraph: { title, description, type: "article", url: path },
  twitter: { card: "summary_large_image", title, description }
};

export default function IntegralFormationPage() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://11run.com.br";
  const schemas = [
    { "@context": "https://schema.org", "@type": "Article", headline: title, description, datePublished: "2026-08-06", dateModified: "2026-08-06", author: { "@type": "Person", name: "Seiti Katsumi" }, publisher: { "@type": "Organization", name: "11RUN", url: origin }, mainEntityOfPage: `${origin}${path}` },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: origin }, { "@type": "ListItem", position: 2, name: "Referências", item: `${origin}/referencias/ranking-brasil` }, { "@type": "ListItem", position: 3, name: "Análises", item: `${origin}/referencias/analises` }, { "@type": "ListItem", position: 4, name: "Formação Integral do Atleta", item: `${origin}${path}` }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: formationFaq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }
  ];
  return <article className={styles.page}>
    {schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,"\\u003c")}} />)}
    <nav className={styles.breadcrumb} aria-label="Trilha de navegação"><Link href="/">Início</Link><span>/</span><Link href="/referencias/ranking-brasil">Referências</Link><span>/</span><strong>Análises</strong><span>/</span><b>Formação Integral do Atleta</b></nav>
    <header className={styles.hero}>
      <div className={styles.heroCopy}><span className={styles.eyebrow}>Análises 11RUN · Formação e desenvolvimento</span><h1>Não basta ensinar a correr.<em> É preciso ensinar a compreender.</em></h1><p>Esporte, educação, autonomia e projeto de vida não são caminhos separados. Fazem parte da formação de uma pessoa capaz de sustentar e transformar a própria trajetória.</p><div className={styles.actions}><a href="#introducao">Comece pela pergunta <ArrowDown /></a><Link href="/onze-futuro">Conheça o Onze Futuro <ArrowRight /></Link></div><small>Leitura de 18 min · Publicado em 6 ago. 2026 · Revisão editorial 11RUN</small></div>
      <div className={styles.heroVisual} aria-label="As trajetórias do esporte e da educação convergem em uma formação integral"><div className={styles.sportLine}><span>Esporte</span></div><div className={styles.educationLine}><span>Educação</span></div><div className={styles.convergence}>Formação integral</div></div>
    </header>
    <nav className={styles.jumpNav} aria-label="Nesta análise">{[["Introdução","introducao"],["Formação integral","formacao"],["Autonomia","autonomia"],["Pensamento crítico","pensamento-critico"],["Dupla carreira","dupla-carreira"],["Brasil","brasil"],["Responsabilidades","responsabilidades"],["Método 11RUN","metodo"],["Ciência","ciencia"],["Dúvidas","duvidas"]].map(([label,id])=><a key={id} href={`#${id}`}>{label}</a>)}</nav>
    <IntegralFormationExperience />
    <section className={styles.related}><div><span className={styles.eyebrow}>Próxima análise</span><h2>Respiração, cérebro e resistência</h2><p>O que a ciência realmente sabe sobre modulação neurorespiratória no fundismo — sem transformar respiração em promessa de performance.</p></div><Link href="/referencias/analises/modulacao-neurorespiratoria-fundismo">Ler próxima análise <ArrowRight /></Link></section>
    <section className={styles.signature}><div><span className={styles.eyebrow}>Análises 11RUN</span><h2>Formação esportiva também é formação para a vida.</h2><p>Alto rendimento, educação e autonomia podem avançar juntos quando o atleta é tratado como pessoa em desenvolvimento — com voz, direitos, contexto e futuro.</p></div><div><strong>Seiti Katsumi</strong><span>Fundador da 11RUN</span></div></section>
  </article>;
}
