import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileHeart,
  Gauge,
  HeartPulse,
  History,
  LineChart,
  Network,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Users,
  Watch,
  Wind,
  XCircle
} from "lucide-react";
import Link from "next/link";

type Card = {
  title: string;
  text: string;
  icon: LucideIcon;
};

const heroIndicators: Card[] = [
  { title: "IA de prova", text: "Ritmo, splits e pontos críticos.", icon: Trophy },
  { title: "IA preditiva", text: "Probabilidade de meta e rota.", icon: Target },
  { title: "11TSS Advance", text: "Carga além do volume.", icon: Gauge },
  { title: "Respiração Neural", text: "Foco, sono e recuperação.", icon: Wind },
  { title: "Exames e imagens", text: "Contexto com cautela.", icon: FileHeart },
  { title: "Wearables", text: "Dados conectados.", icon: Watch },
  { title: "Treinador no centro", text: "IA como copiloto técnico.", icon: Users },
  { title: "Base e kids", text: "Camada segura para jovens.", icon: ShieldCheck }
];

const differentiators: Card[] = [
  {
    title: "IA de prova",
    text: "Detecta largada forte demais, queda de pace, deriva cardíaca, subida custosa, final sem reação ou sobra de energia no sprint.",
    icon: Trophy
  },
  {
    title: "IA preditiva",
    text: "Calcula probabilidade de objetivo e constrói uma rota até a prova com metas, testes, consistência, 11TSS e histórico.",
    icon: Target
  },
  {
    title: "11TSS Advance",
    text: "Classifica agressão, intensidade, variação de ritmo, esforço relativo, splits e impacto real na evolução.",
    icon: Gauge
  },
  {
    title: "IA de recuperação",
    text: "Organiza sinais de sono ruim, dor recorrente, tensão, fadiga neural, baixa recuperação, ansiedade e possível sobrecarga.",
    icon: HeartPulse
  },
  {
    title: "IA multidimensional",
    text: "Cruza treino, prova, dor, histórico, exames, imagens, percepção, objetivos, treinador e dados importados.",
    icon: Brain
  },
  {
    title: "Base e kids",
    text: "Camada segura para jovens atletas, com responsáveis, linguagem educativa, foco em evolução e segurança emocional.",
    icon: ShieldCheck
  },
  {
    title: "Treinador no centro",
    text: "A IA funciona como copiloto técnico: alerta, compara, recomenda e deixa a decisão final com o treinador.",
    icon: Users
  },
  {
    title: "Ecossistema conectado",
    text: "Preparado para Strava, Garmin, wearables, sensores, HRV, sono, frequência cardíaca, potência e novas fontes.",
    icon: Network
  }
];

const raceAnalyzerItems = [
  "largada",
  "ritmo inicial",
  "splits por trecho",
  "queda de pace",
  "deriva cardíaca",
  "subidas e descidas",
  "cadência",
  "potência",
  "economia de corrida",
  "pontos de quebra",
  "retomadas",
  "sprint",
  "sobra de energia",
  "fadiga",
  "padrão tático",
  "recomendações de treino"
];

const neuralItems = [
  "check-in antes do protocolo",
  "execução guiada",
  "check-out após o protocolo",
  "pré-prova",
  "recuperação",
  "sono",
  "foco",
  "ansiedade",
  "hiperalerta corporal",
  "insights de IA",
  "histórico de respostas",
  "integração com treino"
];

const clinicalItems = [
  "relação entre exames e carga",
  "retorno progressivo",
  "risco de sobrecarga",
  "sinais de fadiga",
  "histórico de dor",
  "acompanhamento de lesão",
  "perguntas para profissionais",
  "comparação com histórico",
  "consistência corporal",
  "apoio à decisão do treinador"
];

const dashboardItems = [
  "probabilidade de bater meta",
  "tendência de evolução",
  "consistência semanal",
  "risco de sobrecarga",
  "carga aguda",
  "carga crônica",
  "aderência ao plano",
  "distância até a prova",
  "rota recomendada",
  "pontos fracos prioritários"
];

