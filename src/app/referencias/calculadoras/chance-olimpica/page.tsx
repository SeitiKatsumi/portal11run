import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ShieldCheck, Sparkles } from "lucide-react";
import { OlympicPathwayCalculator } from "@/components/OlympicPathwayCalculator";
import { getOlympicGameCount } from "@/lib/olympic-game-counter";
import styles from "./chance-olimpica.module.css";

export const metadata: Metadata = {
  title: "Probabilidade Olímpica Recreativa 11RUN",
  description:
    "Transforme sua marca em uma jornada divertida por rankings do Brasil e do mundo, desbloqueie conquistas e descubra novas possibilidades.",
  robots: { index: true, follow: true },
};
const faqs = [
  [
    "O que é o Placar de Potencial?",
    "É uma experiência recreativa que transforma sua posição nas referências disponíveis em um placar de 1 a 100.",
  ],
  [
    "O que acontece se eu entrar no Top 30 internacional?",
    "Um Top 30 em EUA, Japão ou Noruega desbloqueia o selo Destaque Internacional e garante um placar mínimo de 35.",
  ],
  [
    "Mesmo 1% significa que existe uma chance?",
    "No espírito do jogo, sim: a largada aconteceu e muita coisa pode mudar. O número celebra possibilidades, não determina o futuro.",
  ],
  [
    "Estar no Top 10 garante alguma coisa?",
    "Desbloqueia uma grande conquista dentro da experiência, mas nenhuma posição garante uma trajetória esportiva específica.",
  ],
  [
    "Não estar no Top 100 encerra o sonho?",
    "De jeito nenhum. Significa apenas que a marca ainda não entrou naquela lista disponível. Rankings, corpos e trajetórias mudam.",
  ],
  [
    "Por que minha idade é importante?",
    "Porque a ferramenta procura comparações mais próximas da fase esportiva atual e dá pesos diferentes a cada tipo de categoria.",
  ],
  [
    "A posição mostrada é oficial?",
    "Não. É uma inserção simulada da marca informada. Somente a organização responsável pode homologar um ranking.",
  ],
  [
    "Os 3.000 m são uma prova olímpica?",
    "Os 3.000 m rasos não integram o programa olímpico outdoor adulto, mas podem abrir rotas recreativas de comparação com 1.500 m e 5.000 m.",
  ],
  [
    "Posso usar o placar como treino?",
    "Use para se divertir e conhecer referências. Para treinar, conte com orientação profissional adequada à sua idade e realidade.",
  ],
];
export default function ChanceOlimpicaPage() {
  const origin = "https://11run.com.br";
  const olympicGameCount = getOlympicGameCount();
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Placar de Potencial Olímpico 11RUN",
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      url: `${origin}/referencias/calculadoras/chance-olimpica`,
      description: "Experiência recreativa de comparação de marcas atléticas.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        "Início",
        "Referências",
        "Calculadoras",
        "Placar de Potencial",
      ].map((name, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name,
      })),
    },
  ];
  return (
    <main className={styles.page}>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\u003c"),
          }}
        />
      ))}
      <nav className={styles.breadcrumb}>
        <Link href="/">Início</Link>
        <span>/</span>
        <span>Referências</span>
        <span>/</span>
        <span>Calculadoras</span>
        <span>/</span>
        <strong>Placar de Potencial</strong>
      </nav>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroBrand}>
            <span className={styles.miniOlympicRings} aria-hidden="true">
              <b />
              <b />
              <b />
              <b />
              <b />
            </span>
            <span className={styles.eyebrow}>
              11RUN Análise de Potencial Olímpico
            </span>
          </div>
          <h1>Até onde a sua marca pode sonhar?</h1>
          <h2>Será que você tem potencial pra ir para as Olimpíadas um dia?</h2>
          <p>
            Explore rankings do Brasil e do mundo, desbloqueie conquistas e
            descubra novas fases para a sua trajetória.
          </p>
          <div className={styles.badge}>
            <ShieldCheck /> Experiência recreativa baseada nos rankings
            disponíveis
          </div>
          <a className={styles.gameCounter} href="#analisar">
            <Sparkles />
            <strong>{olympicGameCount.toLocaleString("pt-BR")}</strong>
            <span>pessoas já jogaram o Placar de Potencial</span>
          </a>
          <div className={styles.heroActions}>
            <a href="#analisar">
              Começar o jogo <ArrowDown />
            </a>
            <a href="#metodologia">Ver regras do placar</a>
          </div>
        </div>
        <aside>
          <div>
            <span className={styles.olympicRings} aria-hidden="true">
              <b />
              <b />
              <b />
              <b />
              <b />
            </span>
            <i />
            <i />
          </div>
          <span>Olympic Potential Game</span>
          <p>Brasil · EUA · Japão · Noruega · Quênia · Uganda · Mundial</p>
        </aside>
      </section>
      <section className={styles.intro} id="metodologia">
        <span className={styles.eyebrow}>Como o jogo funciona</span>
        <h2>
          Uma marca. <em>Seu sonho.</em>
          <br />
          Muitas possibilidades.
        </h2>
        <div>
          <article>
            <strong>1</strong>
            <h3>Entre na pista</h3>
            <p>
              Informe sua prova, seu tempo e a fase esportiva em que você está.
            </p>
          </article>
          <article>
            <strong>2</strong>
            <h3>Explore o mundo</h3>
            <p>
              Sua marca visita rankings compatíveis e acumula energia no placar.
            </p>
          </article>
          <article>
            <strong>3</strong>
            <h3>Desbloqueie conquistas</h3>
            <p>
              Top 30, Top 10, pódio e consistência internacional liberam selos
              especiais.
            </p>
          </article>
        </div>
      </section>
      <OlympicPathwayCalculator />
      <section className={styles.faq}>
        <span className={styles.eyebrow}>Dúvidas frequentes</span>
        <h2>
          Sonhar faz parte do jogo.
          <br />E o jogo pode mudar.
        </h2>
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className={styles.terms}>
        <ShieldCheck />
        <div>
          <span className={styles.eyebrow}>Termos da experiência</span>
          <h2>Jogue, compare e sonhe — com leveza.</h2>
          <p>
            O Placar de Potencial tem finalidade exclusivamente recreativa e
            educativa. Não constitui previsão científica, seleção esportiva,
            diagnóstico de talento ou garantia de participação olímpica. As
            posições são simulações sobre as listas disponíveis no momento e não
            equivalem a homologações oficiais. Rankings, categorias,
            desenvolvimento físico e trajetórias esportivas mudam ao longo do
            tempo.
          </p>
          <p>
            A ferramenta é independente, sem vínculo ou chancela do Comitê
            Olímpico Internacional, de comitês nacionais ou de comitês
            organizadores.
          </p>
        </div>
      </section>
    </main>
  );
}
