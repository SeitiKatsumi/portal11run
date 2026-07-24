import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Gift, HandHeart, HeartHandshake, ShoppingBag } from "lucide-react";
import styles from "./support.module.css";

export const metadata: Metadata = {
  title: "Apoie o Projeto",
  description: "Patrocine jovens atletas, faça uma doação, seja voluntário ou compre produtos oficiais da 11RUN.",
  alternates: { canonical: "/apoie" },
  openGraph: {
    title: "Apoie o Projeto 11RUN",
    description: "Cada contribuição se transforma em estrutura, oportunidade e futuro.",
    images: ["/assets/athletes/turma-onze-futuro.webp"]
  }
};

const cards = [
  { title: "Loja 11Run", text: "Produtos oficiais que ajudam a financiar os projetos e fortalecem a comunidade.", href: "/apoie-o-projeto", icon: ShoppingBag },
  { title: "Patrocine o Projeto", text: "Associe sua marca a um projeto esportivo, social e humano.", href: "/apoie/patrocine", icon: HeartHandshake },
  { title: "Faça uma Doação", text: "Contribua diretamente com materiais, viagens, provas e oportunidades.", href: "/apoie/doacao", icon: Gift },
  { title: "Seja um Voluntário", text: "Ofereça conhecimento, atendimento, orientação ou apoio operacional.", href: "/apoie/voluntariado", icon: HandHeart }
];

const uses = [
  "Uniformes e materiais esportivos", "Inscrições em provas", "Transporte e hospedagem",
  "Alimentação em competições", "Avaliações físicas e de saúde", "Atendimento multidisciplinar",
  "Estrutura de treinamento", "Premiações e eventos", "Tecnologia para os atletas", "Expansão para novas regiões"
];

export default function SupportHubPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span>Faça parte do ecossistema 11RUN</span>
          <h1>Todo grande sonho precisa de alguém que acredite.</h1>
          <p>A 11RUN cria oportunidades reais para jovens atletas, equipes de base, corredores master e talentos de diferentes regiões do Brasil. Você pode apoiar essa jornada de quatro formas.</p>
          <div className={styles.actions}><Link href="/apoie/patrocine">Quero patrocinar <ArrowRight size={17} /></Link><Link href="/apoie/doacao">Fazer uma doação</Link><Link href="/apoie/voluntariado">Ser voluntário</Link></div>
        </div>
        <div className={styles.heroImage}><img src="/assets/athletes/turma-onze-futuro.webp" alt="Jovens atletas do projeto 11RUN Futuro" /></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><span>Formas de apoio</span><h2>Escolha como participar.</h2><p>Da compra de uma camiseta à construção de uma parceria nacional, cada forma de apoio fortalece a mesma missão.</p></div>
        <div className={styles.cardGrid}>{cards.map(({ icon: Icon, ...card }) => <article className={styles.card} key={card.href}><Icon size={27} strokeWidth={1.5} /><h3>{card.title}</h3><p>{card.text}</p><Link href={card.href}>Acessar <ArrowRight size={16} /></Link></article>)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><span>Transparência</span><h2>Onde o apoio se transforma em estrutura.</h2></div>
        <div className={styles.useGrid}>{uses.map((item) => <article key={item}><CheckIcon /><strong>{item}</strong></article>)}</div>
        <p className={styles.statement}>Cada contribuição se transforma em estrutura, oportunidade e futuro para os nossos atletas.</p>
      </section>
    </main>
  );
}

function CheckIcon() {
  return <HandHeart size={22} strokeWidth={1.45} />;
}
