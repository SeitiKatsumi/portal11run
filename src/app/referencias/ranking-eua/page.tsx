import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Flag, Globe2, Radio } from "lucide-react";
import { InternationalRankingExplorer } from "@/components/InternationalRankingExplorer";
import { usaRankingSources } from "@/lib/usa-ranking-sources";
import styles from "../ranking-japao/ranking-japao.module.css";

export const metadata: Metadata = {
  title: "Ranking Juvenil de Atletismo nos EUA | 11Run",
  description: "Resultados juvenis dos EUA por faixa etária, gênero e prova, com fonte oficial USATF e referências complementares."
};

const ageBands = ["8 e abaixo", "9–10", "11–12", "13–14", "15–16", "Sub-20 · 17–18"];

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
          <p className={styles.lead}>Um único Top 100 com as melhores marcas juvenis oficialmente disponíveis.</p>
          <p>A 11Run reúne USATF e AAU, compara marcas equivalentes, remove duplicidades prováveis e mantém a federação de origem visível em cada resultado.</p>
          <a className={styles.sourceButton} href="https://www.usatf.org/events/2026/2026-usatf-national-junior-olympic-track-field-cha" target="_blank" rel="noopener noreferrer">
            Acessar evento oficial <ArrowUpRight size={17} />
          </a>
        </div>
        <div className={styles.orbit} aria-hidden="true"><span className={styles.brazil}>BR</span><div><Globe2 size={44} /><small>11RUN / USA</small></div><span className={styles.japan}>USA</span></div>
        <div className={styles.metrics}>
          <article><Flag size={18} /><span>Fontes integradas</span><strong>USATF + AAU</strong></article>
          <article><Database size={18} /><span>Cobertura</span><strong>2 bases oficiais</strong></article>
          <article><Radio size={18} /><span>Formato</span><strong>Top 100 unificado</strong></article>
          <article><Globe2 size={18} /><span>Faixas</span><strong>Até Sub-20</strong></article>
        </div>
      </section>
      <section className={styles.conversion}>
        <div><span className={styles.eyebrow}>Categorias USATF</span><h2>Faixas oficiais, sem conversão</h2><p>As categorias aparecem como são usadas no programa juvenil americano. Em “8 e abaixo”, a edição nacional de pista usa a divisão 7–8.</p></div>
        <div className={`${styles.ageMap} ${styles.ageMapWide}`}>
          {ageBands.map((band) => <article key={band}><strong>{band}</strong><span>anos</span><small><b>USATF Youth</b>Divisão oficial</small></article>)}
        </div>
        <p className={styles.note}>Os 3.000 m começam em 11–12 anos. Nos programas juvenis USATF e AAU, a faixa final é 17–18 anos e funciona aqui como referência Sub-20. O ranking usa até 100 marcas disponíveis, sem preenchimento artificial.</p>
      </section>
      <Suspense fallback={<div className={styles.loading}>Preparando filtros internacionais...</div>}><InternationalRankingExplorer country="US" /></Suspense>
      <section className={styles.sourceDirectory}>
        <div><span className={styles.eyebrow}>Mapa de cobertura</span><h2>Federações e fontes verificadas</h2><p>USATF e AAU já alimentam o ranking único. As demais fontes permanecem mapeadas com o nível real de acesso, sem misturar governança, plataforma técnica e resultado oficial.</p></div>
        <div>
          {usaRankingSources.map((source) => (
            <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" key={source.key}>
              <div><strong>{source.shortName}</strong><small className={styles.sourceStatus}>{source.statusLabel}</small></div>
              <span>{source.description}<small>{source.coverage}</small></span>
              <ArrowUpRight size={16} />
            </a>
          ))}
        </div>
      </section>
      <section className={styles.privacy}><span>Transparência da fonte</span><p>A 11Run não representa USATF, AAU, NFHS ou Athletic.net. Resultados oficiais prevalecem sobre a organização visual do portal. Athletic.net não é importado automaticamente porque o acesso público completo é limitado; a NFHS coordena 51 associações autônomas e não publica uma classificação nacional única.</p></section>
    </main>
  );
}
