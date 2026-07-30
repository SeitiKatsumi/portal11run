import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Flag, Radio, Route } from "lucide-react";
import { InternationalRankingExplorer } from "@/components/InternationalRankingExplorer";
import styles from "../ranking-japao/ranking-japao.module.css";

export const metadata: Metadata = {
  title: "Ranking Brasileiro Sub-16 e Sub-18 | 11Run",
  description: "Até as 100 melhores marcas oficiais da CBAt em provas de meio-fundo e fundo, nas categorias Sub-16 e Sub-18 da temporada 2026."
};

const categories = [
  { label: "Sub-16", years: "nascidos de 2011 a 2013" },
  { label: "Sub-18", years: "nascidos de 2009 a 2011" }
];

export default function BrazilRankingPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span>/</span><span>Referências</span><span>/</span><strong>Ranking no Brasil</strong>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Radio size={14} /> Referência nacional oficial</span>
          <h1>Ranking Brasileiro de Meio-Fundo e Fundo</h1>
          <p className={styles.lead}>As melhores marcas Sub-16 e Sub-18 de 2026, organizadas diretamente a partir da CBAt.</p>
          <p>A 11Run apresenta até 100 atletas por categoria, gênero e prova, preservando marca, equipe, estado, local, data e o acesso à publicação oficial.</p>
          <a className={styles.sourceButton} href="https://cbat.org.br/ranking?ano=2026&ranking=0" target="_blank" rel="noopener noreferrer">
            Acessar ranking da CBAt <ArrowUpRight size={17} />
          </a>
        </div>
        <div className={styles.orbit} aria-hidden="true"><span className={styles.brazil}>11R</span><div><Flag size={44} /><small>11RUN / CBAt</small></div><span className={styles.japan}>BR</span></div>
        <div className={styles.metrics}>
          <article><Flag size={18} /><span>Fonte</span><strong>CBAt</strong></article>
          <article><Database size={18} /><span>Temporada</span><strong>2026</strong></article>
          <article><Route size={18} /><span>Provas</span><strong>800 a 5.000 m</strong></article>
          <article><Radio size={18} /><span>Formato</span><strong>Top 100 por filtro</strong></article>
        </div>
      </section>

      <section className={styles.conversion}>
        <div>
          <span className={styles.eyebrow}>Categorias CBAt 2026</span>
          <h2>Faixas oficiais, sem conversão artificial</h2>
          <p>Os filtros seguem as categorias publicadas no ranking oficial. Quando não houver marca para uma combinação, a página informa a ausência sem preencher a lista.</p>
        </div>
        <div className={styles.ageMap}>
          {categories.map((category) => (
            <article key={category.label}><strong>{category.label}</strong><span>2026</span><small><b>Categoria oficial</b>{category.years}</small></article>
          ))}
        </div>
        <p className={styles.note}>Provas disponíveis: 800 m, 1.500 m, 2.000 m, 3.000 m e 5.000 m. A disponibilidade efetiva varia conforme a categoria e o que estiver publicado pela CBAt.</p>
      </section>

      <Suspense fallback={<div className={styles.loading}>Preparando ranking brasileiro...</div>}>
        <InternationalRankingExplorer country="BR" />
      </Suspense>

      <section className={styles.privacy}><span>Transparência da fonte</span><p>A 11Run organiza dados esportivos públicos da Confederação Brasileira de Atletismo. Em caso de divergência, prevalece sempre o ranking publicado pela CBAt.</p></section>
    </main>
  );
}
