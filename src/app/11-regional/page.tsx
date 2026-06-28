import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Dumbbell,
  Flag,
  HeartPulse,
  Medal,
  ShieldCheck,
  Shirt,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users
} from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { FeatureBanner } from "@/components/FeatureBanner";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "11 Regional | Master Itatiba e Região",
  description:
    "Projeto local da 11RUN para atletas master de Itatiba e região, com comando técnico do Professor Alex Lopes, suporte federativo, financeiro e preparação para Campeonato Paulista e Brasileiro Master."
};

const image = "/assets/11run.png";

const heroMetrics = [
  { value: "11 e 12", label: "de julho de 2026" },
  { value: "8", label: "atletas federados" },
  { value: "16", label: "pares de tênis distribuídos" },
  { value: "Alex Lopes", label: "comando técnico" }
];

const authority = [
  "Técnico ORCAMPI",
  "Experiência em Seleção Brasileira",
  "Referência em fundistas",
  "Direção competitiva"
];

const commandCards = [
  {
    title: "Técnico da ORCAMPI",
    text: "Conexão direta com uma das estruturas mais reconhecidas do atletismo brasileiro.",
    icon: ShieldCheck
  },
  {
    title: "Experiência em Seleção Brasileira",
    text: "Histórico de convocações e atuação em ambientes de alto rendimento nacional e internacional.",
    icon: Award
  },
  {
    title: "Referência em fundistas",
    text: "Vivência na formação e desenvolvimento de atletas brasileiros de meio-fundo e fundo.",
    icon: Medal
  },
  {
    title: "Direção competitiva",
    text: "Planejamento de provas, calendário, estratégia, progressão e preparação para Paulista e Brasileiro Master.",
    icon: Target
  },
  {
    title: "Leitura individual",
    text: "Acompanhamento considerando categoria, idade, histórico, potencial, prova-alvo e margem de evolução.",
    icon: HeartPulse
  }
];

const offerCards = [
  {
    title: "Suporte técnico com Professor Alex Lopes",
    text:
      "Acompanhamento técnico conduzido pelo Professor Alex Lopes, técnico da ORCAMPI, dezenas de vezes Seleção Brasileira e referência na formação de fundistas brasileiros. Direção real para competir melhor.",
    icon: Trophy
  },
  {
    title: "Suporte federativo total",
    text:
      "Apoio em filiação, regularização, documentação, inscrições e organização burocrática no ambiente CBAt, FPA, AAVSP e ABRAM, sem vínculo de patrocínio dessas entidades.",
    icon: ClipboardCheck
  },
  {
    title: "Suporte financeiro",
    text:
      "Apoio para materiais esportivos, inscrições, hospedagem e necessidades competitivas, com concessão baseada em critérios técnicos e competitivos.",
    icon: CircleDollarSign
  },
  {
    title: "Uniformes oficiais",
    text: "Entrega de uniforme para fortalecer identidade, representatividade e presença da equipe nas competições.",
    icon: Shirt
  },
  {
    title: "Tênis e materiais esportivos",
    text:
      "Distribuição inicial de 16 pares de tênis, além de apoio com materiais conforme critérios técnicos e necessidades dos atletas.",
    icon: Sparkles
  },
  {
    title: "Calendário competitivo",
    text: "Organização de calendário com foco em Campeonato Paulista Master e Campeonato Brasileiro Master.",
    icon: CalendarDays
  },
  {
    title: "Treinamento em grupo",
    text: "Ambiente semanal de treino, motivação, cobrança saudável e pertencimento. Treinar junto também é crescer junto.",
    icon: Dumbbell
  },
  {
    title: "Ambiente familiar",
    text: "Treinos com espaço para família, convivência e comunidade esportiva.",
    icon: Users
  }
];

const saturdayPaces = [
  "0-4 km: ritmo de abertura, 4'10/km",
  "4-8 km: ritmo constante, 4'00/km",
  "8-12 km: ritmo forte, 3'50/km",
  "12-16 km: trecho livre, cada um no seu ritmo"
];

const doneItems = [
  "8 atletas federados",
  "16 pares de tênis distribuídos",
  "Uniformes oficiais entregues",
  "Regularização esportiva",
  "Organização documental",
  "Direcionamento competitivo",
  "Preparação para Paulista e Brasileiro"
];

