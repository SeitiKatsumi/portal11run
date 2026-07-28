import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  Compass,
  Flag,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Network,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Missão, Visão e Valores",
  description:
    "Conheça a missão, a visão e os valores da 11Run, um ecossistema criado para antecipar a base, desenvolver jovens atletas e construir o futuro do fundismo brasileiro.",
  alternates: { canonical: "/institucional/missao-visao-valores" },
  openGraph: {
    title: "Missão, Visão e Valores 11Run",
    description:
      "Devolver ao fundismo tudo o que o fundismo nos deu. Conheça o propósito que orienta a construção da geração brasileira de 2036.",
    url: "/institucional/missao-visao-valores",
    type: "website",
    images: [
      {
        url: "/assets/onze-futuro-origem.jpg",
        width: 1920,
        height: 1080,
        alt: "Jovens atletas da 11Run reunidas ao lado de uma pista",
      },
    ],
  },
};

const gaps = [
  ["Descoberta tardia", "Talentos chegam tarde à formação porque faltam portas de entrada visíveis.", Target],
  ["Calendário inadequado", "Ainda há poucas provas de meio-fundo e fundo planejadas para a infância.", CalendarDays],
  ["Estrutura distante", "Pistas, clubes e orientação qualificada não chegam igualmente a todas as regiões.", Route],
  ["Caminho interrompido", "Iniciação, formação e alto rendimento ainda funcionam como etapas desconectadas.", Network],
  ["Suporte incompleto", "Famílias precisam de orientação técnica, emocional e educacional ao longo da jornada.", HeartHandshake],
  ["Poucos dados", "Sem rankings e acompanhamento, a evolução e o potencial permanecem invisíveis.", BarChart3],
] as const;

const values = [
  ["Gratidão que se transforma em ação", "Transformamos tudo o que o fundismo nos proporcionou em oportunidades para as próximas gerações."],
  ["Infância protegida", "Nenhum resultado justifica retirar da criança o direito de brincar, aprender e desenvolver-se no seu tempo."],
  ["Base antes da performance", "Antes da medalha existe movimento; antes do atleta existe uma criança que precisa amar o esporte."],
  ["Oportunidade no momento certo", "Uma porta aberta e uma orientação adequada podem mudar toda uma trajetória."],
  ["Desenvolvimento de longo prazo", "Respeitamos fases, maturação, individualidade e continuidade. Não buscamos atalhos."],
  ["Formação integral", "Educação, saúde emocional, autonomia, disciplina, confiança e projeto de vida também formam atletas."],
  ["Família como parte do caminho", "Pais e responsáveis integram o ambiente de segurança, equilíbrio e continuidade da criança."],
  ["Acesso e igualdade de oportunidades", "O talento pode nascer em qualquer cidade; localização e renda não devem determinar quem será visto."],
  ["Ciência, dados e aprendizado", "Observamos, registramos e aprimoramos para tomar decisões responsáveis, orientadas por evidências."],
  ["Integridade e respeito", "Defendemos transparência, jogo limpo, proteção dos atletas e relações éticas."],
  ["Coragem para construir o futuro", "Pensamos grande, começamos com responsabilidade e fazemos hoje aquilo que ainda não existe."],
] as const;

const fronts = [
  {
    title: "11Run Futuro",
    text: "Acompanhar, apoiar e desenvolver jovens atletas com uma visão de longo prazo.",
    href: "/onze-futuro",
    icon: Users,
  },
  {
    title: "Circuito Virtual 11Run",
    text: "Descobrir talentos e criar oportunidades mesmo onde a pista ainda não chegou.",
    href: "/projetos/circuito-virtual-11run",
    icon: Globe2,
  },
  {
    title: "Circuito Futuro 11",
    text: "Criar experiências de pista adequadas para que crianças aprendam a competir.",
    href: "/circuito-futuro-11",
    icon: Flag,
  },
  {
    title: "Conhecimento, dados e continuidade",
    text: "Transformar acompanhamento, resultados e experiências em conhecimento para o futuro.",
    href: "#conhecimento",
    icon: GraduationCap,
  },
] as const;

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className={styles.eyebrow}>{children}</p>;
}

export default function InstitutionalMissionVisionValuesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Missão, Visão e Valores 11Run",
    url: "https://11run.com.br/institucional/missao-visao-valores",
    about: {
      "@type": "Organization",
      name: "11Run",
      description: metadata.description,
    },
  };

  return (
    <article className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className={styles.hero} aria-labelledby="mission-hero-title">
        <Image
          className={styles.heroImage}
          src="/assets/onze-futuro-origem.jpg"
          alt="Jovens atletas da 11Run reunidas ao lado de uma pista"
          fill
          priority
          sizes="(max-width: 720px) calc(100vw - 28px), 1280px"
        />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <Eyebrow>Institucional 11Run</Eyebrow>
          <h1 id="mission-hero-title">Devolver ao fundismo tudo o que o fundismo nos deu.</h1>
          <p>Uma missão de vida transformada em um ecossistema de formação, oportunidades e futuro para o atletismo brasileiro.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/onze-futuro">
              Conheça o 11Run Futuro <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className={styles.secondaryButton} href="/apoie/patrocine">
              Apoie o projeto
            </Link>
          </div>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.origin}`} aria-labelledby="origem-title">
        <div className={styles.sectionCopy}>
          <Eyebrow>Nossa origem</Eyebrow>
          <h2 id="origem-title">Uma dívida de gratidão transformada em propósito.</h2>
          <p>
            Grande parte do que Seiti Katsumi construiu material, intelectual, profissional e humanamente começou no fundismo. A corrida abriu oportunidades, apresentou novas culturas, levou sua trajetória ao Japão e formou valores que atravessaram todas as áreas de sua vida.
          </p>
          <p>
            A 11Run não é apenas um projeto esportivo. É a missão de devolver à modalidade aquilo que ela proporcionou, criando caminhos que não dependam apenas de encontros e circunstâncias.
          </p>
          <blockquote>
            O fundismo não lhe deu apenas resultados. Deu formação, coragem, repertório, conexões, oportunidades e uma maneira de enxergar a vida.
          </blockquote>
        </div>
        <figure className={styles.portrait}>
          <Image
            src="/assets/trajetoria-seiti/melhor-marca-5000m.jpg"
            alt="Registro da trajetória esportiva de Seiti Katsumi nos 5.000 metros"
            fill
            sizes="(max-width: 820px) calc(100vw - 64px), 420px"
          />
        </figure>
      </section>

      <section className={`${styles.panel} ${styles.leadership}`} aria-labelledby="lideranca-title">
        <div className={styles.leadershipHeading}>
          <div>
            <Eyebrow>Liderança e gestão</Eyebrow>
            <h2 id="lideranca-title">A experiência de quem viveu a pista e aprendeu a construir marcas.</h2>
          </div>
          <div>
            <p>
              Seiti Katsumi conhece o esporte sob duas perspectivas que raramente caminham juntas: a do atleta que
              viveu o alto rendimento no Brasil e no Japão e a do estrategista que construiu uma carreira
              internacional em branding, marketing e publicidade.
            </p>
            <p>
              Essa combinação transforma experiência em gestão. A disciplina da pista, a leitura de longo prazo e o
              entendimento real da jornada do atleta encontram estratégia de marca, tecnologia, comunicação e
              inteligência artificial.
            </p>
          </div>
        </div>

        <div className={styles.leadershipGrid}>
          <article>
            <span>01</span>
            <h3>Legitimidade esportiva</h3>
            <p>Decisões guiadas por quem conhece treinamento, competição, formação, oportunidades e limites da carreira.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Marca com propósito</h3>
            <p>Posicionamento, narrativa e identidade para transformar a 11RUN em uma comunidade reconhecida e confiável.</p>
          </article>
          <article>
            <span>03</span>
            <h3>IA aplicada à gestão</h3>
            <p>Dados, automação e inteligência artificial para qualificar comunicação, acompanhamento e tomada de decisão.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Visão sustentável</h3>
            <p>Uma estrutura preparada para conectar atletas, famílias, treinadores, parceiros e patrocinadores no longo prazo.</p>
          </article>
        </div>

        <div className={styles.leadershipClose}>
          <p>
            À frente da Elevenmind, Seiti leva para a 11RUN o repertório de quem trabalha com estratégia de marcas e
            inteligência artificial sem perder o vínculo humano com a pista. O objetivo não é apenas comunicar um
            projeto, mas construir as condições para que ele cresça com clareza, credibilidade e impacto real.
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/institucional/seiti-katsumi">
              Conheça a trajetória de Seiti
            </Link>
            <a className={styles.secondaryButton} href="https://elevenmind.com.br/" target="_blank" rel="noreferrer">
              Conheça a Elevenmind <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.legacy}`} aria-labelledby="legado-title">
        <figure className={styles.familyImage}>
          <Image
            src="/assets/trajetoria-seiti/familia/luhan-orcampi-com-alex.webp"
            alt="Luhan, Seiti Katsumi e o treinador Alex Lopes em uma pista de atletismo"
            fill
            sizes="(max-width: 820px) calc(100vw - 64px), 540px"
          />
        </figure>
        <div className={styles.sectionCopy}>
          <Eyebrow>Legado</Eyebrow>
          <h2 id="legado-title">Uma missão que atravessa gerações.</h2>
          <p>
            Ao acompanhar a formação de Luhan e, depois, a jornada de Aimê, Seiti voltou a enxergar o esporte de base não apenas como ex-atleta, mas como pai. A realidade das crianças, das famílias e dos treinadores aproximou ainda mais o propósito da vida cotidiana.
          </p>
          <p>
            Aimê representa uma energia diária dentro dessa missão. Seus sonhos mantêm vivo o compromisso de transformar a 11Run em um legado real para muitas outras crianças brasileiras.
          </p>
          <blockquote>
            A 11Run nasce dentro de casa, da pista, das competições, das conversas com famílias e da convivência cotidiana com crianças que amam correr.
          </blockquote>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.problem}`} aria-labelledby="problema-title">
        <div className={styles.problemHeading}>
          <div>
            <Eyebrow>O cenário brasileiro</Eyebrow>
            <h2 id="problema-title">O Brasil não começa tarde por falta de talento. Começa tarde porque falta caminho.</h2>
          </div>
          <p>
            A cultura de movimento, a descoberta e a formação ainda dependem de estruturas fragmentadas. A 11Run existe para conectar esforços, ocupar espaços vazios e construir novas pontes — sem substituir clubes, treinadores, federações ou projetos.
          </p>
        </div>
        <div className={styles.gapGrid}>
          {gaps.map(([title, text, Icon]) => (
            <article key={title} className={styles.gapCard}>
              <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className={styles.problemClose}>
          O Brasil continua produzindo crianças talentosas. Muitas, porém, deixam o esporte antes de compreender até onde poderiam chegar. A 11Run nasceu para ajudar a mudar essa realidade.
        </p>
      </section>

      <section className={`${styles.horizon} ${styles.panel}`} aria-labelledby="horizonte-title">
        <div className={styles.horizonNumber} aria-hidden="true">2036</div>
        <div className={styles.horizonCopy}>
          <Eyebrow>Um horizonte</Eyebrow>
          <h2 id="horizonte-title">Um juramento chamado 2036.</h2>
          <p className={styles.horizonLead}>Seiti e Aimê fizeram um juramento: trabalhar para estar juntos nos Jogos Olímpicos de 2036.</p>
          <p>
            Ela construindo sua trajetória como atleta. Ele ajudando a construir um ecossistema capaz de tornar essa jornada possível para Aimê e para muitas outras crianças.
          </p>
          <p>
            Os Jogos poderão acontecer em Doha, no Catar, ou em outra cidade que venha a ser escolhida. A sede é importante, mas o verdadeiro compromisso não depende do lugar.
          </p>
          <blockquote>2036 não representa uma promessa de medalha. Representa um horizonte.</blockquote>
          <strong>Criar hoje os caminhos que os atletas brasileiros precisarão percorrer amanhã.</strong>
        </div>
        <figure className={styles.horizonImage}>
          <Image
            src="/assets/trajetoria-seiti/familia/aime-orcampi.webp"
            alt="Aimê em um ambiente esportivo ligado à sua formação no atletismo"
            fill
            sizes="(max-width: 820px) calc(100vw - 64px), 360px"
          />
        </figure>
      </section>

      <section className={styles.mvv} aria-labelledby="mvv-title">
        <header>
          <Eyebrow>Direção institucional</Eyebrow>
          <h2 id="mvv-title">Missão, visão e propósito.</h2>
        </header>
        <div className={styles.mvvGrid}>
          <article>
            <Compass size={24} strokeWidth={1.5} aria-hidden="true" />
            <span>Missão</span>
            <h3>Antecipar a base. Sustentar o futuro.</h3>
            <p>Identificar talentos mais cedo, reduzir barreiras, apoiar famílias e criar experiências seguras, progressivas e adequadas à infância.</p>
            <p>Não antecipamos a pressão do alto rendimento. Antecipamos a base necessária para que ele possa, um dia, acontecer.</p>
          </article>
          <article>
            <Target size={24} strokeWidth={1.5} aria-hidden="true" />
            <span>Visão</span>
            <h3>Construir a geração brasileira de 2036.</h3>
            <p>Ser referência na formação de atletas de meio-fundo e fundo e contribuir para que o Brasil volte a competir de forma consistente em nível mundial.</p>
            <p>Qualquer criança, em qualquer região, deve poder ser descoberta e conectada a oportunidades reais.</p>
          </article>
          <article>
            <Sparkles size={24} strokeWidth={1.5} aria-hidden="true" />
            <span>Propósito</span>
            <h3>Que nenhuma criança descubra tarde demais até onde poderia ter chegado.</h3>
            <p>Transformar talento em caminho e fazer com que o futuro dependa menos do acaso e mais de uma estrutura responsável, colaborativa e humana.</p>
          </article>
        </div>
      </section>

      <section className={`${styles.panel} ${styles.values}`} aria-labelledby="valores-title">
        <header>
          <Eyebrow>Nossa cultura</Eyebrow>
          <h2 id="valores-title">Os 11 valores que nos movem.</h2>
        </header>
        <div className={styles.valuesGrid}>
          {values.map(([title, text], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="conhecimento" className={`${styles.panel} ${styles.ecosystem}`} aria-labelledby="ecossistema-title">
        <div className={styles.ecosystemHeading}>
          <div>
            <Eyebrow>Ecossistema 11Run</Eyebrow>
            <h2 id="ecossistema-title">Cada frente responde a uma lacuna da formação brasileira.</h2>
          </div>
          <p>
            Não queremos apenas encontrar talentos. Queremos entender o que faz com que permaneçam, evoluam e cheguem preparados às próximas fases.
          </p>
        </div>
        <div className={styles.frontGrid}>
          {fronts.map(({ title, text, href, icon: Icon }) => (
            <Link key={title} className={styles.frontCard} href={href}>
              <Icon size={24} strokeWidth={1.5} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
              <span>Conhecer esta frente <ArrowRight size={16} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
        <div className={styles.knowledge}>
          <BookOpenCheck size={26} strokeWidth={1.5} aria-hidden="true" />
          <p>
            Cada atividade, acompanhamento e competição gera conhecimento para orientar famílias, aperfeiçoar metodologias e apoiar decisões futuras.
          </p>
        </div>
      </section>

      <section className={styles.manifesto} aria-labelledby="manifesto-title">
        <Eyebrow>Manifesto 11Run</Eyebrow>
        <h2 id="manifesto-title">O futuro do fundismo começa na infância.</h2>
        <p className={styles.manifestoLead}>Não queremos apenas crianças mais rápidas.</p>
        <p>Queremos crianças mais confiantes, famílias mais orientadas, treinadores mais conectados, competições mais adequadas e caminhos mais claros.</p>
        <p>Não queremos campeões precoces. Queremos atletas maduros, preparados e emocionalmente saudáveis surgindo no tempo certo.</p>
        <div className={styles.returnList}>
          <span>A 11Run existe para devolver.</span>
          <strong>Oportunidades.</strong>
          <strong>Conhecimento.</strong>
          <strong>Estrutura.</strong>
          <strong>Esperança.</strong>
        </div>
        <p>E devolver ao fundismo brasileiro a possibilidade de sonhar novamente com o mundo.</p>
        <footer>
          <span>Mais cedo no movimento.</span>
          <span>Mais longe no mundo.</span>
          <strong>2036 começa hoje.</strong>
        </footer>
      </section>

      <section className={styles.finalCta} aria-labelledby="cta-title">
        <ShieldCheck size={28} strokeWidth={1.5} aria-hidden="true" />
        <div>
          <Eyebrow>Construa com a gente</Eyebrow>
          <h2 id="cta-title">Faça parte da construção do futuro.</h2>
          <p>Atletas, famílias, profissionais, empresas e apoiadores podem ajudar a transformar talento em caminho.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href="/onze-futuro">Conheça os projetos</Link>
          <Link className={styles.secondaryButton} href="/apoie/patrocine">Patrocine o projeto</Link>
          <Link className={styles.secondaryButton} href="/apoie/voluntariado">Seja um voluntário</Link>
        </div>
      </section>
    </article>
  );
}
