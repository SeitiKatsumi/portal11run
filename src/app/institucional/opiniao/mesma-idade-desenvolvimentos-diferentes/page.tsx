import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ShieldCheck } from "lucide-react";
import { MaturationExperience } from "@/components/MaturationExperience";
import { faqs } from "@/lib/maturation-content";
import styles from "./page.module.css";

const title = "Mesma idade. Desenvolvimentos diferentes.";
const description = "Entenda como crescimento, maturação e idade relativa influenciam o desempenho de jovens atletas e conheça a abordagem de desenvolvimento do 11RUN.";
const path = "/institucional/opiniao/mesma-idade-desenvolvimentos-diferentes";

export const metadata: Metadata = {
  title: `${title} | Análises 11RUN`, description,
  alternates: { canonical: path },
  openGraph: { title, description, type: "article", url: path, images: [{ url: "/assets/opiniao/mesma-idade-og.png", width: 1792, height: 934, alt: title }] },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/opiniao/mesma-idade-og.png"] }
};

export default function MaturationOpinionPage() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://11run.com.br";
  const schemas = [{ "@context": "https://schema.org", "@type": "Article", headline: title, description, author: { "@type": "Person", name: "Seiti Katsumi" }, publisher: { "@type": "Organization", name: "11RUN", url: origin }, mainEntityOfPage: `${origin}${path}` }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: origin }, { "@type": "ListItem", position: 2, name: "Referências", item: `${origin}/referencias/ranking-brasil` }, { "@type": "ListItem", position: 3, name: "Análises", item: `${origin}${path}` }] }, { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }];

  return <article className={styles.page}>
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}
    <nav className={styles.breadcrumb} aria-label="Trilha de navegação"><Link href="/">Início</Link><span>/</span><Link href="/referencias/ranking-brasil">Referências</Link><span>/</span><strong>Análises</strong></nav>
    <header className={styles.hero}>
      <div className={styles.heroCopy}><span className={styles.eyebrow}>Análises 11RUN · Ciência aplicada ao esporte de base</span><h1>Mesma idade.<br /><em>Desenvolvimentos diferentes.</em></h1><p>No esporte de base, o cronômetro mostra o resultado de hoje — mas não define, sozinho, o potencial de amanhã.</p><div className={styles.actions}><a href="#entenda">Entenda como funciona <ArrowDown /></a><Link href="/onze-futuro">Conheça o Onze Futuro <ArrowRight /></Link></div><small>Ciência · Acompanhamento longitudinal · Infância protegida · Decisões humanas</small></div>
      <div className={styles.heroVisual} aria-label="Duas linhas de desenvolvimento avançam em ritmos diferentes"><div className={styles.trackLineA} /><div className={styles.trackLineB} /><span>A trajetória não é uma linha reta.</span></div>
    </header>
    <nav className={styles.jumpNav} aria-label="Nesta análise">{[["Entenda","entenda"],["As diferenças","diferencas"],["Crescimento","crescimento"],["Talento","talento"],["Método 11RUN","metodo"],["Para famílias","familias"],["Ciência","ciencia"],["Dúvidas","duvidas"]].map(([label,id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
    <MaturationExperience />
    <section className={styles.signature}><div><span className={styles.eyebrow}>Análises</span><h2>Desenvolver é continuar dando oportunidade para o talento aparecer.</h2><p>Resultados importam. Competições importam. Mas uma criança precisa ser vista como uma trajetória em construção — nunca como uma marca definitiva.</p></div><div><strong>Seiti Katsumi</strong><span>Fundador da 11RUN</span></div></section>
    <section className={styles.finalCta}><ShieldCheck /><span className={styles.eyebrow}>Próximo passo</span><h2>O futuro não precisa ser adivinhado. Precisa ser acompanhado.</h2><p>Quando respeitamos o tempo de cada atleta, criamos mais oportunidades para que o talento continue se desenvolvendo.</p><div className={styles.actions}><Link href="/onze-futuro">Conheça o Onze Futuro <ArrowRight /></Link><Link href="/cadastro/onze-futuro">Cadastrar um atleta</Link><Link href="/apoie">Apoiar o projeto</Link></div></section>
  </article>;
}
