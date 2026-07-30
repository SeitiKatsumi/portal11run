import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Globe2, Languages, Radio } from "lucide-react";
import { JapanRankingExplorer } from "@/components/JapanRankingExplorer";
import styles from "./ranking-japao.module.css";

export const metadata: Metadata = {
  title: "Ranking de Atletismo de Base no Japão | 11Run",
  description: "Confira rankings japoneses de 800 m, 1.500 m e 3.000 m para jovens de 12, 13 e 14 anos, organizados e apresentados em português pela tecnologia 11Run."
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
          <p>A 11Run consulta os rankings oficiais do atletismo escolar japonês, organiza os resultados e converte as categorias para a realidade brasileira. Os resultados esportivos não são alterados: a tecnologia apenas coleta, estrutura e apresenta a informação com mais clareza.</p>
          <a className={styles.sourceButton} href="https://www.jaaf.or.jp/remote/juniorhighschool/2026/ranking/" target="_blank" rel="noopener noreferrer">
            Acessar fonte oficial <ArrowUpRight size={17} />
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
          <article><Radio size={18} /><span>Por ranking</span><strong>Até 100 atletas</strong></article>
          <article><Languages size={18} /><span>Camada 11Run</span><strong>Organizado em português</strong></article>
        </div>
      </section>

      <section className={styles.conversion}>
        <div>
          <span className={styles.eyebrow}>Equivalência operacional</span>
          <h2>Como convertemos as categorias japonesas</h2>
          <p>No Japão, os rankings escolares são organizados por ano escolar. Para facilitar a leitura no Brasil, a 11Run adota uma idade de referência, preservando sempre a série original.</p>
        </div>
        <div className={styles.ageMap}>
          <article><strong>12</strong><span>anos</span><small><b lang="ja">1年 / 1年生</b>Ichi-nensei</small></article>
          <article><strong>13</strong><span>anos</span><small><b lang="ja">2年 / 2年生</b>Ni-nensei</small></article>
          <article><strong>14</strong><span>anos</span><small><b lang="ja">3年 / 3年生</b>San-nensei</small></article>
        </div>
        <p className={styles.note}>Essa é uma equivalência de referência adotada pela 11Run. Como o calendário escolar japonês começa em abril, atletas da mesma série podem apresentar pequenas diferenças de idade e data de nascimento.</p>
      </section>

      <Suspense fallback={<div className={styles.loading}>Preparando filtros internacionais...</div>}>
        <JapanRankingExplorer />
      </Suspense>

      <section className={styles.privacy}>
        <span>Transparência da fonte</span>
        <p>Os resultados apresentados são informações esportivas públicas disponibilizadas pela JAAF. A 11Run atua como uma plataforma independente de organização e referência, sem vínculo institucional ou representação oficial da federação japonesa. Em caso de divergência, prevalece sempre a informação publicada na fonte original.</p>
      </section>
    </main>
  );
}