const goals = [
  "Vitórias no Campeonato Paulista Master",
  "Vitórias no Campeonato Brasileiro Master",
  "Recordes paulistas",
  "Recordes brasileiros",
  "Pódios por categoria",
  "Representatividade de Itatiba e região"
];

function CardGrid({
  items,
  columns = "regional-cards"
}: {
  items: { title: string; text: string; icon: typeof Trophy }[];
  columns?: string;
}) {
  return (
    <div className={columns}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <Reveal key={item.title} delay={index * 0.025}>
            <article className="regional-card">
              <Icon size={24} strokeWidth={1.6} />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="regional-checklist">
      {items.map((item) => (
        <li key={item}>
          <CheckCircle2 size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <main className="regional-page">
      <section className="regional-hero" id="topo">
        <div className="regional-hero-copy">
          <span className="eyebrow">Itatiba e região</span>
          <h1>11 Regional</h1>
          <strong>Raiz local. Comando técnico nacional. Ambição competitiva.</strong>
          <p>
            A 11RUN inicia uma nova fase para o atletismo master de Itatiba e região: uma frente local
            de alta performance criada para transformar talento, experiência e vontade competitiva em
            estrutura real.
          </p>
          <p>
            Depois de 20 anos, a 11RUN volta a federar atletas master da região e inicia um ciclo com
            atletas regularizados, tênis distribuídos, uniformes oficiais e suporte completo para competir
            em alto nível.
          </p>

          <div className="regional-authority">
            <span>Comando técnico</span>
            <h2>Professor Alex Lopes</h2>
            <p>
              Técnico da ORCAMPI, dezenas de vezes Seleção Brasileira e referência na formação de
              fundistas no Brasil.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="button primary" href="#projeto">
              Conheça o projeto
              <ArrowRight size={18} />
            </Link>
            <Link className="button ghost" href="#treino">
              Participar dos treinos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="regional-hero-media">
          <img src={image} alt="Corredora em movimento representando alto rendimento master" />
        </div>

        <div className="regional-metrics">
          {heroMetrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>

        <div className="regional-authority-pills">
          {authority.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <FeatureBanner
        eyebrow="11 Regional"
        title="Performance não nasce do improviso. Nasce de direção."
        text="Uma frente master com estrutura, regularização, equipamentos, calendário competitivo e comando técnico de alto rendimento."
        imageSrc={image}
        imageAlt="Corredora em movimento no banner do 11 Regional"
      />

      <section className="regional-section split" id="projeto">
        <div>
          <span className="eyebrow">origem do projeto</span>
          <h2>Global no alcance. Local no compromisso.</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            A 11RUN tem visão global, mas acredita que o alto rendimento também precisa nascer de raízes
            locais. O projeto 11 Regional organiza uma frente competitiva de atletas master com identidade,
            estrutura, acompanhamento e ambição real.
          </p>
          <p>
            A ideia é simples: levar o nome de Itatiba e região para dentro das grandes provas, com atletas
            preparados, federados, equipados e orientados para competir melhor.
          </p>
          <p>
            Mais do que participar, queremos representar. Mais do que correr, queremos construir uma cultura
            local de performance.
          </p>
        </div>
      </section>

      <section className="regional-section split highlight">
        <div>
          <span className="eyebrow">comando técnico</span>
          <h2>Comando técnico de alto rendimento</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            O 11 Regional não nasce apenas da vontade de competir. Nasce com direção técnica, experiência
            e conexão real com o alto rendimento brasileiro.
          </p>
          <p>
            O projeto será conduzido pelo Professor Alex Lopes, técnico da ORCAMPI, dezenas de vezes
            integrante da Seleção Brasileira e uma das referências na formação de atletas fundistas no país.
          </p>
          <p>
            Sua presença fortalece o projeto com metodologia, leitura competitiva, experiência prática,
            organização de calendário, orientação técnica e visão de desenvolvimento para atletas master que
            desejam competir em outro nível.
          </p>
          <strong>Mais do que treinar, a proposta é direcionar.</strong>
        </div>
        <CardGrid items={commandCards} columns="regional-cards technical" />
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">estreia oficial</span>
          <h2>Campeonato Paulista Master 2026</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            Nos dias 11 e 12 de julho de 2026, a 11RUN fará sua estreia oficial no Campeonato Paulista
            Master, marcando o início de um novo ciclo para os atletas master de Itatiba e região.
          </p>
          <p>
            A estreia será realizada com a direção técnica do Professor Alex Lopes, garantindo que os
            atletas cheguem à competição com orientação, estratégia e preparação compatíveis com o nível do
            desafio.
          </p>
          <p>
            Essa estreia não será apenas uma participação. Será o primeiro passo de uma jornada com metas
            claras: competir forte, buscar vitórias, disputar recordes e recolocar atletas da região em
            evidência.
          </p>
          <div className="regional-two-lists">
            <div>
              <h3>O que já foi feito</h3>
              <Checklist items={doneItems} />
            </div>
            <div>
              <h3>Desafios do ano</h3>
              <Checklist items={goals} />
            </div>
          </div>
        </div>
      </section>

      <section className="regional-section">
        <div className="regional-section-head">
          <span className="eyebrow">estrutura 11RUN</span>
          <h2>Estrutura para transformar potencial em resultado</h2>
          <p>
            A 11RUN oferece uma estrutura completa para que atletas master com potencial competitivo tenham
            mais apoio, direção e condições reais de evolução.
          </p>
        </div>
        <CardGrid items={offerCards} />
      </section>

      <section className="regional-section split" id="treino">
        <div>
          <span className="eyebrow">treino de sábado</span>
          <h2>Mais que um treino. Confraternização, apoio e evolução.</h2>
        </div>
        <div className="regional-training">
          <div className="regional-training-card">
            <Timer size={28} />
            <h3>Todo sábado, 7h00</h3>
            <p>Parque da Juventude, Itatiba/SP. Treino de 16 km dividido em 4 voltas de 4 km.</p>
          </div>
          <Checklist items={saturdayPaces} />
          <div className="regional-support">
            {["Água", "Frutas", "Gel", "Espaço para a família"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">critério mínimo</span>
          <h2>Excelência é ponto de partida</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            O 11 Regional é voltado para atletas master com potencial competitivo real. O critério mínimo
            não é apenas vontade de participar: a proposta é identificar atletas com capacidade de evolução,
            histórico, disciplina e potencial para estar entre os melhores do país em sua categoria.
          </p>
          <div className="regional-statement">
            Potencial real para estar entre os 3 melhores do país na categoria.
          </div>
        </div>
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">iniciativa privada</span>
          <h2>Iniciativa 100% privada da 11RUN</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            O 11 Regional é uma iniciativa privada da 11RUN. Este projeto não possui apoio, vínculo
            institucional ou qualquer relação com a Prefeitura de Itatiba ou com o Departamento de Esportes
            de Itatiba.
          </p>
          <p>
            A proposta nasce de uma decisão independente da 11RUN de investir em atletas master, fortalecer
            a cultura esportiva local e criar uma frente competitiva com compromisso real com performance.
          </p>
        </div>
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">atletas master 11RUN</span>
          <h2>Atletas com histórico, disciplina e ambição competitiva.</h2>
        </div>
        <article className="regional-athlete-card">
          <Flag size={24} />
          <h3>Edson Tibúrcio Alves</h3>
          <p>Categoria M45. Atleta master da 11RUN com foco em ser campeão paulista e brasileiro master.</p>
          <Checklist
            items={[
              "5.000 m rasos: 14:52, ouro nos Jogos Regionais 2024",
              "10.000 m rasos: 31:22, prata nos Jogos Regionais de São Bernardo do Campo 2024",
              "Rumo ao Paulista e ao Brasileiro Master"
            ]}
          />
        </article>
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">metas e recordes</span>
          <h2>Vitórias e recordes em várias categorias</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            A meta da 11RUN para o ciclo 2026 é disputar o Campeonato Paulista e o Campeonato Brasileiro
            Master com ambição real de resultado.
          </p>
          <Checklist items={goals} />
        </div>
      </section>

      <CTASection
        title="Quer treinar, competir ou apoiar o 11 Regional?"
        text="Se você é atleta master, tem histórico competitivo, potencial de performance ou deseja fazer parte de um ambiente sério de evolução, entre em contato com a 11RUN."
        actions={[
          { label: "Quero participar", href: "/cadastro/11-regional" },
          { label: "Ver treino de sábado", href: "#treino" }
        ]}
      />
    </main>
  );
}
