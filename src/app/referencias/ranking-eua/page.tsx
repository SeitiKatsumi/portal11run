import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Flag, Globe2, Radio } from "lucide-react";
import { InternationalRankingExplorer } from "@/components/InternationalRankingExplorer";
import styles from "../ranking-japao/ranking-japao.module.css";

export const metadata: Metadata = {
  title: "Ranking Juvenil de Atletismo nos EUA | 11Run",
  description: "Resultados juvenis dos EUA por faixa etária, gênero e prova, com fonte oficial USATF e referências complementares."
};

const ageBands = ["8 e abaixo", "9–10", "11–12", "13–14", "15–16", "17–18"];

export default function UsaRankingPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span>/</span><span>Referências</span><span>/</span><strong>Ranking nos EUA</strong>
      </nav>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Radio size={14} /> Resultados juvenis</span>
          <h1>Ranking do Atletismo de Base nos EUA</h1>
          <p className={styles.lead}>Resultados oficiais da principal competição juvenil nacional, acompanhados por fase.</p>
          <p>A 11Run conecta os resultados da USATF National Junior Olympics 2026 e identifica finais, preliminares e listas de largada sem misturar status.</p>
          <a className={styles.sourceButton} href="https://www.usatf.org/events/2026/2026-usatf-national-junior-olympic-track-field-cha" target="_blank" rel="noopener noreferrer">
            Acessar evento oficial <ArrowUpRight size={17} />
          </a>
        </div>
        <div className={styles.orbit} aria-hidden="true"><span className={styles.brazil}>BR</span><div><Globe2 size={44} /><small>11RUN / USATF</small></div><span className={styles.japan}>USA</span></div>
        <div className={styles.metrics}>
          <article><Flag size={18} /><span>Fonte principal</span><strong>USATF</strong></article>
          <article><Database size={18} /><span>Edição</span><strong>Junior Olympics 2026</strong></article>
          <article><Radio size={18} /><span>Status</span><strong>Fase identificada</strong></article>
          <article><Globe2 size={18} /><span>Faixas</span><strong>Até 18 anos</strong></article>
        </div>
      </section>
      <section className={styles.conversion}>
        <div><span className={styles.eyebrow}>Categorias USATF</span><h2>Faixas oficiais, sem conversão</h2><p>As categorias aparecem como são usadas no programa juvenil americano. Em “8 e abaixo”, a edição nacional de pista usa a divisão 7–8.</p></div>
        <div className={`${styles.ageMap} ${styles.ageMapWide}`}>
          {ageBands.map((band) => <article key={band}><strong>{band}</strong><span>anos</span><small><b>USATF Youth</b>Divisão oficial</small></article>)}
        </div>
        <p className={styles.note}>Os 3.000 m começam em 11–12 anos. Enquanto a competição estiver em andamento, uma preliminar concluída pode aparecer antes da final; o status será atualizado quando a fonte publicar a fase seguinte.</p>
      </section>
      <Suspense fallback={<div className={styles.loading}>Preparando filtros internacionais...</div>}><InternationalRankingExplorer country="US" /></Suspense>
      <section className={styles.sourceDirectory}>
        <div><span className={styles.eyebrow}>Ecossistema de referência</span><h2>Fontes complementares dos EUA</h2><p>A classificação exibida acima usa o resultado oficial da competição. Estes links ampliam a pesquisa, mas não são fundidos automaticamente por representarem universos diferentes.</p></div>
        <div>
          <a href="https://www.usatf.org/programs/youth" target="_blank" rel="noopener noreferrer"><strong>USATF Youth</strong><span>Programa e categorias</span><ArrowUpRight size={16} /></a>
          <a href="https://www.athletic.net/TrackAndField/Division/Top.aspx?Meet=644030" target="_blank" rel="noopener noreferrer"><strong>Athletic.net</strong><span>Referências de desempenho</span><ArrowUpRight size={16} /></a>
          <a href="https://www.aausports.org/track-and-field/resultsrankings/" target="_blank" rel="noopener noreferrer"><strong>AAU</strong><span>Resultados e rankings</span><ArrowUpRight size={16} /></a>
        </div>
      </section>
      <section className={styles.privacy}><span>Transparência da fonte</span><p>A 11Run não representa a USATF, a AAU ou o Athletic.net. Resultados e status oficiais prevalecem sempre sobre a organização visual apresentada no portal.</p></section>
    </main>
  );
}
