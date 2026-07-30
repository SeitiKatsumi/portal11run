import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Database, Globe2, Radio, Route } from "lucide-react";
import { InternationalRankingExplorer } from "@/components/InternationalRankingExplorer";
import styles from "@/app/referencias/ranking-japao/ranking-japao.module.css";

type Scope = "KE" | "UG" | "WORLD";

const configs = {
  KE: {
    name: "Quênia",
    title: "Ranking Juvenil de Meio-Fundo e Fundo no Quênia",
    eyebrow: "Potência africana · dados oficiais",
    lead: "Melhores tempos quenianos Sub-18 e Sub-20 registrados pela World Athletics.",
    text: "A página reúne apenas provas de pista e mantém o vínculo com as Top Lists oficiais. Os Trials U20 de 2026 em Nairóbi funcionam como fonte nacional complementar.",
    sourceUrl: "https://worldathletics.org/competition/calendar-results/results/7241938",
    sourceLabel: "Ver Trials U20 do Quênia",
    code: "KEN",
    ages: ["Sub-18", "Sub-20"]
  },
  UG: {
    name: "Uganda",
    title: "Ranking Juvenil de Meio-Fundo e Fundo em Uganda",
    eyebrow: "Federação nacional · dados oficiais",
    lead: "Melhores tempos ugandenses Sub-18 e Sub-20 registrados pela World Athletics.",
    text: "A base mundial é confrontada com os resultados e listas de qualificação publicados pela Uganda Athletics, federação nacional reconhecida pela World Athletics.",
    sourceUrl: "https://ugandaathletics.org/u20-world-championships-qualifiers-set-to-hit-record-high/",
    sourceLabel: "Ver qualificados U20 de Uganda",
    code: "UGA",
    ages: ["Sub-18", "Sub-20"]
  },
  WORLD: {
    name: "Mundial",
    title: "Ranking Mundial de Meio-Fundo e Fundo",
    eyebrow: "World Athletics Top Lists",
    lead: "Os melhores tempos do mundo, da menor categoria oficial disponível ao adulto.",
    text: "A consulta usa uma marca por atleta, ordenada exclusivamente pelo tempo. Pontos de resultado não entram na classificação 11Run.",
    sourceUrl: "https://worldathletics.org/records/toplists",
    sourceLabel: "Acessar World Athletics",
    code: "WA",
    ages: ["Sub-18", "Sub-20", "Adulto"]
  }
} as const;

export function WorldAthleticsReferencePage({ scope }: { scope: Scope }) {
  const config = configs[scope];
  const isWorld = scope === "WORLD";
  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Navegação estrutural">
        <Link href="/">Início</Link><span>/</span><span>Referências</span><span>/</span><span>Rankings</span><span>/</span><strong>{config.name}</strong>
      </nav>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Radio size={14} /> {config.eyebrow}</span>
          <h1>{config.title}</h1>
          <p className={styles.lead}>{config.lead}</p>
          <p>{config.text}</p>
          <a className={styles.sourceButton} href={config.sourceUrl} target="_blank" rel="noopener noreferrer">
            {config.sourceLabel} <ArrowUpRight size={17} />
          </a>
        </div>
        <div className={styles.orbit} aria-hidden="true"><span className={styles.brazil}>11R</span><div><Globe2 size={44} /><small>11RUN / {config.code}</small></div><span className={styles.japan}>{config.code}</span></div>
        <div className={styles.metrics}>
          <article><Globe2 size={18} /><span>Fonte de marcas</span><strong>World Athletics</strong></article>
          <article><Database size={18} /><span>Temporada</span><strong>2026</strong></article>
          <article><Route size={18} /><span>Pista</span><strong>{isWorld ? "800 a 10.000 m" : "800 a 5.000 m"}</strong></article>
          <article><Radio size={18} /><span>Critério</span><strong>Melhores tempos</strong></article>
        </div>
      </section>
      <section className={styles.conversion}>
        <div><span className={styles.eyebrow}>Recorte coerente</span><h2>Categorias e provas comparáveis</h2><p>Somente {isWorld ? "800 m, 1.500 m, 3.000 m, 5.000 m e 10.000 m" : "800 m, 1.500 m, 3.000 m e 5.000 m"} de pista. Cada atleta aparece com sua melhor marca oficial disponível na temporada.</p></div>
        <div className={`${styles.ageMap} ${styles.ageMapWide}`}>
          {config.ages.map((age) => <article key={age}><strong>{age}</strong><span>2026</span><small><b>Por tempo</b>Sem ranking de pontos</small></article>)}
        </div>
        <p className={styles.note}>{scope === "WORLD" ? "A World Athletics publica Top Lists nas categorias Sub-18, Sub-20 e Senior. Sub-18 é a menor faixa global disponível nesta base." : "O recorte por país termina no Sub-20. A lista pode conter menos de 100 nomes quando a fonte oficial tiver menos marcas válidas."}</p>
      </section>
      <Suspense fallback={<div className={styles.loading}>Preparando melhores tempos...</div>}>
        <InternationalRankingExplorer country={scope} />
      </Suspense>
      <section className={styles.privacy}><span>Transparência da fonte</span><p>Os tempos e dados biográficos permanecem vinculados à publicação original. A 11Run apenas organiza a consulta e não representa a World Athletics nem as federações nacionais citadas.</p></section>
    </main>
  );
}