const tssItems = [
  "volume",
  "intensidade",
  "ritmo",
  "variação de ritmo",
  "agressão muscular",
  "altimetria",
  "frequência cardíaca",
  "potência",
  "cadência",
  "esforço relativo",
  "densidade do treino",
  "histórico recente",
  "recuperação",
  "proximidade de prova",
  "perfil do atleta"
];

const diaryItems = [
  "treinos",
  "provas",
  "dores",
  "sono",
  "humor",
  "recuperação",
  "percepção de esforço",
  "alimentação",
  "hidratação",
  "exames",
  "imagens",
  "testes físicos",
  "metas",
  "observações do treinador",
  "alertas de IA"
];

const coachItems = [
  "visão por atleta",
  "visão por equipe",
  "alertas de risco",
  "comparação de provas",
  "evolução por ciclo",
  "adesão ao plano",
  "resposta individual",
  "recomendações de ajuste",
  "histórico de decisões",
  "comunicação com atleta",
  "relatórios para responsáveis",
  "gestão de projetos de base"
];

const kidsItems = [
  "área de responsáveis",
  "relatórios educativos",
  "linguagem adaptada",
  "foco em evolução",
  "acompanhamento de rotina",
  "alertas de excesso",
  "proteção contra pressão precoce",
  "comunicação com pais",
  "suporte a projetos de base",
  "histórico de desenvolvimento"
];

const integrations = [
  "Strava",
  "Garmin",
  "FIT",
  "GPX",
  "TCX",
  "frequência cardíaca",
  "potência",
  "cadência",
  "HRV",
  "sono",
  "recuperação",
  "sensores futuros"
];

const modules: Card[] = [
  {
    title: "Analisador de Provas",
    text: "Engenheiro de performance com IA para atividades do Strava, Garmin, FIT, GPX, TCX e registros internos.",
    icon: ScanLine
  },
  {
    title: "Respiração Neural",
    text: "Neuromodulação respiratória para ansiedade pré-prova, recuperação, foco, sono e hiperalerta corporal.",
    icon: Wind
  },
  {
    title: "Analisador Clínico e Imagens",
    text: "Leitura esportiva de exames e imagens com cautela médica, contexto de carga e perguntas melhores.",
    icon: FileHeart
  },
  {
    title: "Dashboard Preditivo",
    text: "Probabilidade de metas, evolução, carga, testes, histórico e rota de performance.",
    icon: LineChart
  },
  {
    title: "11TSS Advance",
    text: "Carga inteligente baseada em intensidade, agressão, variação de ritmo, esforço relativo e impacto real.",
    icon: Gauge
  },
  {
    title: "Diário Inteligente",
    text: "Histórico cronológico com eventos de treino, dor, rotina, sono, VO2, nutrição e competição.",
    icon: History
  },
  {
    title: "Central de Treinador e Equipe",
    text: "Visão operacional para decisões técnicas, acompanhamento de atletas e alertas de sobrecarga.",
    icon: Users
  },
  {
    title: "Base e Kids",
    text: "Camada segura para jovens atletas, responsáveis, projetos de base e comunicação educativa.",
    icon: ShieldCheck
  }
];

const audiences: Card[] = [
  {
    title: "Atletas",
    text: "Para evoluir com mais clareza, interpretar treinos e provas, reduzir erros e tomar melhores decisões.",
    icon: Activity
  },
  {
    title: "Treinadores",
    text: "Para acompanhar mais atletas com alertas, histórico, relatórios e visão técnica ampliada.",
    icon: ClipboardList
  },
  {
    title: "Pais e responsáveis",
    text: "Para acompanhar jovens atletas com linguagem educativa, proteção emocional e clareza de evolução.",
    icon: ShieldCheck
  },
  {
    title: "Equipes e projetos",
    text: "Para organizar grupos, avaliações, calendário, dados e evolução coletiva.",
    icon: Network
  },
  {
    title: "Alto rendimento",
    text: "Para cruzar múltiplas fontes de dados e transformar detalhes em vantagem competitiva.",
    icon: Trophy
  },
  {
    title: "Corredores amadores",
    text: "Para entender melhor corpo, treinos, provas, recuperação e caminhos de evolução.",
    icon: HeartPulse
  }
];

