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
import { ProjectFormModal } from "@/components/ProjectFormModal";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "11 Master | Master Itatiba e RegiÃ£o",
  description:
    "Projeto local da 11RUN para atletas master de Itatiba e regiÃ£o, com comando tÃ©cnico do Professor Alex Lopes, suporte federativo, financeiro e preparaÃ§Ã£o para Campeonato Paulista e Brasileiro Master."
};

const image = "/assets/11run-reference.jpg";

const heroMetrics = [
  { value: "11 e 12", label: "de julho de 2026" },
  { value: "8", label: "atletas federados" },
  { value: "16", label: "pares de tÃªnis distribuÃ­dos" },
  { value: "Alex Lopes", label: "comando tÃ©cnico" }
];

const authority = [
  "TÃ©cnico ORCAMPI",
  "ExperiÃªncia em SeleÃ§Ã£o Brasileira",
  "ReferÃªncia em fundistas",
  "DireÃ§Ã£o competitiva"
];

const commandCards = [
  {
    title: "TÃ©cnico da ORCAMPI",
    text: "ConexÃ£o direta com uma das estruturas mais reconhecidas do atletismo brasileiro.",
    icon: ShieldCheck
  },
  {
    title: "ExperiÃªncia em SeleÃ§Ã£o Brasileira",
    text: "HistÃ³rico de convocaÃ§Ãµes e atuaÃ§Ã£o em ambientes de alto rendimento nacional e internacional.",
    icon: Award
  },
  {
    title: "ReferÃªncia em fundistas",
    text: "Vivncia na formaÃ§Ã£o e desenvolvimento de atletas brasileiros de meio-fundo e fundo.",
    icon: Medal
  },
  {
    title: "DireÃ§Ã£o competitiva",
    text: "Planejamento de provas, calendÃ¡rio, estratÃ©gia, progressÃ£o e preparaÃ§Ã£o para Paulista e Brasileiro Master.",
    icon: Target
  },
  {
    title: "Leitura individual",
    text: "Acompanhamento considerando categoria, idade, histÃ³rico, potencial, prova-alvo e margem de evoluÃ§Ã£o.",
    icon: HeartPulse
  }
];

