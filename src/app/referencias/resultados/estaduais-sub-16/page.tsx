import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Flag, MapPinned, Route } from "lucide-react";
import { StateFederationResultsExplorer } from "@/components/StateFederationResultsExplorer";
import styles from "../../ranking-japao/ranking-japao.module.css";

export const metadata: Metadata = {
  title: "Resultados Estaduais Sub-16 | 11Run",
  description: "Resultados estaduais Sub-16 de meio-fundo e fundo pesquisados diretamente nas federações oficiais de atletismo."
};

export default function StateUnder16ResultsPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span>/</span><span>Referências</span><span>/</span><span>Resultados</span><span>/</span><strong>Estaduais Sub 16</strong>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><MapPinned size={14} /> Resultados por estado</span>
          <h1>Estaduais Sub-16</h1>
          <p className={styles.lead}>Resultados Sub-16 de meio-fundo e fundo pesquisados diretamente nas federações oficiais de cada estado.</p>
          <p>Selecione gênero, prova e UF para consultar boletins estaduais e marcas homologadas na CBAt. Cada resultado identifica claramente sua origem, preservando atleta, equipe, competição, data e documento oficial.</p>
          <a className={styles.sourceButton} href="https://competicoes.cbat.org.br/novo/federacoes/" target="_blank" rel="noopener noreferrer">
            Ver federações filiadas <ArrowUpRight size={17} />
          </a>
        </div>
        <div className={styles.orbit} aria-hidden="true"><span className={styles.brazil}>UF</span><div><MapPinned size={44} /><small>BRASIL / SUB-16</small></div><span className={styles.japan}>16</span></div>
        <div className={styles.metrics}>
          <article><Flag size={18} /><span>Abrangência</span><strong>Estados brasileiros</strong></article>
          <article><Database size={18} /><span>Fontes</span><strong>Federações + CBAt</strong></article>
          <article><Route size={18} /><span>Escopo</span><strong>Meio-fundo e fundo</strong></article>
          <article><MapPinned size={18} /><span>Categoria</span><strong>Sub-16</strong></article>
        </div>
      </section>

      <section className={styles.conversion}>
        <div>
          <span className={styles.eyebrow}>Filtros completos</span>
          <h2>Um retrato de cada estado</h2>
          <p>A classificação prioriza a federação local e usa resultados homologados pela CBAt para completar as lacunas de cada estado.</p>
        </div>
        <div className={`${styles.ageMap} ${styles.ageMapWide}`}>
          <article><strong>1.000 m</strong><span>Meio-fundo</span><small><b>Categoria Sub-16</b>Conforme o programa estadual</small></article>
          <article><strong>2.000 m</strong><span>Fundo</span><small><b>Categoria Sub-16</b>Conforme o programa estadual</small></article>
          <article><strong>27 UFs</strong><span>Cobertura</span><small><b>Pesquisa nacional</b>Sem dados artificiais</small></article>
        </div>
        <p className={styles.note}>Cada federação adota calendário e formato próprios. Quando o boletim de 2026 não estiver acessível ou estiver incompleto, a consulta busca as marcas homologadas pela CBAt especificamente para a UF selecionada.</p>
      </section>

      <Suspense fallback={<div className={styles.loading}>Preparando resultados estaduais...</div>}>
        <StateFederationResultsExplorer />
      </Suspense>

      <section className={styles.privacy}><span>Fontes oficiais identificadas</span><p>As marcas são conferidas nos canais estaduais e, complementarmente, no ranking homologado da CBAt com filtro direto por UF. A origem permanece indicada em cada linha. Esta área não usa a base do Desafio Virtual 11Run.</p></section>
    </main>
  );
}
