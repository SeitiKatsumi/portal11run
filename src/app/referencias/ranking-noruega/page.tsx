import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Globe2, Radio, Route } from "lucide-react";
import { InternationalRankingExplorer } from "@/components/InternationalRankingExplorer";
import styles from "../ranking-japao/ranking-japao.module.css";

export const metadata: Metadata = {
  title: "Ranking de Atletismo de Base na Noruega | 11Run",
  description: "Rankings noruegueses de 800 m, 1.500 m e 3.000 m para atletas de 13 a 16 anos, organizados pela 11Run."
};

export default function NorwayRankingPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span>/</span><span>Referências</span><span>/</span><strong>Ranking na Noruega</strong>
      </nav>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Radio size={14} /> Referência europeia</span>
          <h1>Ranking do Atletismo de Base na Noruega</h1>
          <p className={styles.lead}>Uma leitura direta das marcas nacionais de atletas entre 13 e 16 anos.</p>
          <p>A 11Run organiza resultados válidos da temporada ao ar livre, preservando nome, clube, nascimento, competição, local e data publicados na estatística norueguesa.</p>
          <a className={styles.sourceButton} href="https://www.minfriidrettsstatistikk.info/php/LandsStatistikk.php" target="_blank" rel="noopener noreferrer">
            Acessar fonte <ArrowUpRight size={17} />
          </a>
        </div>
        <div className={styles.orbit} aria-hidden="true"><span className={styles.brazil}>BR</span><div><Globe2 size={44} /><small>11RUN / NORGE</small></div><span className={styles.japan}>NO</span></div>
        <div className={styles.metrics}>
          <article><Globe2 size={18} /><span>País</span><strong>Noruega</strong></article>
          <article><Database size={18} /><span>Temporada</span><strong>2026</strong></article>
          <article><Route size={18} /><span>Provas</span><strong>800 · 1.500 · 3.000 m</strong></article>
          <article><Radio size={18} /><span>Idades</span><strong>13 a 16 anos</strong></article>
        </div>
      </section>
      <section className={styles.conversion}>
        <div><span className={styles.eyebrow}>Leitura transparente</span><h2>Uma idade por categoria</h2><p>A fonte separa meninos e meninas por idade exata. A 11Run mantém essa lógica para evitar equivalências imprecisas.</p></div>
        <div className={`${styles.ageMap} ${styles.ageMapFour}`}>
          {[13, 14, 15, 16].map((age) => <article key={age}><strong>{age}</strong><span>anos</span><small><b>Gutter / Jenter</b>Masculino / feminino</small></article>)}
        </div>
        <p className={styles.note}>A ordem considera as melhores marcas válidas exibidas na tabela principal. Se uma combinação ainda não tiver resultado, a interface informa isso claramente.</p>
      </section>
      <Suspense fallback={<div className={styles.loading}>Preparando filtros internacionais...</div>}><InternationalRankingExplorer country="NO" /></Suspense>
      <section className={styles.privacy}><span>Transparência da fonte</span><p>A 11Run é uma plataforma independente de organização e referência. Em caso de divergência, prevalece a publicação original da estatística norueguesa.</p></section>
    </main>
  );
}
