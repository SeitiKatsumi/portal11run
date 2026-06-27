import {
  Activity,
  Award,
  BarChart3,
  Bot,
  CalendarDays,
  CircleDollarSign,
  Dumbbell,
  Flag,
  Globe2,
  GraduationCap,
  HeartPulse,
  Map,
  Medal,
  Network,
  Route,
  Timer,
  Trophy,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ProjectKey =
  | "onzerun"
  | "base-mundial"
  | "master-regional"
  | "circuito-infantil"
  | "bolsas";

export type ProjectPage = {
  key: ProjectKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string[];
  href: string;
  formHref: string;
  cta: string;
  icon: LucideIcon;
  metrics?: string[];
  features: string[];
  highlight?: {
    title: string;
    text: string;
  };
  timeline?: { label: string; detail: string }[];
  comparison?: { title: string; text: string }[];
  notice?: string;
  metadata: {
    title: string;
    description: string;
  };
};

export const navItems = [
  { label: "ONZERUN", href: "/onzerun" },
  { label: "Base Mundial", href: "/base-mundial" },
  { label: "Master Regional", href: "/master-regional" },
  { label: "Circuito Infantil", href: "/caminho-de-um-campeao" },
  { label: "Bolsas", href: "/bolsas-e-oportunidades" }
];

export const metrics = [
  { label: "usuarios", value: "14 mil" },
  { label: "paises conectados", value: "14" },
  { label: "atletas Sub-14 nos 5000m", value: "+300" },
  { label: "frentes de desenvolvimento", value: "5" }
];

export const projects: ProjectPage[] = [
  {
    key: "onzerun",
    eyebrow: "IA para alto rendimento",
    title: "ONZERUN",
    subtitle: "Existe uma diferenca entre treinar muito e treinar com inteligencia.",
    body: [
      "O ONZERUN nasce para atletas, treinadores e projetos que querem ir alem da planilha, alem do achismo e alem da leitura superficial do desempenho.",
      "Um ecossistema com IA para alto rendimento, criado para transformar dados em direcao, rotina em evolucao e objetivos em decisoes mais inteligentes.",
      "No app, cada treino ganha contexto. Cada carga passa a ter leitura. Cada meta se transforma em rota. Cada atleta passa a ser acompanhado com mais profundidade."
    ],
    href: "/onzerun",
    formHref: "/cadastro/onzerun",
    cta: "Quero participar do ONZERUN",
    icon: Bot,
    metrics: ["14 mil usuarios", "14 paises", "+300 atletas Sub-14 nos 5000m"],
    features: [
      "IA conversacional",
      "Centro de performance",
      "Analise de volume",
      "11TSS",
      "VO2",
      "Objetivos preditivos",
      "Historico cronologico",
      "Conexoes com Strava e Garmin"
    ],
    highlight: {
      title: "Lancamento global: 01/07/2026",
      text: "Uma camada inteligente para organizar o que antes ficava espalhado e entregar uma visao clara do caminho."
    },
    metadata: {
      title: "ONZERUN - IA para alto rendimento",
      description:
        "Aplicativo com inteligencia artificial para analise de treinos, performance, historico, metas e evolucao de atletas."
    }
  },
  {
    key: "base-mundial",
    eyebrow: "Formacao de base",
    title: "Projeto Base Mundial 11RUN",
    subtitle: "O Brasil tem talento. O que falta, muitas vezes, e estrutura, continuidade e oportunidade no momento certo.",
    body: [
      "O Projeto Base Mundial 11RUN nasce para acompanhar jovens atletas entre 10 e 13 anos, oferecendo suporte, orientacao, convivencia esportiva, ajuda de custo, materiais e integracao ao Circuito 11RUN.",
      "Mais do que correr provas, queremos formar atletas. Mais do que buscar medalhas agora, queremos construir base para o futuro."
    ],
    href: "/base-mundial",
    formHref: "/cadastro/base-mundial",
    cta: "Cadastrar atleta para o Projeto Base Mundial",
    icon: Users,
    metrics: ["4 atletas", "1 missao", "cultura esportiva", "disciplina"],
    features: [
      "Acompanhamento esportivo",
      "Ajuda de custo",
      "Materiais",
      "Integracao ao Circuito 11RUN",
      "Convivencia com atletas",
      "Orientacao para familias"
    ],
    highlight: {
      title: "Base para chegar longe",
      text: "Suporte, oportunidade e convivencia esportiva no periodo em que a cultura de treino comeca a ser formada."
    },
    metadata: {
      title: "Projeto Base Mundial 11RUN",
      description:
        "Projeto de formacao para jovens atletas de 10 a 13 anos com suporte, orientacao, materiais e integracao ao Circuito 11RUN."
    }
  },
  {
    key: "master-regional",
    eyebrow: "Itatiba e regiao",
    title: "Master Itatiba e Regiao",
    subtitle: "Performance nao tem idade.",
    body: [
      "11RUN e global no alcance. Mas em Itatiba, o compromisso e local.",
      "O projeto Master Itatiba e Regiao nasce para atletas que continuam levando o esporte a serio, independentemente da idade.",
      "Atletas que treinam, competem, representam, buscam evolucao e querem estar cercados por uma estrutura real de alto rendimento."
    ],
    href: "/master-regional",
    formHref: "/cadastro/master-regional",
    cta: "Cadastrar interesse no Projeto Master",
    icon: Trophy,
    features: [
      "Suporte federativo",
      "Suporte tecnico",
      "Apoio financeiro",
      "Treinamento em grupo",
      "Rede de desenvolvimento",
      "Planejamento competitivo"
    ],
    highlight: {
      title: "Nao e sobre apenas participar.",
      text: "E sobre representar, competir com proposito e levar Itatiba e regiao para dentro das grandes provas com forca, estrutura e ambicao."
    },
    notice:
      "Importante: o Master Itatiba e Regiao e uma iniciativa 100% privada da 11RUN, sem apoio, vinculo institucional ou qualquer relacao com a Prefeitura de Itatiba ou com o Departamento de Esportes de Itatiba.",
    metadata: {
      title: "Master Itatiba e Regiao - 11RUN",
      description:
        "Projeto competitivo privado para atletas master de Itatiba e regiao com potencial real de destaque."
    }
  },
  {
    key: "circuito-infantil",
    eyebrow: "Circuito infantil",
    title: "Caminho de um Campeao 2027",
    subtitle: "Da primeira volta na pista ao sonho de chegar mais longe.",
    body: [
      "O futuro do meio-fundo e fundo comeca na pista.",
      "Vem ai o Caminho de um Campeao 2027, o primeiro circuito de desenvolvimento competitivo em pista para criancas e pre-adolescentes de 10 a 13 anos."
    ],
    href: "/caminho-de-um-campeao",
    formHref: "/cadastro/circuito-infantil",
    cta: "Cadastrar atleta no circuito",
    icon: Route,
    features: [
      "4 etapas na regiao de Campinas",
      "Provas de 800m, 1000m, 1200m e 1500m",
      "Categorias masculino e feminino",
      "Ranking nacional",
      "Premiacao para os 3 primeiros de cada categoria"
    ],
    timeline: [
      { label: "Inscricoes", detail: "a partir de 01 de agosto de 2026" },
      { label: "Etapa 1", detail: "fevereiro de 2027" },
      { label: "Etapa 2", detail: "julho de 2027" },
      { label: "Etapa 3", detail: "setembro de 2027" },
      { label: "Etapa 4", detail: "novembro de 2027" }
    ],
    metadata: {
      title: "Caminho de um Campeao 2027",
      description:
        "Circuito infantil de meio-fundo em pista para criancas e pre-adolescentes de 10 a 13 anos."
    }
  },
  {
    key: "bolsas",
    eyebrow: "Oportunidades internacionais",
    title: "Portal de Oportunidades 11RUN",
    subtitle: "Bolsas universitarias para jovens fundistas: o caminho que muitos talentos ainda nao sabem que existe.",
    body: [
      "No Brasil, existem atletas jovens com disciplina, potencial e sonhos grandes. Mas entre correr bem e conquistar uma oportunidade internacional, existe uma jornada que quase ninguem explica com clareza.",
      "O Portal de Oportunidades 11RUN nasce para organizar esse caminho.",
      "Uma ponte entre atletas, familias, treinadores e universidades que oferecem programas de estudo, formacao esportiva e desenvolvimento para corredores de fundo."
    ],
    href: "/bolsas-e-oportunidades",
    formHref: "/cadastro/bolsas",
    cta: "Cadastrar interesse em bolsas e oportunidades",
    icon: GraduationCap,
    features: [
      "Marcas oficiais",
      "Historico escolar",
      "Idioma",
      "Videos",
      "Documentacao",
      "Elegibilidade",
      "Contato com universidades",
      "Timing competitivo"
    ],
    comparison: [
      {
        title: "EUA",
        text: "Rota mais direta entre desempenho esportivo, contato com tecnicos, bolsas esportivas, academicas ou combinadas, calendario universitario, cross country e pista."
      },
      {
        title: "Japao",
        text: "Caminho mais academico, cultural e ligado aos clubes universitarios, com forte tradicao no Ekiden, adaptacao ao idioma e formacao coletiva."
      }
    ],
    notice:
      "Indices e criterios sao aproximados. Verifique sempre os dados atualizados nos sites oficiais das ligas, universidades, consulados e programas de bolsa.",
    metadata: {
      title: "Portal de Oportunidades 11RUN",
      description:
        "Ponte entre jovens fundistas, familias, treinadores e oportunidades universitarias no exterior."
    }
  }
];

export const ecosystemCards = [
  {
    title: "ONZERUN",
    text: "IA para alto rendimento. Um aplicativo que transforma dados, treinos e historico em decisoes mais inteligentes.",
    href: "/onzerun",
    cta: "Conhecer o ONZERUN",
    icon: Bot
  },
  {
    title: "Projeto Base Mundial",
    text: "Formacao de jovens atletas entre 10 e 13 anos com suporte, orientacao, materiais e convivencia esportiva.",
    href: "/base-mundial",
    cta: "Conhecer o projeto de base",
    icon: Medal
  },
  {
    title: "Master Itatiba e Regiao",
    text: "Projeto competitivo para atletas master com potencial real de destaque regional e nacional.",
    href: "/master-regional",
    cta: "Conhecer o projeto master",
    icon: Trophy
  },
  {
    title: "Caminho de um Campeao",
    text: "Circuito infantil de meio-fundo em pista para criancas e pre-adolescentes de 10 a 13 anos.",
    href: "/caminho-de-um-campeao",
    cta: "Conhecer o circuito",
    icon: Flag
  },
  {
    title: "Bolsas e Oportunidades",
    text: "Ponte entre atletas, familias, treinadores e oportunidades universitarias nos EUA, Japao e outros centros esportivos.",
    href: "/bolsas-e-oportunidades",
    cta: "Ver oportunidades",
    icon: Globe2
  }
];

export const sportIcons = [Activity, BarChart3, Dumbbell, HeartPulse, CalendarDays, Award, Network, Map, CircleDollarSign, Timer];

export const projectByRoute: Record<string, ProjectPage> = {
  onzerun: projects[0],
  "base-mundial": projects[1],
  "master-regional": projects[2],
  "caminho-de-um-campeao": projects[3],
  "bolsas-e-oportunidades": projects[4]
};

export const formProjects = {
  onzerun: {
    label: "ONZERUN",
    projectType: "onzerun",
    title: "Cadastro ONZERUN",
    fields: [
      { name: "usage_profile", label: "Perfil de uso", type: "select", options: ["atleta", "treinador", "projeto", "assessoria", "clube"] },
      { name: "platforms", label: "Plataformas usadas", placeholder: "Strava, Garmin, planilha, outro" },
      { name: "main_goal", label: "Objetivo principal" },
      { name: "athletes_count", label: "Numero aproximado de atletas acompanhados" }
    ]
  },
  "base-mundial": {
    label: "Projeto Base Mundial",
    projectType: "base-mundial",
    title: "Cadastro Projeto Base Mundial",
    fields: [
      { name: "athlete_name", label: "Nome do atleta" },
      { name: "birth_date", label: "Data de nascimento", type: "date" },
      { name: "age", label: "Idade", type: "number" },
      { name: "guardian", label: "Responsavel" },
      { name: "school", label: "Escola" },
      { name: "sports", label: "Modalidades praticadas" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "competitions", label: "Provas disputadas" },
      { name: "social_link", label: "Link de video ou Instagram" }
    ]
  },
  "master-regional": {
    label: "Master Regional",
    projectType: "master-regional",
    title: "Cadastro Projeto Master",
    fields: [
      { name: "athlete_name", label: "Nome do atleta" },
      { name: "age", label: "Idade", type: "number" },
      { name: "category", label: "Categoria" },
      { name: "main_events", label: "Provas principais" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "competitive_history", label: "Historico competitivo" },
      { name: "federation_id", label: "Registro federativo, se houver" },
      { name: "competitive_goal", label: "Objetivo competitivo" }
    ]
  },
  "circuito-infantil": {
    label: "Circuito Infantil",
    projectType: "circuito-infantil",
    title: "Cadastro Circuito Infantil",
    fields: [
      { name: "athlete_name", label: "Nome do atleta" },
      { name: "birth_date", label: "Data de nascimento", type: "date" },
      { name: "age", label: "Idade", type: "number" },
      { name: "guardian", label: "Responsavel" },
      { name: "category", label: "Categoria" },
      { name: "events_interest", label: "Provas de interesse", placeholder: "800m, 1000m, 1200m, 1500m" },
      { name: "team", label: "Equipe ou escola" }
    ]
  },
  bolsas: {
    label: "Bolsas e Oportunidades",
    projectType: "bolsas",
    title: "Cadastro Bolsas e Oportunidades",
    fields: [
      { name: "athlete_name", label: "Nome do atleta" },
      { name: "age", label: "Idade", type: "number" },
      { name: "school_year", label: "Ano escolar atual" },
      { name: "country_interest", label: "Pais de interesse", type: "select", options: ["EUA", "Japao", "outro"] },
      { name: "language_english", label: "Nivel de ingles" },
      { name: "language_japanese", label: "Nivel de japones" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "academic_history", label: "Historico escolar" },
      { name: "social_link", label: "Video ou Instagram" },
      { name: "international_goal", label: "Objetivo internacional" }
    ]
  }
} as const;

export type FormProjectSlug = keyof typeof formProjects;
