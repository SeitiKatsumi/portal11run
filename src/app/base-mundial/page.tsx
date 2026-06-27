import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
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
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Onze Futuro | Projeto Base Mundial 11RUN",
  description:
    "O Onze Futuro é a frente de base da 11RUN para jovens atletas de 10 a 13 anos, com projeto piloto de 2026 a 2029, apoio técnico, psicológico, materiais, ajuda de custo e integração ao Circuito 11RUN."
};

const image = "/assets/11run.png";

const heroStats = [
  { icon: CalendarDays, title: "Projeto piloto", text: "2026 a 2029" },
  { icon: Users, title: "Amostragem inicial", text: "4 atletas acompanhados de perto" },
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
    text: "A fase inicial começa com 4 atletas para permitir acompanhamento próximo, coleta de dados, análise individual e refinamento da metodologia."
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
    text: "Observação de maturidade esportiva, disciplina, progressão técnica, adaptação competitiva e fortalecimento do modelo."
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
      <section className="futuro-hero">
        <div className="futuro-hero-copy">
          <Reveal>
            <span className="eyebrow">Projeto Base Mundial 11RUN</span>
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
              <Link className="button primary" href="/cadastro/base-mundial">
                Cadastrar atleta
                <ArrowRight size={18} />
              </Link>
              <Link className="button ghost" href="#entender">
                Entender o projeto
              </Link>
            </div>
          </Reveal>
        </div>
        <Reveal delay={0.08}>
          <div className="futuro-hero-image">
            <img src={image} alt="Corredora em movimento representando o Onze Futuro" />
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
                convivência com o ambiente competitivo.
              </p>
              <p>
                Enquanto em países como Japão, Estados Unidos, Quênia, Uganda, Etiópia e Noruega muitas crianças
                crescem em ambientes onde o movimento faz parte da rotina, no Brasil a formação de base ainda depende
                mais do acaso do que de um caminho estruturado.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <img className="futuro-image-square" src={image} alt="Atleta em movimento em ambiente de performance" />
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
            <img className="futuro-image-square" src={image} alt="Corredora simbolizando vivência esportiva e competição" />
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
                text="A proposta não é limitar o projeto a 4 atletas. A proposta é começar com responsabilidade."
              />
              <div className="futuro-text-block">
                <p>
                  O Onze Futuro começará com uma primeira turma de amostragem formada por 4 atletas, acompanhados
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
            <img className="futuro-image-square" src={image} alt="Corredora simbolizando fase piloto do Onze Futuro" />
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
                  ? "O projeto começa com 4 atletas entre 10 e 13 anos, acompanhados por 3 anos em uma fase de estudo, validação e desenvolvimento."
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
          Começaremos com 4 atletas. Mas a missão é maior: criar cultura, desenvolver disciplina, abrir caminhos,
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
          <Link className="button primary" href="/cadastro/base-mundial">
            Cadastrar atleta
            <ArrowRight size={18} />
          </Link>
          <Link className="button ghost" href="/cadastro/onzerun">
            Falar com a 11RUN
          </Link>
        </div>
      </section>

      <section className="futuro-signature">
        <strong>11RUN - Onze Futuro</strong>
        <span>Mais corredores. Outra cultura. Mais cedo no movimento. Mais futuro no fundismo.</span>
      </section>
    </div>
  );
}
