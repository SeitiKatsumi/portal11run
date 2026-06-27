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
  { label: "usuários", value: "14 mil" },
  { label: "países conectados", value: "14" },
  { label: "atletas Sub-14 nos 5000m", value: "+300" },
  { label: "frentes de desenvolvimento", value: "5" }
];

export const projects: ProjectPage[] = [
  {
    key: "onzerun",
    eyebrow: "IA para alto rendimento",
    title: "ONZERUN",
    subtitle: "Existe uma diferença entre treinar muito e treinar com inteligência.",
    body: [
      "O ONZERUN nasce para atletas, treinadores e projetos que querem ir além da planilha, além do achismo e além da leitura superficial do desempenho.",
      "Um ecossistema com IA para alto rendimento, criado para transformar dados em direção, rotina em evolução e objetivos em decisões mais inteligentes.",
      "No app, cada treino ganha contexto. Cada carga passa a ter leitura. Cada meta se transforma em rota. Cada atleta passa a ser acompanhado com mais profundidade."
    ],
    href: "/onzerun",
    formHref: "/cadastro/onzerun",
    cta: "Quero participar do ONZERUN",
    icon: Bot,
    metrics: ["14 mil usuários", "14 países", "+300 atletas Sub-14 nos 5000m"],
    features: [
      "IA conversacional",
      "Centro de performance",
      "Análise de volume",
      "11TSS",
      "VO2",
      "Objetivos preditivos",
      "Histórico cronológico",
      "Conexões com Strava e Garmin"
    ],
    highlight: {
      title: "Lançamento global: 01/07/2026",
      text: "Uma camada inteligente para organizar o que antes ficava espalhado e entregar uma visão clara do caminho."
    },
    metadata: {
      title: "ONZERUN - IA para alto rendimento",
      description:
        "Aplicativo com inteligência artificial para análise de treinos, performance, histórico, metas e evolução de atletas."
    }
  },
  {
    key: "base-mundial",
    eyebrow: "Formação de base",
    title: "Projeto Base Mundial 11RUN",
    subtitle: "O Brasil tem talento. O que falta, muitas vezes, é estrutura, continuidade e oportunidade no momento certo.",
    body: [
      "O Projeto Base Mundial 11RUN nasce para acompanhar jovens atletas entre 10 e 13 anos, oferecendo suporte, orientação, convivência esportiva, ajuda de custo, materiais e integração ao Circuito 11RUN.",
      "Mais do que correr provas, queremos formar atletas. Mais do que buscar medalhas agora, queremos construir base para o futuro."
    ],
    href: "/base-mundial",
    formHref: "/cadastro/base-mundial",
    cta: "Cadastrar atleta para o Projeto Base Mundial",
    icon: Users,
    metrics: ["4 atletas", "1 missão", "cultura esportiva", "disciplina"],
    features: [
      "Acompanhamento esportivo",
      "Ajuda de custo",
      "Materiais",
      "Integração ao Circuito 11RUN",
      "Convivência com atletas",
      "Orientação para famílias"
    ],
    highlight: {
      title: "Base para chegar longe",
      text: "Suporte, oportunidade e convivência esportiva no período em que a cultura de treino começa a ser formada."
    },
    metadata: {
      title: "Projeto Base Mundial 11RUN",
      description:
        "Projeto de formação para jovens atletas de 10 a 13 anos com suporte, orientação, materiais e integração ao Circuito 11RUN."
    }
  },
  {
    key: "master-regional",
    eyebrow: "Itatiba e região",
    title: "Master Itatiba e Região",
    subtitle: "Performance não tem idade.",
    body: [
      "11RUN é global no alcance. Mas em Itatiba, o compromisso é local.",
      "O projeto Master Itatiba e Região nasce para atletas que continuam levando o esporte a sério, independentemente da idade.",
      "Atletas que treinam, competem, representam, buscam evolução e querem estar cercados por uma estrutura real de alto rendimento."
    ],
    href: "/master-regional",
    formHref: "/cadastro/master-regional",
    cta: "Cadastrar interesse no Projeto Master",
    icon: Trophy,
    features: [
      "Suporte federativo",
      "Suporte técnico",
      "Apoio financeiro",
      "Treinamento em grupo",
      "Rede de desenvolvimento",
      "Planejamento competitivo"
    ],
    highlight: {
      title: "Não é sobre apenas participar.",
      text: "É sobre representar, competir com propósito e levar Itatiba e região para dentro das grandes provas com força, estrutura e ambição."
    },
    notice:
      "Importante: o Master Itatiba e Região é uma iniciativa 100% privada da 11RUN, sem apoio, vínculo institucional ou qualquer relação com a Prefeitura de Itatiba ou com o Departamento de Esportes de Itatiba.",
    metadata: {
      title: "Master Itatiba e Região - 11RUN",
      description:
        "Projeto competitivo privado para atletas master de Itatiba e região com potencial real de destaque."
    }
  },
  {
    key: "circuito-infantil",
    eyebrow: "Circuito infantil",
    title: "Caminho de um Campeão 2027",
    subtitle: "Da primeira volta na pista ao sonho de chegar mais longe.",
    body: [
      "O futuro do meio-fundo e fundo começa na pista.",
      "Vem aí o Caminho de um Campeão 2027, o primeiro circuito de desenvolvimento competitivo em pista para crianças e pré-adolescentes de 10 a 13 anos."
    ],
    href: "/caminho-de-um-campeao",
    formHref: "/cadastro/circuito-infantil",
    cta: "Cadastrar atleta no circuito",
    icon: Route,
    features: [
      "4 etapas na região de Campinas",
      "Provas de 800m, 1000m, 1200m e 1500m",
      "Categorias masculino e feminino",
      "Ranking nacional",
      "Premiação para os 3 primeiros de cada categoria"
    ],
    timeline: [
      { label: "Inscrições", detail: "a partir de 01 de agosto de 2026" },
      { label: "Etapa 1", detail: "fevereiro de 2027" },
      { label: "Etapa 2", detail: "julho de 2027" },
      { label: "Etapa 3", detail: "setembro de 2027" },
      { label: "Etapa 4", detail: "novembro de 2027" }
    ],
    metadata: {
      title: "Caminho de um Campeão 2027",
      description:
        "Circuito infantil de meio-fundo em pista para crianças e pré-adolescentes de 10 a 13 anos."
    }
  },
  {
    key: "bolsas",
    eyebrow: "Oportunidades internacionais",
    title: "Portal de Oportunidades 11RUN",
    subtitle: "Bolsas universitárias para jovens fundistas: o caminho que muitos talentos ainda não sabem que existe.",
    body: [
      "No Brasil, existem atletas jovens com disciplina, potencial e sonhos grandes. Mas entre correr bem e conquistar uma oportunidade internacional, existe uma jornada que quase ninguém explica com clareza.",
      "O Portal de Oportunidades 11RUN nasce para organizar esse caminho.",
      "Uma ponte entre atletas, famílias, treinadores e universidades que oferecem programas de estudo, formação esportiva e desenvolvimento para corredores de fundo."
    ],
    href: "/bolsas-e-oportunidades",
    formHref: "/cadastro/bolsas",
    cta: "Cadastrar interesse em bolsas e oportunidades",
    icon: GraduationCap,
    features: [
      "Marcas oficiais",
      "Histórico escolar",
      "Idioma",
      "Vídeos",
      "Documentação",
      "Elegibilidade",
      "Contato com universidades",
      "Timing competitivo"
    ],
    comparison: [
      {
        title: "EUA",
        text: "Rota mais direta entre desempenho esportivo, contato com técnicos, bolsas esportivas, acadêmicas ou combinadas, calendário universitário, cross country e pista."
      },
      {
        title: "Japão",
        text: "Caminho mais acadêmico, cultural e ligado aos clubes universitários, com forte tradição no Ekiden, adaptação ao idioma e formação coletiva."
      }
    ],
    notice:
      "Índices e critérios são aproximados. Verifique sempre os dados atualizados nos sites oficiais das ligas, universidades, consulados e programas de bolsa.",
    metadata: {
      title: "Portal de Oportunidades 11RUN",
      description:
        "Ponte entre jovens fundistas, famílias, treinadores e oportunidades universitárias no exterior."
    }
  }
];