const commonApp = [
  "Mostra pace, distância e tempo.",
  "Depende de interpretação manual.",
  "Não cruza exames, dor, sono e histórico.",
  "Não entende contexto de prova.",
  "Não protege jovens atletas com camada específica.",
  "Não coloca o treinador como centro da decisão.",
  "Não gera rota preditiva até a meta.",
  "Não conecta respiração, recuperação e performance."
];

const osApp = [
  "Interpreta performance.",
  "Analisa provas em profundidade.",
  "Cruza treino, corpo, exames, imagens e recuperação.",
  "Detecta pontos críticos da prova.",
  "Tem camada segura para base e kids.",
  "Funciona como copiloto do treinador.",
  "Calcula probabilidade de objetivo.",
  "Integra respiração neural, carga, sono, dor e wearables."
];

const ethics = [
  "IA não substitui treinador.",
  "IA não substitui médico.",
  "IA não substitui psicólogo.",
  "IA não substitui fisioterapeuta.",
  "IA organiza sinais e contexto.",
  "IA gera perguntas melhores.",
  "IA ajuda a reduzir decisões no escuro.",
  "IA respeita a segurança emocional de jovens atletas."
];

function SectionIntro({
  eyebrow,
  title,
  text
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="ai-section-intro">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </div>
  );
}