const offerCards = [
  {
    title: "Suporte tÃ©cnico com Professor Alex Lopes",
    text:
      "Acompanhamento tÃ©cnico conduzido pelo Professor Alex Lopes, tÃ©cnico da ORCAMPI, dezenas de vezes SeleÃ§Ã£o Brasileira e referÃªncia na formaÃ§Ã£o de fundistas brasileiros. DireÃ§Ã£o real para competir melhor.",
    icon: Trophy
  },
  {
    title: "Suporte federativo total",
    text:
      "Apoio em filiaÃ§Ã£o, regularizaÃ§Ã£o, documentaÃ§Ã£o, inscriÃ§Ãµes e organizaÃ§Ã£o burocrÃ¡tica no ambiente CBAt, FPA, AAVSP e ABRAM, sem vÃ­nculo de patrocÃ­nio dessas entidades.",
    icon: ClipboardCheck
  },
  {
    title: "Suporte financeiro",
    text:
      "Apoio para materiais esportivos, inscriÃ§Ãµes, hospedagem e necessidades competitivas, com concessÃ£o baseada em critÃ©rios tÃ©cnicos e competitivos.",
    icon: CircleDollarSign
  },
  {
    title: "Uniformes oficiais",
    text: "Entrega de uniforme para fortalecer identidade, representatividade e presenÃ§a da equipe nas competiÃ§Ãµes.",
    icon: Shirt
  },
  {
    title: "TÃªnis e materiais esportivos",
    text:
      "DistribuiÃ§Ã£o inicial de 16 pares de tÃªnis, alÃ©m de apoio com materiais conforme critÃ©rios tÃ©cnicos e necessidades dos atletas.",
    icon: Sparkles
  },
  {
    title: "CalendÃ¡rio competitivo",
    text: "OrganizaÃ§Ã£o de calendÃ¡rio com foco em Campeonato Paulista Master e Campeonato Brasileiro Master.",
    icon: CalendarDays
  },
  {
    title: "Treinamento em grupo",
    text: "Ambiente semanal de treino, motivaÃ§Ã£o, cobranÃ§a saudÃ¡vel e pertencimento. Treinar junto tambÃ©m Ã© crescer junto.",
    icon: Dumbbell
  },
  {
    title: "Ambiente familiar",
    text: "Treinos com espaÃ§o para famÃ­lia, convivÃªncia e comunidade esportiva.",
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
  "16 pares de tÃªnis distribuÃ­dos",
  "Uniformes oficiais entregues",
  "RegularizaÃ§Ã£o esportiva",
  "OrganizaÃ§Ã£o documental",
  "Direcionamento competitivo",
  "PreparaÃ§Ã£o para Paulista e Brasileiro"
];

const goals = [
  "VitÃ³rias no Campeonato Paulista Master",
  "VitÃ³rias no Campeonato Brasileiro Master",
  "Recordes paulistas",
  "Recordes brasileiros",
  "PÃ³dios por categoria",
  "Representatividade de Itatiba e regiÃ£o"
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
      <FeatureBanner
        eyebrow="11 Master"
        title="Performance nÃ£o nasce do improviso. Nasce de direÃ§Ã£o."
        text="Uma frente master com estrutura, regularizaÃ§Ã£o, equipamentos, calendÃ¡rio competitivo e comando tÃ©cnico de alto rendimento."
        imageSrc={image}
        imageAlt="Corredora em movimento no banner do 11 Master"
        ctaSlot={<ProjectFormModal project="11-regional" label="Inscrever atleta master" />}
      />

      <section className="regional-hero" id="topo">
        <div className="regional-hero-copy">
          <span className="eyebrow">Itatiba e regiÃ£o</span>
          <h1>11 Master</h1>
          <strong>Raiz local. Comando tÃ©cnico nacional. AmbiÃ§Ã£o competitiva.</strong>
          <p>
            A 11RUN inicia uma nova fase para o atletismo master de Itatiba e regiÃ£o: uma frente local
            de alta performance criada para transformar talento, experiÃªncia e vontade competitiva em
            estrutura real.
          </p>
          <p>
            Depois de 20 anos, a 11RUN volta a federar atletas master da regiÃ£o e inicia um ciclo com
            atletas regularizados, tÃªnis distribuÃ­dos, uniformes oficiais e suporte completo para competir
            em alto nÃ­vel.
          </p>

          <div className="regional-authority">
            <span>Comando tÃ©cnico</span>
            <h2>Professor Alex Lopes</h2>
            <p>
              TÃ©cnico da ORCAMPI, dezenas de vezes SeleÃ§Ã£o Brasileira e referÃªncia na formaÃ§Ã£o de
              fundistas no Brasil.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="button primary" href="#projeto">
              ConheÃ§a o projeto
              <ArrowRight size={18} />
            </Link>
            <ProjectFormModal project="11-regional" label="Participar dos treinos" className="button ghost" />
            <ProjectFormModal project="11-regional" label="Inscrever atleta master" className="button ghost" />
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

      <section className="regional-section split" id="projeto">
        <div>
          <span className="eyebrow">origem do projeto</span>
          <h2>Global no alcance. Local no compromisso.</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            A 11RUN tem visÃ£o global, mas acredita que o alto rendimento tambÃ©m precisa nascer de raÃ­zes
            locais. O projeto 11 Master organiza uma frente competitiva de atletas master com identidade,
            estrutura, acompanhamento e ambiÃ§Ã£o real.
          </p>
          <p>
            A ideia Ã© simples: levar o nome de Itatiba e regiÃ£o para dentro das grandes provas, com atletas
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
          <span className="eyebrow">comando tÃ©cnico</span>
          <h2>Comando tÃ©cnico de alto rendimento</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            O 11 Master nÃ£o nasce apenas da vontade de competir. Nasce com direÃ§Ã£o tÃ©cnica, experiÃªncia
            e conexÃ£o real com o alto rendimento brasileiro.
          </p>
          <p>
            O projeto serÃ¡ conduzido pelo Professor Alex Lopes, tÃ©cnico da ORCAMPI, dezenas de vezes
            integrante da SeleÃ§Ã£o Brasileira e uma das referÃªncias na formaÃ§Ã£o de atletas fundistas no paÃ­s.
          </p>
          <p>
            Sua presenÃ§a fortalece o projeto com metodologia, leitura competitiva, experiÃªncia prÃ¡tica,
            organizaÃ§Ã£o de calendÃ¡rio, orientaÃ§Ã£o tÃ©cnica e visÃ£o de desenvolvimento para atletas master que
            desejam competir em outro nÃ­vel.
          </p>
          <strong>Mais do que treinar, a proposta Ã© direcionar.</strong>
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
            Nos dias 11 e 12 de julho de 2026, a 11RUN farÃ¡ sua estreia oficial no Campeonato Paulista
            Master, marcando o inÃ­cio de um novo ciclo para os atletas master de Itatiba e regiÃ£o.
          </p>
          <p>
            A estreia serÃ¡ realizada com a direÃ§Ã£o tÃ©cnica do Professor Alex Lopes, garantindo que os
            atletas cheguem Ã  competiÃ§Ã£o com orientaÃ§Ã£o, estratÃ©gia e preparaÃ§Ã£o compatÃ­veis com o nÃ­vel do
            desafio.
          </p>
          <p>
            Essa estreia nÃ£o serÃ¡ apenas uma participaÃ§Ã£o. SerÃ¡ o primeiro passo de uma jornada com metas
            claras: competir forte, buscar vitÃ³rias, disputar recordes e recolocar atletas da regiÃ£o em
            evidÃªncia.
          </p>
          <div className="regional-two-lists">
            <div>
              <h3>O que j foi feito</h3>
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
            mais apoio, direÃ§Ã£o e condiÃ§Ãµes reais de evoluÃ§Ã£o.
          </p>
        </div>
        <CardGrid items={offerCards} />
      </section>

      <section className="regional-section split" id="treino">
        <div>
          <span className="eyebrow">treino de sÃ¡bado</span>
          <h2>Mais que um treino. ConfraternizaÃ§Ã£o, apoio e evoluÃ§Ã£o.</h2>
        </div>
        <div className="regional-training">
          <div className="regional-training-card">
            <Timer size={28} />
            <h3>Todo sÃ¡bado, 7h00</h3>
            <p>Parque da Juventude, Itatiba/SP. Treino de 16 km dividido em 4 voltas de 4 km.</p>
          </div>
          <Checklist items={saturdayPaces} />
          <div className="regional-support">
            {["Ãgua", "Frutas", "Gel", "EspaÃ§o para a famÃ­lia"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">critÃ©rio mÃ­nimo</span>
          <h2>ExcelÃªncia Ã© ponto de partida</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            O 11 Master Ã© voltado para atletas master com potencial competitivo real. O critÃ©rio mÃ­nimo
            nÃ£o Ã© apenas vontade de participar: a proposta Ã© identificar atletas com capacidade de evoluÃ§Ã£o,
            histÃ³rico, disciplina e potencial para estar entre os melhores do paÃ­s em sua categoria.
          </p>
          <div className="regional-statement">
            Potencial real para estar entre os 3 melhores do paÃ­s na categoria.
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
            O 11 Master Ã© uma iniciativa privada da 11RUN. Este projeto nÃ£o possui apoio, vÃ­nculo
            institucional ou qualquer relaÃ§Ã£o com a Prefeitura de Itatiba ou com o Departamento de Esportes
            de Itatiba.
          </p>
          <p>
            A proposta nasce de uma decisÃ£o independente da 11RUN de investir em atletas master, fortalecer
            a cultura esportiva local e criar uma frente competitiva com compromisso real com performance.
          </p>
        </div>
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">atletas master 11RUN</span>
          <h2>Atletas com histÃ³rico, disciplina e ambiÃ§Ã£o competitiva.</h2>
        </div>
        <article className="regional-athlete-card">
          <Flag size={24} />
          <h3>Edson TibÃºrcio Alves</h3>
          <p>Categoria M45. Atleta master da 11RUN com foco em ser campeÃ£o paulista e brasileiro master.</p>
          <Checklist
            items={[
              "5.000 m rasos: 14:52, ouro nos Jogos Regionais 2024",
              "10.000 m rasos: 31:22, prata nos Jogos Regionais de SÃ£o Bernardo do Campo 2024",
              "Rumo ao Paulista e ao Brasileiro Master"
            ]}
          />
        </article>
      </section>

      <section className="regional-section split">
        <div>
          <span className="eyebrow">metas e recordes</span>
          <h2>VitÃ³rias e recordes em vÃ¡rias categorias</h2>
        </div>
        <div className="regional-copy-block">
          <p>
            A meta da 11RUN para o ciclo 2026 Ã© disputar o Campeonato Paulista e o Campeonato Brasileiro
            Master com ambiÃ§Ã£o real de resultado.
          </p>
          <Checklist items={goals} />
        </div>
      </section>

      <CTASection
        title="Quer treinar, competir ou apoiar o 11 Master"
        text="Se vocÃª Ã© atleta master, tem histÃ³rico competitivo, potencial de performance ou deseja fazer parte de um ambiente sÃ©rio de evoluÃ§Ã£o, entre em contato com a 11RUN."
        actions={[
          { label: "Inscrever atleta master", modalProject: "11-regional" },
          { label: "Ver treino de sÃ¡bado", href: "#treino" }
        ]}
      />
    </main>
  );
}