export const ecosystemCards = [
  {
    title: "ONZERUN",
    text: "IA para alto rendimento. Um aplicativo que transforma dados, treinos e histórico em decisões mais inteligentes.",
    href: "/onzerun",
    cta: "Conhecer o ONZERUN",
    icon: Bot
  },
  {
    title: "Projeto Base Mundial",
    text: "Formação de jovens atletas entre 10 e 13 anos com suporte, orientação, materiais e convivência esportiva.",
    href: "/base-mundial",
    cta: "Conhecer o projeto de base",
    icon: Medal
  },
  {
    title: "Master Itatiba e Região",
    text: "Projeto competitivo para atletas master com potencial real de destaque regional e nacional.",
    href: "/master-regional",
    cta: "Conhecer o projeto master",
    icon: Trophy
  },
  {
    title: "Caminho de um Campeão",
    text: "Circuito infantil de meio-fundo em pista para crianças e pré-adolescentes de 10 a 13 anos.",
    href: "/caminho-de-um-campeao",
    cta: "Conhecer o circuito",
    icon: Flag
  },
  {
    title: "Bolsas e Oportunidades",
    text: "Ponte entre atletas, famílias, treinadores e oportunidades universitárias nos EUA, Japão e outros centros esportivos.",
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
      { name: "athletes_count", label: "Número aproximado de atletas acompanhados" }
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
      { name: "guardian", label: "Responsável" },
      { name: "school", label: "Escola" },
      { name: "sports", label: "Modalidades praticadas" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "competitions", label: "Provas disputadas" },
      { name: "social_link", label: "Link de vídeo ou Instagram" }
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
      { name: "competitive_history", label: "Histórico competitivo" },
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
      { name: "guardian", label: "Responsável" },
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
      { name: "country_interest", label: "País de interesse", type: "select", options: ["EUA", "Japão", "outro"] },
      { name: "language_english", label: "Nível de inglês" },
      { name: "language_japanese", label: "Nível de japonês" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "academic_history", label: "Histórico escolar" },
      { name: "social_link", label: "Vídeo ou Instagram" },
      { name: "international_goal", label: "Objetivo internacional" }
    ]
  }
} as const;

export type FormProjectSlug = keyof typeof formProjects;
