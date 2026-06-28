import {
  Activity,
  Award,
  BarChart3,
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

export type ProjectKey = "app-11run" | "onze-futuro" | "11-regional" | "circuito-futuro-11" | "bolsas";

export type ProjectPage = {
  key: ProjectKey;
  eyebrow: string;
  title: string;
  subtitle: string;
  imageSrc: string;
  imageAlt: string;
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
  banner?: {
    eyebrow: string;
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
  { label: "Início", href: "/" },
  { label: "App 11Run", href: "/app-11run" },
  { label: "11 Futuro", href: "/onze-futuro" },
  { label: "11 Regional", href: "/11-regional" },
  { label: "Circuito Futuro 11", href: "/circuito-futuro-11" },
  { label: "Bolsas", href: "/bolsas" }
];

export const metrics = [
  { label: "usuários", value: "14 mil" },
  { label: "países conectados", value: "14" },
  { label: "atletas Sub-14 nos 5000m", value: "+300" },
  { label: "frentes de desenvolvimento", value: "5" }
];

export const projects: ProjectPage[] = [
  {
    key: "app-11run",
    eyebrow: "performance orientada por dados",
    title: "App 11Run",
    subtitle: "Uma plataforma para organizar treino, leitura de desempenho e evolução esportiva com mais clareza.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora em movimento representando performance e tecnologia",
    body: [
      "O App 11Run nasce para atletas, treinadores e projetos que querem ir além da planilha e transformar rotina esportiva em acompanhamento consistente.",
      "A plataforma reúne histórico, metas, cargas, indicadores e conexões para que cada decisão tenha contexto e continuidade.",
      "Cada atleta passa a ser acompanhado com mais profundidade, do treino diário ao planejamento de longo prazo."
    ],
    href: "/app-11run",
    formHref: "https://app.11run.com.br/",
    cta: "Acessar App 11Run",
    icon: BarChart3,
    metrics: ["14 mil usuários", "14 países", "+300 atletas Sub-14 nos 5000m"],
    features: [
      "Acompanhamento esportivo",
      "Centro de performance",
      "Análise de volume",
      "Indicadores de carga",
      "Objetivos esportivos",
      "Histórico cronológico",
      "Conexões com Strava e Garmin",
      "Relatórios para treinadores"
    ],
    highlight: {
      title: "Lançamento global: 01/07/2026",
      text: "Uma camada de organização para transformar dados, rotina e calendário em uma visão clara de evolução."
    },
    banner: {
      eyebrow: "App 11Run",
      title: "Dados que transformam rotina em evolução.",
      text: "Um app para organizar treino, leitura de desempenho e decisões com contexto real."
    },
    metadata: {
      title: "App 11Run - Performance para corredores",
      description: "Plataforma para análise de treinos, performance, histórico, metas e evolução de atletas."
    }
  },
  {
    key: "onze-futuro",
    eyebrow: "Onze Futuro",
    title: "Onze Futuro",
    subtitle: "O Brasil tem talento. O que falta, muitas vezes, é estrutura, continuidade e oportunidade no momento certo.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora em movimento 11RUN",
    body: [
      "O Onze Futuro acompanha jovens atletas entre 10 e 13 anos, oferecendo suporte, orientação, convivência esportiva, ajuda de custo, materiais, inscrições gratuitas no Circuito 11RUN e assessoria de publicidade ao longo do processo.",
      "Mais do que correr provas, queremos formar atletas. Mais do que buscar medalhas agora, queremos construir base para o futuro."
    ],
    href: "/onze-futuro",
    formHref: "/cadastro/onze-futuro",
    cta: "Cadastrar atleta",
    icon: Users,
    metrics: ["4 atletas", "1 missão", "cultura esportiva", "disciplina"],
    features: [
      "Acompanhamento esportivo",
      "Ajuda de custo",
      "Materiais",
      "Inscrições gratuitas no Circuito 11RUN",
      "Assessoria de publicidade",
      "Convivência com atletas",
      "Orientação para famílias"
    ],
    highlight: {
      title: "Onze Futuro para chegar longe",
      text: "Suporte, oportunidade e convivência esportiva no período em que a cultura de treino começa a ser formada."
    },
    banner: {
      eyebrow: "Onze Futuro",
      title: "Mais cedo no movimento. Mais futuro no fundismo.",
      text: "Uma frente de base para criar repertório, continuidade e cultura esportiva desde a infância."
    },
    metadata: {
      title: "Onze Futuro - 11RUN",
      description:
        "Frente de formação para jovens atletas de 10 a 13 anos com suporte, orientação, materiais, inscrições gratuitas no Circuito 11RUN e assessoria de publicidade."
    }
  },
  {
    key: "11-regional",
    eyebrow: "Itatiba e região",
    title: "11 Regional",
    subtitle: "Performance não tem idade.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora em movimento 11RUN",
    body: [
      "A 11RUN é global no alcance. Mas em Itatiba, o compromisso é local.",
      "O 11 Regional nasce para atletas que continuam levando o esporte a sério, independentemente da idade.",
      "Atletas que treinam, competem, representam, buscam evolução e querem estar cercados por uma estrutura real de alto rendimento."
    ],
    href: "/11-regional",
    formHref: "/cadastro/11-regional",
    cta: "Inscrever atleta master",
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
      "Importante: o 11 Regional é uma iniciativa 100% privada da 11RUN, sem apoio, vínculo institucional ou qualquer relação com a Prefeitura de Itatiba ou com o Departamento de Esportes de Itatiba.",
    banner: {
      eyebrow: "11 Regional",
      title: "Performance local com ambição de alto rendimento.",
      text: "Uma estrutura para atletas que continuam competindo, evoluindo e representando sua região."
    },
    metadata: {
      title: "11 Regional - 11RUN",
      description: "Projeto competitivo privado para atletas master de Itatiba e região com potencial real de destaque."
    }
  },
  {
    key: "circuito-futuro-11",
    eyebrow: "circuito infantil",
    title: "Circuito Futuro 11",
    subtitle: "Da primeira volta na pista ao sonho de chegar mais longe.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora em movimento 11RUN",
    body: [
      "O futuro do meio-fundo e fundo começa na pista.",
      "Vem aí o Circuito Futuro 11, o primeiro circuito de desenvolvimento competitivo em pista para crianças e pré-adolescentes de 10 a 13 anos."
    ],
    href: "/circuito-futuro-11",
    formHref: "/cadastro/circuito-futuro-11",
    cta: "Inscreva-se",
    icon: Route,
    features: [
      "4 etapas na região de Campinas",
      "10 anos - 800m",
      "11 anos - 1000m",
      "12 anos - 1500m",
      "13 anos - 2000m",
      "Categorias masculino e feminino",
      "Ranking por prova e idade",
      "Limite de 20 atletas por prova",
      "Premiação para os 3 primeiros de cada categoria"
    ],
    timeline: [
      { label: "Inscrições", detail: "a partir de 01 de agosto de 2026" },
      { label: "Etapa 1", detail: "fevereiro de 2027" },
      { label: "Etapa 2", detail: "julho de 2027" },
      { label: "Etapa 3", detail: "setembro de 2027" },
      { label: "Etapa 4", detail: "novembro de 2027" }
    ],
    banner: {
      eyebrow: "Circuito Futuro 11",
      title: "Primeira pista, primeiro ritmo, futuro competitivo.",
      text: "Um circuito para transformar a infância ativa em experiência esportiva segura e progressiva."
    },
    metadata: {
      title: "Circuito Futuro 11",
      description:
        "Circuito infantil de meio-fundo e fundo em pista. A categoria considera a idade que o atleta completa no ano da competição."
    }
  },
  {
    key: "bolsas",
    eyebrow: "oportunidades internacionais",
    title: "Portal de Oportunidades 11RUN",
    subtitle: "Bolsas universitárias para jovens fundistas: o caminho que muitos talentos ainda não sabem que existe.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora de alta performance em movimento",
    body: [
      "No Brasil, existem atletas jovens com disciplina, potencial e sonhos grandes. Mas entre correr bem e conquistar uma oportunidade internacional, existe uma jornada que quase ninguém explica com clareza.",
      "O Portal de Oportunidades 11RUN nasce para organizar esse caminho.",
      "Uma ponte entre atletas, famílias, treinadores e universidades que oferecem programas de estudo, formação esportiva e desenvolvimento para corredores de fundo."
    ],
    href: "/bolsas",
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
    banner: {
      eyebrow: "Bolsas",
      title: "O caminho internacional precisa começar com clareza.",
      text: "Uma ponte entre desempenho, documentação, universidades e oportunidades fora do Brasil."
    },
    metadata: {
      title: "Portal de Oportunidades 11RUN",
      description: "Ponte entre jovens fundistas, famílias, treinadores e oportunidades universitárias no exterior."
    }
  }
];

export const ecosystemCards = [
  {
    title: "App 11Run",
    text: "Plataforma de performance para transformar dados, treinos e histórico em acompanhamento esportivo claro.",
    href: "/app-11run",
    cta: "Conhecer o App 11Run",
    icon: BarChart3
  },
  {
    title: "Onze Futuro",
    text: "Formação de jovens atletas entre 10 e 13 anos com suporte, orientação, materiais e convivência esportiva.",
    href: "/onze-futuro",
    cta: "Conhecer o Onze Futuro",
    icon: Medal
  },
  {
    title: "11 Regional",
    text: "Projeto competitivo para atletas master com potencial real de destaque regional e nacional.",
    href: "/11-regional",
    cta: "Conhecer o 11 Regional",
    icon: Trophy
  },
  {
    title: "Circuito Futuro 11",
    text: "Circuito infantil de meio-fundo em pista para crianças e pré-adolescentes de 10 a 13 anos.",
    href: "/circuito-futuro-11",
    cta: "Conhecer o Circuito Futuro 11",
    icon: Flag
  },
  {
    title: "Bolsas e Oportunidades",
    text: "Ponte entre atletas, famílias, treinadores e oportunidades universitárias nos EUA, Japão e outros centros esportivos.",
    href: "/bolsas",
    cta: "Ver oportunidades",
    icon: Globe2
  }
];

export const sportIcons = [
  Activity,
  BarChart3,
  Dumbbell,
  HeartPulse,
  CalendarDays,
  Award,
  Network,
  Map,
  CircleDollarSign,
  Timer
];

export const projectByRoute: Record<string, ProjectPage> = {
  "app-11run": projects[0],
  "onze-futuro": projects[1],
  "11-regional": projects[2],
  "circuito-futuro-11": projects[3],
  bolsas: projects[4]
};

export const formProjects = {
  "app-11run": {
    label: "App 11Run",
    projectType: "app-11run",
    title: "Cadastro App 11Run",
    fields: [
      { name: "usage_profile", label: "Perfil de uso", type: "select", options: ["atleta", "treinador", "projeto", "assessoria", "clube"] },
      { name: "platforms", label: "Plataformas usadas", placeholder: "Strava, Garmin, planilha, outro" },
      { name: "main_goal", label: "Objetivo principal" },
      { name: "athletes_count", label: "Número aproximado de atletas acompanhados" }
    ]
  },
  "onze-futuro": {
    label: "Onze Futuro",
    projectType: "onze-futuro",
    title: "Cadastro Onze Futuro",
    fields: [
      { name: "athlete_name", label: "Nome do atleta" },
      { name: "birth_date", label: "Data de nascimento", type: "date" },
      { name: "father_name", label: "Nome do pai" },
      { name: "mother_name", label: "Nome da mãe" },
      { name: "guardian", label: "Responsável legal" },
      { name: "guardian_rg", label: "RG do responsável" },
      { name: "guardian_cpf", label: "CPF do responsável" },
      { name: "guardian_pix", label: "Conta bancária ou chave PIX do responsável" },
      { name: "athlete_rg", label: "RG do atleta" },
      { name: "athlete_cpf", label: "CPF do atleta" },
      { name: "address", label: "Endereço completo" },
      { name: "shoe_size", label: "Tamanho do calçado" },
      { name: "height_cm", label: "Altura em cm", type: "number" },
      { name: "weight_kg", label: "Peso em kg", type: "number" },
      { name: "coach_name", label: "Nome do treinador" },
      { name: "coach_phone", label: "Contato do treinador" },
      { name: "coach_cref", label: "CREF do treinador" },
      { name: "school", label: "Escola" },
      { name: "sports", label: "Modalidades praticadas" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "competitions", label: "Provas disputadas" },
      { name: "social_link", label: "Link de vídeo ou Instagram" },
      { name: "athlete_dream", label: "Maior sonho do atleta", type: "textarea" }
    ]
  },
  "11-regional": {
    label: "11 Regional",
    projectType: "11-regional",
    title: "Inscrição 11 Regional",
    fields: [
      { name: "cpf", label: "CPF" },
      { name: "rg", label: "RG" },
      { name: "address", label: "Endereço completo" },
      { name: "social_link", label: "Perfil de redes sociais" },
      { name: "best_marks", label: "Melhores provas e resultados", type: "textarea" },
      { name: "competitions", label: "Histórico competitivo", type: "textarea" },
      {
        name: "within_itatiba_radius",
        label: "Mora em Itatiba ou em raio de até 40 km",
        type: "select",
        options: ["sim", "não"]
      }
    ]
  },
  "circuito-futuro-11": {
    label: "Circuito Futuro 11",
    projectType: "circuito-futuro-11",
    title: "Inscrição Circuito Futuro 11",
    fields: [
      { name: "guardian_name", label: "Nome do responsável" },
      { name: "guardian_cpf", label: "CPF do responsável" },
      { name: "guardian_rg", label: "RG do responsável" },
      { name: "guardian_email", label: "E-mail do responsável", type: "email" },
      { name: "guardian_phone", label: "WhatsApp do responsável" },
      { name: "athlete_name", label: "Nome do atleta" },
      { name: "athlete_cpf", label: "CPF do atleta" },
      { name: "athlete_rg", label: "RG do atleta" },
      { name: "birth_date", label: "Data de nascimento", type: "date" },
      {
        name: "race_event",
        label: "Prova / faixa etária",
        type: "select",
        options: ["10 anos - 800m", "11 anos - 1000m", "12 anos - 1500m", "13 anos - 2000m"]
      },
      {
        name: "payment_plan",
        label: "Plano de inscrição",
        type: "select",
        options: ["R$ 50,00 por etapa", "R$ 150,00 para as 4 etapas"]
      },
      { name: "team", label: "Equipe ou escola" },
      { name: "social_link", label: "Perfil de redes sociais" }
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