function IconCard({ card }: { card: Card }) {
  const Icon = card.icon;
  return (
    <article className="ai-card">
      <div className="ai-icon">
        <Icon size={22} strokeWidth={1.8} />
      </div>
      <h3>{card.title}</h3>
      <p>{card.text}</p>
    </article>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <div className="ai-pill-list">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function DataPanel() {
  return (
    <div className="ai-dashboard" aria-label="Exemplo visual de painel preditivo 11RUN">
      <div className="ai-dashboard-top">
        <span>Exemplo visual</span>
        <strong>Race Intelligence</strong>
      </div>
      <div className="ai-score-ring">
        <span>87%</span>
        <small>probabilidade de meta</small>
      </div>
      <div className="ai-chart">
        <i style={{ height: "38%" }} />
        <i style={{ height: "54%" }} />
        <i style={{ height: "48%" }} />
        <i style={{ height: "72%" }} />
        <i style={{ height: "62%" }} />
        <i style={{ height: "84%" }} />
      </div>
      <div className="ai-alert-list">
        <span>Deriva cardíaca detectada no km 4</span>
        <span>Cadência caiu após subida longa</span>
        <span>Rota sugerida: força + ritmo progressivo</span>
      </div>
    </div>
  );
}

export function AppPerformanceLanding() {
  return (
    <div className="ai-page">
      <section className="ai-photo-banner">
        <img src="/assets/11run.png" alt="Corredora em movimento representando performance com inteligência artificial" />
        <div>
          <span>Inteligência aplicada</span>
          <h2>Dados brutos entram. Decisão esportiva sai.</h2>
          <p>
            O 11RUN transforma treino, prova, corpo, recuperação e contexto em leitura prática para atletas,
            treinadores e projetos de base.
          </p>
          <Link className="ai-button primary ai-photo-cta" href="/cadastro/app-11run">
            Abrir cadastro <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <section className="ai-hero">
        <div className="ai-hero-copy">
          <span className="ai-eyebrow">11RUN AI Performance OS</span>
          <h1>11RUN AI Performance OS</h1>
          <strong>A IA mais avançada do mundo para corrida.</strong>
          <p>
            Uma plataforma de inteligência esportiva que une treino, provas, exames, imagem corporal,
            respiração neural, dados de wearables, histórico do atleta, treinadores, pais e equipes em
            um sistema único de decisão.
          </p>
          <p className="ai-positioning">
            Não é um app de treino comum. É um sistema operacional de performance com IA.
          </p>
          <div className="ai-actions">
            <Link className="ai-button primary" href="/cadastro/app-11run">
              Abrir Analisador IA <ArrowRight size={18} />
            </Link>
            <Link className="ai-button ghost" href="/admin">
              Ver Painel
            </Link>
            <Link className="ai-button ghost" href="#modulos">
              Conhecer módulos
            </Link>
          </div>
        </div>
        <div className="ai-hero-visual">
          <DataPanel />
        </div>
        <div className="ai-indicators">
          {heroIndicators.map((card) => (
            <IconCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="ai-section split">
        <SectionIntro
          eyebrow="o que é"
          title="Uma nova camada de inteligência para corrida e endurance"
          text="O 11RUN AI Performance OS interpreta a jornada completa do atleta e transforma informação solta em inteligência esportiva aplicável."
        />
        <div className="ai-copy-panel">
          <p>
            Ele conecta o que o atleta treinou, como competiu, como recuperou, onde perdeu desempenho,
            quais sinais apareceram no corpo e quais decisões o treinador precisa tomar.
          </p>
          <p>
            O sistema cruza treinos, provas, frequência cardíaca, ritmo, potência, cadência, altimetria,
            percepção de esforço, sono, dor, exames, imagens, histórico, metas e contexto individual.
          </p>
          <strong>Não é só registrar dados. É entender o que eles significam.</strong>
        </div>
      </section>

      <section className="ai-section" id="diferenciais">
        <SectionIntro
          eyebrow="diferenciais"
          title="Não é só planilha. É inteligência aplicada ao atleta inteiro."
          text="A maioria dos aplicativos mostra dados. O 11RUN interpreta decisões."
        />
        <div className="ai-grid four">
          {differentiators.map((card) => (
            <IconCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="ai-section split dark-card">
        <SectionIntro
          eyebrow="analisador de provas"
          title="Analisador de Provas 11RUN"
          text="Da largada à chegada, a IA interpreta cada decisão da prova. Importe atividades do Strava, Garmin ou arquivos FIT, GPX e TCX para entender tudo o que aconteceu."
        />
        <div>
          <div className="ai-race-panel">
            <span>Prova 5000 m · exemplo</span>
            <strong>Quebra crítica no km 3.8</strong>
            <div className="ai-race-line" />
            <p>Ritmo inicial agressivo, deriva cardíaca progressiva e sprint final com baixa resposta.</p>
          </div>
          <PillList items={raceAnalyzerItems} />
          <div className="ai-actions compact">
            <Link className="ai-button primary" href="/cadastro/app-11run">
              Abrir Analisador de Provas <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="ai-section two-panels">
        <article>
          <SectionIntro
            eyebrow="respiração neural"
            title="Respiração Neural 11RUN"
            text="Neuromodulação respiratória aplicada à performance: protocolos guiados para ansiedade pré-prova, foco, recuperação, sono e regulação."
          />
          <PillList items={neuralItems} />
          <p className="ai-safety-note">
            A Respiração Neural 11RUN não substitui acompanhamento médico, psicológico ou fisioterapêutico.
            O módulo atua como apoio educacional e esportivo.
          </p>
        </article>
        <article>
          <SectionIntro
            eyebrow="exames e imagens"
            title="Exames e imagens deixam de ser dados soltos"
            text="IA clínica-esportiva com cautela, contexto e foco em decisão. O corpo fala. O 11RUN organiza os sinais."
          />
          <PillList items={clinicalItems} />
          <p className="ai-safety-note">
            A IA não faz diagnóstico médico e não substitui profissionais de saúde. Ela organiza dados,
            identifica pontos de atenção e ajuda a criar perguntas melhores.
          </p>
        </article>
      </section>

      <section className="ai-section split">
        <SectionIntro
          eyebrow="dashboard preditivo"
          title="Dashboard Preditivo"
          text="Probabilidade de meta, rota de evolução e risco de queda. A meta deixa de ser desejo. Vira probabilidade, rota e decisão."
        />
        <div>
          <DataPanel />
          <PillList items={dashboardItems} />
        </div>
      </section>

      <section className="ai-section split dark-card">
        <SectionIntro
          eyebrow="11TSS Advance"
          title="Nem todo treino de 10 km pesa igual."
          text="Carga inteligente além do volume: intensidade, agressão, variação de ritmo, impacto acumulado e risco."
        />
        <PillList items={tssItems} />
      </section>

      <section className="ai-section two-panels">
        <article>
          <SectionIntro
            eyebrow="diário inteligente"
            title="Diário Inteligente do Atleta"
            text="Tudo que importa na jornada, em ordem cronológica. O atleta não evolui em dias isolados. Evolui em história."
          />
          <PillList items={diaryItems} />
        </article>
        <article>
          <SectionIntro
            eyebrow="treinador e equipe"
            title="Treinador no centro. IA como copiloto técnico."
            text="O 11RUN não substitui o treinador. A IA interpreta. O treinador aprova, ajusta e transforma análise em ação real."
          />
          <PillList items={coachItems} />
        </article>
      </section>

      <section className="ai-section split">
        <SectionIntro
          eyebrow="base e kids"
          title="Camada segura para jovens atletas"
          text="Performance com proteção, educação, responsáveis e comunicação sem pressão excessiva."
        />
        <div>
          <PillList items={kidsItems} />
          <p className="ai-highlight-line">Para jovens atletas, inteligência também é cuidado.</p>
        </div>
      </section>

      <section className="ai-photo-banner">
        <img src="/assets/11run.png" alt="Atleta 11RUN em movimento em ambiente de performance" />
        <div>
          <span>Ecossistema conectado</span>
          <h2>Strava, Garmin, wearables e novas fontes de dados.</h2>
          <p>O dado entra bruto. A IA devolve decisão.</p>
          <PillList items={integrations} />
        </div>
      </section>

      <section className="ai-section" id="modulos">
        <SectionIntro
          eyebrow="módulos de IA"
          title="Módulos que posicionam o 11RUN como referência mundial"
        />
        <div className="ai-grid four">
          {modules.map((card) => (
            <IconCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="ai-section">
        <SectionIntro
          eyebrow="para quem é"
          title="Uma plataforma para atletas, treinadores, pais e equipes"
        />
        <div className="ai-grid three">
          {audiences.map((card) => (
            <IconCard key={card.title} card={card} />
          ))}
        </div>
      </section>

      <section className="ai-section split dark-card">
        <SectionIntro
          eyebrow="posicionamento comercial"
          title="Uma plataforma premium para vender performance inteligente"
          text="Enquanto aplicativos comuns mostram dados, o 11RUN interpreta contexto."
        />
        <div className="ai-copy-panel transparent">
          <p>
            O 11RUN pode ser apresentado como o primeiro sistema de corrida com IA realmente
            multidisciplinar: performance, saúde, prova, respiração, recuperação, treinador,
            pais, base, equipe e predição em um único produto.
          </p>
          <strong>A nova fronteira da corrida não é ter mais dados. É saber o que fazer com eles.</strong>
        </div>
      </section>

      <section className="ai-section">
        <SectionIntro eyebrow="comparativo" title="App comum x 11RUN AI Performance OS" />
        <div className="ai-compare">
          <article>
            <h3>App comum</h3>
            <ul>
              {commonApp.map((item) => (
                <li key={item}>
                  <XCircle size={18} /> {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="featured">
            <h3>11RUN AI Performance OS</h3>
            <ul>
              {osApp.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={18} /> {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="ai-section split">
        <SectionIntro
          eyebrow="segurança e ética"
          title="IA com responsabilidade esportiva"
          text="A IA atua como camada de organização, contexto, educação, alerta e apoio à decisão."
        />
        <div>
          <PillList items={ethics} />
          <p className="ai-safety-note">
            Decisões clínicas devem ser sempre confirmadas por profissionais qualificados.
            A plataforma apoia a leitura do contexto, sem prometer diagnósticos ou resultados absolutos.
          </p>
        </div>
      </section>

      <section className="ai-final-cta">
        <span>nova era da performance</span>
        <h2>Entre na nova era da performance com IA</h2>
        <p>
          Uma plataforma para quem não quer apenas correr mais. Quer entender melhor, decidir melhor
          e evoluir com inteligência.
        </p>
        <div className="ai-actions">
          <Link className="ai-button primary" href="/cadastro/app-11run">
            Abrir Analisador IA <ArrowRight size={18} />
          </Link>
          <Link className="ai-button ghost" href="/admin">
            Ver Painel
          </Link>
          <Link className="ai-button ghost" href="/cadastro/app-11run">
            Falar com a 11RUN
          </Link>
        </div>
      </section>
    </div>
  );
}
