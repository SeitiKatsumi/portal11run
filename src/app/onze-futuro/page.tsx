import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Dumbbell,
  Flag,
  Footprints,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  LineChart,
  Medal,
  Network,
  Route,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FeatureBanner } from "@/components/FeatureBanner";
import { FutureJourneySection } from "@/components/FutureJourney/FutureJourneySection";
import { OnzeFuturoFaq } from "@/components/OnzeFuturoFaq";
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { Reveal } from "@/components/Reveal";
import { onzeFuturoFaqItems } from "@/lib/onze-futuro-faq";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onze Futuro | 11RUN",
  description:
    "O Onze Futuro é a frente de base da 11RUN para jovens atletas de 10 a 13 anos, com projeto piloto de 2026 a 2029, apoio técnico, psicológico, materiais, ajuda de custo e integração ao Circuito 11RUN."
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: onzeFuturoFaqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer.join(" ")
    }
  }))
};

const heroImage = "/assets/onze-futuro-hero.jpg";
const launchImage = "/assets/home/grupo-11run-pista.webp";
const scenarioImage = "/assets/onze-futuro-cenario.jpg";
const originImage = "/assets/athletes/turma-onze-futuro-seis.webp";
const pilotImage = "/assets/athletes/piloto-aime.webp";

const heroStats = [
  { icon: CalendarDays, title: "Projeto piloto", text: "2026 a 2029" },
  { icon: Users, title: "Amostragem inicial", text: "6 atletas acompanhados de perto" },
  { icon: HeartPulse, title: "Ciclo de base", text: "3 anos de desenvolvimento" },
  { icon: Network, title: "Corpo multidisciplinar", text: "técnico, docente e emocional" },
  { icon: BarChart3, title: "Expansão responsável", text: "crescimento guiado por análise" },
  { icon: ShieldCheck, title: "Infância protegida", text: "base antes da cobrança" }
];

const problemCards = [
  { icon: Footprints, title: "Descoberta tardia do fundismo" },
  { icon: CalendarDays, title: "Falta de calendário de base" },
  { icon: Route, title: "Pouco acesso a estrutura esportiva" },
  { icon: Brain, title: "Falta de apoio técnico e psicológico" },
  { icon: LineChart, title: "Descontinuidade na formação" },
  { icon: HeartHandshake, title: "Desigualdade de oportunidades" },
  { icon: Activity, title: "Pouca cultura de movimento" },
  { icon: Target, title: "Falta de perspectiva para jovens atletas" }
];

const objectiveCards = [
  { icon: Activity, title: "Desenvolver cultura de movimento desde cedo" },
  { icon: Dumbbell, title: "Criar repertório motor e esportivo" },
  { icon: Flag, title: "Inserir atletas no ambiente competitivo com segurança" },
  { icon: HeartHandshake, title: "Apoiar famílias que já vivem a cultura esportiva" },
  { icon: CircleDollarSign, title: "Reduzir barreiras de acesso e permanência" },
  { icon: Brain, title: "Oferecer acompanhamento técnico e emocional" },
  { icon: Trophy, title: "Preparar para fases futuras do atletismo" },
  { icon: BarChart3, title: "Validar um modelo de desenvolvimento de base" },
  { icon: ClipboardCheck, title: "Criar dados, análises e aprendizados para expansão" }
];

const differentials = [
  {
    icon: CalendarDays,
    title: "Projeto piloto com visão de longo prazo",
    text: "A primeira fase acontecerá de 2026 a 2029, permitindo acompanhamento real, estudo de evolução e validação do modelo."
  },
  {
    icon: Users,
    title: "Amostragem inicial com profundidade",
    text: "A fase inicial começa com 6 atletas para permitir acompanhamento próximo, coleta de dados, análise individual e refinamento da metodologia."
  },
  {
    icon: Network,
    title: "Corpo técnico, docente e multidisciplinar",
    text: "Profissionais capacitados atuarão para apoiar o desenvolvimento esportivo, emocional, familiar e educacional."
  },
  {
    icon: HeartHandshake,
    title: "Famílias com cultura alinhada",
    text: "Os pais compartilham uma visão comum: esporte como formação, e não como pressão precoce."
  },
  {
    icon: Flag,
    title: "Integração ao Circuito 11RUN",
    text: "O circuito será usado como ambiente preparatório, educativo e competitivo, adequado às fases de desenvolvimento."
  },
  {
    icon: BarChart3,
    title: "Expansão baseada em análise",
    text: "O crescimento acontecerá conforme dados, resultados, viabilidade, estrutura e capacidade de preservar qualidade."
  }
];

