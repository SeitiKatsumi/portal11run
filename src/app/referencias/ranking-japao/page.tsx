import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Globe2, Languages, Radio } from "lucide-react";
import { JapanRankingExplorer } from "@/components/JapanRankingExplorer";
import styles from "./ranking-japao.module.css";

export const metadata: Metadata = {
  title: "Ranking de Atletismo de Base no Japão | 11Run",
  description: "Rankings escolares japoneses de 800 m a 5.000 m, do ginasial ao Sub-20, organizados em português pela tecnologia 11Run."
};

export default function JapanRankingPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span>/</span><span>Referências</span><span>/</span><strong>Ranking no Japão</strong>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Radio size={14} /> Dados internacionais</span>
          <h1>Ranking do Atletismo de Base no Japão</h1>
          <p className={styles.lead}>A tecnologia 11Run aproxima nossos atletas das principais referências mundiais.</p>
          <p>A 11Run consulta as bases oficiais ginasial e colegial da JAAF, organiza os resultados e converte as séries em idades de referência. Os resultados esportivos não são alterados: a tecnologia apenas coleta, estrutura e apresenta a informação com mais clareza.</p>
          <a className={styles.sourceButton} href="https://www.jaaf.or.jp/remote/juniorhighschool/2026/ranking/" target="_blank" rel="noopener noreferrer">
            Ranking ginasial JAAF <ArrowUpRight size={17} />
          </a>
        </div>
        <div className={styles.orbit} aria-hidden="true">
          <span className={styles.brazil}>BR</span>
          <div><Globe2 size={44} /><small>11RUN / JAAF</small></div>
          <span className={styles.japan}>日本</span>
        </div>
        <div className={styles.metrics}>
          <article><Globe2 size={18} /><span>Fonte oficial</span><strong>JAAF</strong></article>
          <article><Database size={18} /><span>Temporada</span><strong>2026</strong></article>
          <article><Radio size={18} /><span>Cobertura</span><strong>Ginasial ao Sub-20</strong></article>
          <article><Languages size={18} /><span>Camada 11Run</span><strong>Organizado em português</strong></article>
        </div>
      </section>

      <section className={styles.conversion}>
        <div>
          <span className={styles.eyebrow}>Equivalência operacional</span>
          <h2>Como convertemos as categorias japonesas</h2>
          <p>No Japão, os rankings escolares são organizados por ano escolar. Para facilitar a leitura no Brasil, a 11Run adota uma idade de referência, preservando sempre a série original.</p>
        </div>
        <div className={`${styles.ageMap} ${styles.ageMapWide}`}>
          {[12, 13, 14].map((age, index) => <article key={age}><strong>{age}</strong><span>anos</span><small><b lang="ja">{index + 1}年 · ginasial</b>JAAF junior high</small></article>)}
          {[15, 16, 17].map((age, index) => <article key={age}><strong>{age}</strong><span>{age === 17 ? "Sub-20" : "anos"}</span><small><b lang="ja">{index + 1}年 · colegial</b>JAAF high school</small></article>)}
        </div>
        <p className={styles.note}>Essa é uma equivalência de referência adotada pela 11Run. As provas variam por nível e gênero: 800 m e 1.500 m são amplas; 3.000 m e 5.000 m aparecem somente onde a JAAF as publica. Como o calendário escolar começa em abril, atletas da mesma série podem apresentar pequenas diferenças de idade.</p>
      </section>

      <Suspense fallback={<div className={styles.loading}>Preparando filtros internacionais...</div>}>
        <JapanRankingExplorer />
      </Suspense>

      <section className={styles.privacy}>
        <span>Transparência da fonte</span>
        <p>Os resultados apresentados vêm dos rankings ginasial e colegial disponibilizados pela JAAF. A 11Run atua como plataforma independente de organização e referência, sem vínculo institucional ou representação oficial. Em caso de divergência, prevalece sempre a informação publicada na fonte original.</p>
      </section>
    </main>
  );
}