const offers = [
  {
    icon: Medal,
    title: "Ambiente esportivo e inclusão competitiva",
    text: "Inserção gradual em convivência com atletas, treinadores, competições e referências esportivas sem antecipar cobranças inadequadas."
  },
  {
    icon: Dumbbell,
    title: "Apoio técnico",
    text: "Orientação esportiva, acompanhamento de evolução, organização de rotina e desenvolvimento progressivo das capacidades físicas e técnicas."
  },
  {
    icon: Brain,
    title: "Apoio psicológico",
    text: "Construção de confiança, disciplina, autonomia, controle emocional, resiliência e mentalidade competitiva saudável."
  },
  {
    icon: GraduationCap,
    title: "Corpo docente e multidisciplinar",
    text: "Acompanhamento em desenvolvimento motor, educação, rotina, adaptação e suporte às famílias."
  },
  {
    icon: CircleDollarSign,
    title: "Ajuda de custo",
    text: "Suporte financeiro mensal para reduzir barreiras de acesso, permanência e desenvolvimento dentro do esporte."
  },
  {
    icon: Sparkles,
    title: "Materiais esportivos",
    text: "Fornecimento de materiais de treino, equipamentos básicos e recursos necessários para melhores condições de evolução."
  },
  {
    icon: Flag,
    title: "Circuitos preparatórios",
    text: "Participação no Circuito 11RUN e em experiências competitivas progressivas, respeitando idade, maturação e repertório físico."
  },
  {
    icon: HeartHandshake,
    title: "Orientação para famílias",
    text: "Apoio aos responsáveis na compreensão das etapas de desenvolvimento, rotina esportiva e importância da continuidade."
  },
  {
    icon: Trophy,
    title: "Referências mundiais adaptadas",
    text: "Inserção gradual inspirada em grandes culturas esportivas, com adaptação à infância e à realidade brasileira."
  }
];

const timeline = [
  {
    year: "2026",
    title: "Início da fase piloto",
    text: "Seleção da primeira turma, estruturação do acompanhamento, integração ao ambiente 11RUN e início da metodologia."
  },
  {
    year: "2027",
    title: "Desenvolvimento e adaptação",
    text: "Acompanhamento da evolução, análise de rotina, participação em circuitos preparatórios e ajustes individuais."
  },
  {
    year: "2028",
    title: "Consolidação da base",
    text: "Observação de maturidade esportiva, disciplina, progresso técnico, adaptação competitiva e fortalecimento do modelo."
  },
  {
    year: "2029",
    title: "Análise e expansão",
    text: "Avaliação dos resultados, aprendizados, viabilidade, impacto e possibilidades de ampliação do projeto."
  }
];

const practice = [
  "Primeira turma de amostragem",
  "Acompanhamento contínuo",
  "Vivência competitiva",
  "Desenvolvimento por fases",
  "Análise e aprendizado",
  "Expansão responsável"
];

const benefits = [
  {
    title: "Para os jovens atletas",
    items: ["Mais repertório motor", "Mais confiança", "Mais disciplina", "Mais convivência esportiva", "Melhor adaptação competitiva", "Mais perspectiva de futuro"]
  },
  {
    title: "Para as famílias",
    items: ["Mais orientação", "Mais segurança no processo", "Mais clareza sobre etapas de desenvolvimento", "Apoio na rotina esportiva", "Cultura familiar e esportiva positiva"]
  },
  {
    title: "Para o atletismo brasileiro",
    items: ["Formação mais cedo", "Mais continuidade", "Mais cultura de base", "Atletas preparados para fases futuras", "Um modelo estudado, melhorado e ampliado"]
  }
];

const athleteProfiles = [
  {
    slug: "aime",
    name: "Aimê Giaretta Katsumi",
    birthDate: "21/03/2017",
    mark: "3'36\"",
    image: "/assets/onze-futuro/time-2027/aime.webp",
    alt: "Perfil visual de Aimê Giaretta Katsumi",
  },
  {
    slug: "nathan",
    name: "Nathan Augusto Almeida Gerin",
    birthDate: "14/01/2016",
    mark: "3'14\"",
    image: "/assets/onze-futuro/time-2027/nathan.webp",
    alt: "Perfil visual de Nathan Augusto Almeida Gerin",
  },
  {
    slug: "manu",
    name: "Emanuelly Helena Alves Marcelino",
    birthDate: "23/02/2016",
    mark: "3'40\"",
    image: "/assets/onze-futuro/time-2027/manu.webp",
    alt: "Perfil visual de Emanuelly Helena Alves Marcelino",
  },
  {
    slug: "alice",
    name: "Alice",
    birthDate: "23/02/2016",
    mark: "3'49\"",
    image: "/assets/onze-futuro/time-2027/alice.webp",
    alt: "Perfil visual de Alice",
  },
  {
    slug: "maria-eloisa",
    name: "Maria Eloisa",
    birthDate: "15/10/2016",
    mark: "3'54\"",
    image: "/assets/onze-futuro/time-2027/maria-eloisa.webp",
    alt: "Perfil visual de Maria Eloisa",
  },
  {
    slug: "soso",
    name: "Sophia Gabrielly de Aragão Maciel",
    birthDate: "28/07/2016",
    mark: "3'58\"",
    image: "/assets/onze-futuro/time-2027/soso.webp",
    alt: "Perfil visual de Sophia Gabrielly de Aragão Maciel",
  },
  {
    slug: "thales",
    name: "Thales Miguel Silva Ramos",
    birthDate: "03/02/2015",
    mark: "3'22\"",
    image: "/assets/onze-futuro/time-2027/thales.webp",
    alt: "Perfil visual de Thales Miguel Silva Ramos",
  },
  {
    slug: "luma",
    name: "Luma",
    birthDate: "01/06/2015",
    mark: "3'38\"",
    image: "/assets/onze-futuro/time-2027/luma.webp",
    alt: "Perfil visual de Luma",
  },
  {
    slug: "helena",
    name: "Helena",
    birthDate: "2013",
    mark: "3'28\"",
    image: "/assets/onze-futuro/time-2027/helena.webp",
    alt: "Perfil visual de Helena",
  },
  {
    slug: "ananda",
    name: "Ananda",
    birthDate: "21/12/2017",
    mark: "4'25\"",
    image: "/assets/onze-futuro/time-2027/ananda.webp",
    alt: "Perfil visual de Ananda",
  },
  {
    slug: "bia",
    name: "Bia",
    birthDate: "08/01/2014",
    mark: "3'53\"",
    image: "/assets/onze-futuro/time-2027/bia.webp",
    alt: "Perfil visual de Bia",
  },
  {
    slug: "theo",
    name: "Theo",
    birthDate: "2014",
    mark: "3'22\"",
    image: "/assets/onze-futuro/time-2027/theo.webp",
    alt: "Perfil visual de Theo",
  },
  {
    slug: "pedro-benazi",
    name: "Pedro Benazi Rosa",
    birthDate: "2013",
    mark: "2'49\"",
    image: "/assets/onze-futuro/time-2027/pedro-benazi.webp",
    alt: "Perfil visual de Pedro Benazi Rosa",
  },
  {
    slug: "renan",
    name: "Renan",
    birthDate: "12/07/2016",
    mark: "3'35\"",
    image: "/assets/onze-futuro/time-2027/renan.webp",
    alt: "Perfil visual de Renan",
  },
  {
    slug: "gabi",
    name: "Gabi Luz",
    birthDate: "05/03/2017",
    mark: "3'49\"",
    image: "/assets/onze-futuro/time-2027/gabi.webp",
    alt: "Perfil visual de Gabi Luz",
  },
];

function IconCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text?: string }) {
  return (
    <article className="futuro-card">
      <span className="futuro-icon">
        <Icon size={22} strokeWidth={1.6} />
      </span>
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
    </article>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="futuro-section-header">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

export default function Page() {
  return (
    <div className="futuro-landing">
      <FeatureBanner
        imageSrc={launchImage}
        imageAlt="Atletas, familiares e equipe 11RUN reunidos na pista de atletismo"
        mediaOnly
      />

      <section className="futuro-hero">
        <div className="futuro-hero-copy">
          <Reveal>
            <span className="eyebrow">Onze Futuro 11RUN</span>
            <h1>Onze Futuro</h1>
            <strong>Mais cedo no movimento. Mais futuro no fundismo.</strong>
            <p>
              O Brasil tem talento. O que falta, muitas vezes, é estrutura, continuidade, cultura esportiva e
              oportunidade no momento certo.
            </p>
            <p>
              O Onze Futuro nasce como uma frente de desenvolvimento de base da 11RUN para acompanhar jovens atletas
              entre 10 e 13 anos, ajudando a construir repertório, disciplina, ambiente competitivo, suporte técnico,
              apoio emocional e uma base mais sólida para o futuro do atletismo de fundo.
            </p>
            <div className="hero-actions">
              <ProjectFormModal project="onze-futuro" label="Cadastrar atleta" className="button white" />
              <Link className="button ghost" href="#entender">
                Entender o projeto
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.08}>
          <div className="futuro-hero-image">
            <img src={heroImage} alt="Jovem atleta correndo na pista representando o Onze Futuro" />
          </div>
        </Reveal>
        <div className="futuro-kpis">
          {heroStats.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.03}>
              <IconCard {...item} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="futuro-section futuro-athletes">
        <SectionHeader
          eyebrow="Time 2027"
          title="Quinze atletas. Quinze histórias. Uma próxima geração."
          text="Conheça os atletas que representarão o Onze Futuro na temporada 2027 e as marcas de 1.000 metros que acompanham o início deste novo ciclo."
        />
        <div className="futuro-team-cover">
          <img
            src="/assets/onze-futuro/time-2027/capa.webp"
            alt="Field 2027, a próxima geração do Onze Futuro"
            loading="lazy"
          />
          <div>
            <span>Field 2027</span>
            <h3>Próxima geração</h3>
            <p>Selecione um atleta para ir direto ao perfil completo. Os cartões mantêm nascimento e melhor marca sempre visíveis.</p>
          </div>
        </div>
        <nav className="futuro-athlete-roster" aria-label="Atletas do time 2027">
          {athleteProfiles.map((athlete) => (
            <a key={athlete.slug} href={`#perfil-${athlete.slug}`}>
              <small>{athlete.birthDate}</small>
              <strong>{athlete.name}</strong>
              <span>1.000 m · {athlete.mark}</span>
            </a>
          ))}
        </nav>
        <div className="futuro-profile-strip" aria-label="Perfis completos dos atletas do time 2027">
          {athleteProfiles.map((athlete) => (
            <article className="futuro-athlete-profile" id={`perfil-${athlete.slug}`} key={athlete.slug}>
              <img src={athlete.image} alt={athlete.alt} loading="lazy" />
              <footer>
                <span>{athlete.birthDate}</span>
                <strong>{athlete.name}</strong>
                <b>Melhor marca 1.000 m · {athlete.mark}</b>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="futuro-section futuro-scenario" id="entender">
        <SectionHeader
          eyebrow="cenário atual"
          title="O Brasil não começa tarde por falta de talento. Começa tarde porque falta caminho."
          text="O problema não nasce no cronômetro. Nasce antes: no acesso, no calendário, na rotina escolar, na ausência de pistas, no apoio às famílias e na falta de perspectiva."
        />
        <div className="futuro-two-col">
          <Reveal>
            <div className="futuro-text-block">
              <p>
                O atletismo de fundo brasileiro revela talentos todos os anos, mas muitos jovens chegam tarde ao
                processo de formação. Em vários casos, a criança só descobre a corrida de fundo quando já perdeu uma
                fase preciosa de desenvolvimento motor, coordenação, ritmo, resistência lúdica, disciplina esportiva e
                convivência no ambiente competitivo.
              </p>
              <p>
                Enquanto em países como Japão, Estados Unidos, Quênia, Uganda, Etiópia e Noruega muitas crianças
                crescem em ambientes onde o movimento faz parte da rotina, no Brasil a formação de base ainda depende
                mais do acaso do que de um caminho estruturado.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <img className="futuro-image-square" src={scenarioImage} alt="Jovem atleta em movimento durante treino de pista" />
          </Reveal>
        </div>
        <div className="futuro-card-grid four">
          {problemCards.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.02}>
              <IconCard {...item} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="futuro-section futuro-origin">
        <div className="futuro-two-col reverse">
          <Reveal>
            <img className="futuro-image-square futuro-image-portrait" src={originImage} alt="Os seis jovens atletas do Onze Futuro" />
          </Reveal>
          <Reveal delay={0.08}>
            <div>
              <SectionHeader
                eyebrow="origem"
                title="Um projeto que nasce da vivência real com crianças, famílias e competição."
              />
              <div className="futuro-text-block">
                <p>
                  O Onze Futuro nasce da observação prática da 11RUN dentro do ambiente das corridas, da convivência com
                  jovens atletas, do contato com famílias envolvidas no esporte e da percepção de que existe um espaço
                  importante entre a infância ativa e a formação competitiva.
                </p>
                <p>
                  A iniciativa nasce também de uma cultura compartilhada entre famílias que entendem o esporte como
                  formação, disciplina, convivência, educação, saúde, resiliência e construção de futuro.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
        <div className="futuro-pill-list">
          {["experiência competitiva", "gap brasileiro na base", "cultura familiar alinhada", "formação de longo prazo", "caminho estruturado"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="futuro-section futuro-age">
        <SectionHeader
          eyebrow="10 a 13 anos"
          title="Dos 10 aos 13 anos, a base ainda está sendo escrita."
          text="Antes da performance, existe base. Antes do treino forte, existe movimento. Antes do atleta maduro, existe uma infância ativa."
        />
        <div className="futuro-manifest-card">
          <p>Começar cedo não é forçar cedo.</p>
          <div>
            {["brincar mais", "variar estímulos", "criar coordenação", "aprender ritmo", "desenvolver resistência de forma lúdica", "construir prazer pelo movimento"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <strong>O Onze Futuro não antecipa pressão. Ele antecipa base.</strong>
        </div>
      </section>

      <FutureJourneySection />

      <section className="futuro-section">
        <SectionHeader
          eyebrow="objetivo central"
          title="Antecipar a base. Sustentar o futuro."
          text="Mais do que colocar crianças para correr provas, queremos formar pessoas e atletas. Mais do que buscar medalhas agora, queremos construir uma base que possa sustentar o futuro."
        />
        <div className="futuro-card-grid three">
          {objectiveCards.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.02}>
              <IconCard {...item} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="futuro-section">
        <SectionHeader
          eyebrow="diferenciais"
          title="Não é apenas apoio. É ecossistema."
          text="O projeto entende que o desenvolvimento esportivo depende de criança, família, orientação técnica, apoio psicológico, ambiente competitivo, rotina, materiais, calendário, convivência e continuidade."
        />
        <div className="futuro-card-grid three">
          {differentials.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.03}>
              <IconCard {...item} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="futuro-section futuro-offers">
        <SectionHeader
          eyebrow="entregas"
          title="O que o Onze Futuro oferece"
          text="Um ecossistema de formação para jovens atletas, unindo suporte, orientação, materiais, convivência esportiva, ambiente competitivo e acompanhamento contínuo."
        />
        <div className="futuro-card-grid three">
          {offers.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.02}>
              <IconCard {...item} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="futuro-section futuro-pilot">
        <div className="futuro-two-col">
          <Reveal>
            <div>
              <SectionHeader
                eyebrow="piloto 2026-2029"
                title="Um projeto piloto para estudar, validar e crescer."
                text="A proposta não é limitar o projeto a 6 atletas. A proposta é começar com responsabilidade."
              />
              <div className="futuro-text-block">
                <p>
                  O Onze Futuro começará com uma primeira turma de amostragem formada por 6 atletas, acompanhados
                  durante o ciclo inicial de 2026 a 2029.
                </p>
                <p>
                  Essa fase permitirá estudar e aprimorar a metodologia, observando evolução esportiva, adaptação
                  competitiva, permanência, maturidade emocional, rotina, desenvolvimento motor, apoio familiar, impacto
                  dos materiais, ajuda de custo e viabilidade de expansão.
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <img className="futuro-image-square futuro-image-portrait" src={pilotImage} alt="Aimê com o uniforme do Onze Futuro" />
          </Reveal>
        </div>
        <div className="futuro-timeline">
          {timeline.map((item) => (
            <article key={item.year}>
              <span>{item.year}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="futuro-section">
        <SectionHeader eyebrow="prática" title="Como funciona na prática" />
        <div className="futuro-steps">
          {practice.map((item, index) => (
            <article key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item}</h3>
              <p>
                {index === 0
                  ? "O projeto começa com 6 atletas entre 10 e 13 anos, acompanhados por 3 anos em uma fase de estudo, validação e desenvolvimento."
                  : index === 1
                    ? "Os atletas terão suporte técnico, psicológico, esportivo, educacional e institucional dentro do ecossistema 11RUN."
                    : index === 2
                      ? "A participação no Circuito 11RUN servirá como ambiente preparatório, educativo e progressivo."
                      : index === 3
                        ? "A evolução será conduzida com respeito à idade, maturação, adaptação, segurança e individualidade."
                        : index === 4
                          ? "O projeto acompanhará dados, evolução, comportamento, permanência, rotina e impacto do suporte oferecido."
                          : "A ampliação acontecerá de acordo com resultados, viabilidade, capacidade técnica e preservação da qualidade."}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="futuro-section">
        <SectionHeader
          eyebrow="benefícios"
          title="Benefícios para atletas, famílias e para o futuro do fundismo"
        />
        <div className="futuro-benefits">
          {benefits.map((group) => (
            <article key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="futuro-section futuro-manifesto">
        <span className="eyebrow">manifesto</span>
        <h2>O fundo começa na infância.</h2>
        <p>
          Se queremos atletas maduros aos 19 ou 20 anos, precisamos formar antes. Se queremos alto rendimento,
          precisamos de base. Se queremos futuro, precisamos de ecossistema.
        </p>
        <p>
          Começaremos com 6 atletas. Mas a missão é maior: criar cultura, desenvolver disciplina, abrir caminhos,
          estudar a base, validar um modelo e construir um futuro possível para mais jovens corredores.
        </p>
      </section>

      <section className="futuro-section futuro-final-cta">
        <div>
          <span className="eyebrow">participação</span>
          <h2>Faça parte do Onze Futuro</h2>
          <p>
            Se você conhece uma criança entre 10 e 13 anos com interesse, potencial, disciplina ou paixão pela corrida,
            cadastre para avaliação da equipe 11RUN.
          </p>
        </div>
        <div className="cta-actions">
          <ProjectFormModal project="onze-futuro" label="Cadastrar atleta" className="button white" />
          <Link className="button ghost" href="https://app.11run.com.br/">
            Falar com a 11RUN
          </Link>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c") }}
      />
      <OnzeFuturoFaq />

      <section className="futuro-signature">
        <strong>11RUN - Onze Futuro</strong>
        <span>Mais corredores. Outra cultura. Mais cedo no movimento. Mais futuro no fundismo.</span>
      </section>
    </div>
  );
}
