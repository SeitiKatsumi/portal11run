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

export const projectNavItems = [
  { label: "App 11Run", href: "/app-11run" },
  { label: "11 Futuro", href: "/onze-futuro" },
  { label: "11 Master", href: "/11-master" },
  { label: "Circuito 11 Futuro", href: "/circuito-futuro-11" },
  { label: "Bolsas", href: "/bolsas" }
];

export const navItems = [
  { label: "Home", href: "/" },
  { label: "Projetos", href: "#projetos", children: projectNavItems },
  { label: "Apoie o projeto", href: "/apoie-o-projeto" }
];

export const metrics = [
  { label: "usuÃ¡rios", value: "14 mil" },
  { label: "paÃ­ses conectados", value: "14" },
  { label: "atletas Sub-14 nos 5000m", value: "+300" },
  { label: "frentes de desenvolvimento", value: "5" }
];

export const projects: ProjectPage[] = [
  {
    key: "app-11run",
    eyebrow: "performance orientada por dados",
    title: "App 11Run",
    subtitle: "Uma plataforma para organizar treino, leitura de desempenho e evoluÃ§Ã£o esportiva com mais clareza.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora em movimento representando performance e tecnologia",
    body: [
      "O App 11Run nasce para atletas, treinadores e projetos que querem ir alÃ©m da planilha e transformar rotina esportiva em acompanhamento consistente.",
      "A plataforma reÃºne histÃ³rico, metas, cargas, indicadores e conexÃµes para que cada decisÃ£o tenha contexto e continuidade.",
      "Cada atleta passa a ser acompanhado com mais profundidade, do treino diÃ¡rio ao planejamento de longo prazo."
    ],
    href: "/app-11run",
    formHref: "https://app.11run.com.br/",
    cta: "Acessar App 11Run",
    icon: BarChart3,
    metrics: ["14 mil usuÃ¡rios", "14 paÃ­ses", "+300 atletas Sub-14 nos 5000m"],
    features: [
      "Acompanhamento esportivo",
      "Centro de performance",
      "AnÃ¡lise de volume",
      "Indicadores de carga",
      "Objetivos esportivos",
      "HistÃ³rico cronolÃ³gico",
      "ConexÃµes com Strava e Garmin",
      "RelatÃ³rios para treinadores"
    ],
    highlight: {
      title: "LanÃ§amento global: 01/07/2026",
      text: "Uma camada de organizaÃ§Ã£o para transformar dados, rotina e calendÃ¡rio em uma visÃ£o clara de evoluÃ§Ã£o."
    },
    banner: {
      eyebrow: "App 11Run",
      title: "Dados que transformam rotina em evoluÃ§Ã£o.",
      text: "Um app para organizar treino, leitura de desempenho e decisÃµes com contexto real."
    },
    metadata: {
      title: "App 11Run - Performance para corredores",
      description: "Plataforma para anÃ¡lise de treinos, performance, histÃ³rico, metas e evoluÃ§Ã£o de atletas."
    }
  },
  {
    key: "onze-futuro",
    eyebrow: "Onze Futuro",
    title: "Onze Futuro",
    subtitle: "O Brasil tem talento. O que falta, muitas vezes, Ã© estrutura, continuidade e oportunidade no momento certo.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora em movimento 11RUN",
    body: [
      "O Onze Futuro acompanha jovens atletas entre 10 e 13 anos, oferecendo suporte, orientaÃ§Ã£o, convivÃªncia esportiva, ajuda de custo, materiais, inscriÃ§Ãµes gratuitas no Circuito 11RUN e assessoria de publicidade ao longo do processo.",
      "Mais do que correr provas, queremos formar atletas. Mais do que buscar medalhas agora, queremos construir base para o futuro."
    ],
    href: "/onze-futuro",
    formHref: "/cadastro/onze-futuro",
    cta: "Cadastrar atleta",
    icon: Users,
    metrics: ["4 atletas", "1 missÃ£o", "cultura esportiva", "disciplina"],
    features: [
      "Acompanhamento esportivo",
      "Ajuda de custo",
      "Materiais",
      "InscriÃ§Ãµes gratuitas no Circuito 11RUN",
      "Assessoria de publicidade",
      "ConvivÃªncia com atletas",
      "OrientaÃ§Ã£o para famÃ­lias"
    ],
    highlight: {
      title: "Onze Futuro para chegar longe",
      text: "Suporte, oportunidade e convivÃªncia esportiva no perÃ­odo em que a cultura de treino comeÃ§a a ser formada."
    },
    banner: {
      eyebrow: "Onze Futuro",
      title: "Mais cedo no movimento. Mais futuro no fundismo.",
      text: "Uma frente de base para criar repertÃ³rio, continuidade e cultura esportiva desde a infÃ¢ncia."
    },
    metadata: {
      title: "Onze Futuro - 11RUN",
      description:
        "Frente de formaÃ§Ã£o para jovens atletas de 10 a 13 anos com suporte, orientaÃ§Ã£o, materiais, inscriÃ§Ãµes gratuitas no Circuito 11RUN e assessoria de publicidade."
    }
  },
  {
    key: "11-regional",
    eyebrow: "Itatiba e regiÃ£o",
    title: "11 Master",
    subtitle: "Performance nÃ£o tem idade.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora em movimento 11RUN",
    body: [
      "A 11RUN Ã© global no alcance. Mas em Itatiba, o compromisso Ã© local.",
      "O 11 Master nasce para atletas que continuam levando o esporte a sÃ©rio, independentemente da idade.",
      "Atletas que treinam, competem, representam, buscam evoluÃ§Ã£o e querem estar cercados por uma estrutura real de alto rendimento."
    ],
    href: "/11-master",
    formHref: "/cadastro/11-master",
    cta: "Inscrever atleta master",
    icon: Trophy,
    features: [
      "Suporte federativo",
      "Suporte tÃ©cnico",
      "Apoio financeiro",
      "Treinamento em grupo",
      "Rede de desenvolvimento",
      "Planejamento competitivo"
    ],
    highlight: {
      title: "NÃ£o Ã© sobre apenas participar.",
      text: "Ã‰ sobre representar, competir com propÃ³sito e levar Itatiba e regiÃ£o para dentro das grandes provas com forÃ§a, estrutura e ambiÃ§Ã£o."
    },
    notice:
      "Importante: o 11 Master Ã© uma iniciativa 100% privada da 11RUN, sem apoio, vÃ­nculo institucional ou qualquer relaÃ§Ã£o com a Prefeitura de Itatiba ou com o Departamento de Esportes de Itatiba.",
    banner: {
      eyebrow: "11 Master",
      title: "Performance local com ambiÃ§Ã£o de alto rendimento.",
      text: "Uma estrutura para atletas que continuam competindo, evoluindo e representando sua regiÃ£o."
    },
    metadata: {
      title: "11 Master - 11RUN",
      description: "Projeto competitivo privado para atletas master de Itatiba e regiÃ£o com potencial real de destaque."
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
      "O futuro do meio-fundo e fundo comeÃ§a na pista.",
      "Vem aÃ­ o Circuito Futuro 11, o primeiro circuito de desenvolvimento competitivo em pista para crianÃ§as e prÃ©-adolescentes de 10 a 13 anos."
    ],
    href: "/circuito-futuro-11",
    formHref: "/cadastro/circuito-futuro-11",
    cta: "Inscreva-se",
    icon: Route,
    features: [
      "4 etapas na regiÃ£o de Campinas",
      "10 anos - 800m",
      "11 anos - 1000m",
      "12 anos - 1500m",
      "13 anos - 2000m",
      "Categorias masculino e feminino",
      "Ranking por prova e idade",
      "Limite de 20 atletas por prova",
      "PremiaÃ§Ã£o para os 3 primeiros de cada categoria"
    ],
    timeline: [
      { label: "InscriÃ§Ãµes", detail: "a partir de 01 de agosto de 2026" },
      { label: "Etapa 1", detail: "fevereiro de 2027" },
      { label: "Etapa 2", detail: "julho de 2027" },
      { label: "Etapa 3", detail: "setembro de 2027" },
      { label: "Etapa 4", detail: "novembro de 2027" }
    ],
    banner: {
      eyebrow: "Circuito Futuro 11",
      title: "Primeira pista, primeiro ritmo, futuro competitivo.",
      text: "Um circuito para transformar a infÃ¢ncia ativa em experiÃªncia esportiva segura e progressiva."
    },
    metadata: {
      title: "Circuito Futuro 11",
      description:
        "Circuito infantil de meio-fundo e fundo em pista. A categoria considera a idade que o atleta completa no ano da competiÃ§Ã£o."
    }
  },
  {
    key: "bolsas",
    eyebrow: "oportunidades internacionais",
    title: "Portal de Oportunidades 11RUN",
    subtitle: "Bolsas universitÃ¡rias para jovens fundistas: o caminho que muitos talentos ainda nÃ£o sabem que existe.",
    imageSrc: "/assets/11run-reference.jpg",
    imageAlt: "Corredora de alta performance em movimento",
    body: [
      "No Brasil, existem atletas jovens com disciplina, potencial e sonhos grandes. Mas entre correr bem e conquistar uma oportunidade internacional, existe uma jornada que quase ninguÃ©m explica com clareza.",
      "O Portal de Oportunidades 11RUN nasce para organizar esse caminho.",
      "Uma ponte entre atletas, famÃ­lias, treinadores e universidades que oferecem programas de estudo, formaÃ§Ã£o esportiva e desenvolvimento para corredores de fundo."
    ],
    href: "/bolsas",
    formHref: "/cadastro/bolsas",
    cta: "Cadastrar interesse em bolsas e oportunidades",
    icon: GraduationCap,
    features: [
      "Marcas oficiais",
      "HistÃ³rico escolar",
      "Idioma",
      "VÃ­deos",
      "DocumentaÃ§Ã£o",
      "Elegibilidade",
      "Contato com universidades",
      "Timing competitivo"
    ],
    comparison: [
      {
        title: "EUA",
        text: "Rota mais direta entre desempenho esportivo, contato com tÃ©cnicos, bolsas esportivas, acadÃªmicas ou combinadas, calendÃ¡rio universitÃ¡rio, cross country e pista."
      },
      {
        title: "JapÃ£o",
        text: "Caminho mais acadÃªmico, cultural e ligado aos clubes universitÃ¡rios, com forte tradiÃ§Ã£o no Ekiden, adaptaÃ§Ã£o ao idioma e formaÃ§Ã£o coletiva."
      }
    ],
    notice:
      "Ãndices e critÃ©rios sÃ£o aproximados. Verifique sempre os dados atualizados nos sites oficiais das ligas, universidades, consulados e programas de bolsa.",
    banner: {
      eyebrow: "Bolsas",
      title: "O caminho internacional precisa comeÃ§ar com clareza.",
      text: "Uma ponte entre desempenho, documentaÃ§Ã£o, universidades e oportunidades fora do Brasil."
    },
    metadata: {
      title: "Portal de Oportunidades 11RUN",
      description: "Ponte entre jovens fundistas, famÃ­lias, treinadores e oportunidades universitÃ¡rias no exterior."
    }
  }
];

export const ecosystemCards = [
  {
    title: "App 11Run",
    text: "Plataforma de performance para transformar dados, treinos e histÃ³rico em acompanhamento esportivo claro.",
    href: "/app-11run",
    cta: "Conhecer o App 11Run",
    icon: BarChart3
  },
  {
    title: "Onze Futuro",
    text: "FormaÃ§Ã£o de jovens atletas entre 10 e 13 anos com suporte, orientaÃ§Ã£o, materiais e convivÃªncia esportiva.",
    href: "/onze-futuro",
    cta: "Conhecer o Onze Futuro",
    icon: Medal
  },
  {
    title: "11 Master",
    text: "Projeto competitivo para atletas master com potencial real de destaque regional e nacional.",
    href: "/11-master",
    cta: "Conhecer o 11 Master",
    icon: Trophy
  },
  {
    title: "Circuito Futuro 11",
    text: "Circuito infantil de meio-fundo em pista para crianÃ§as e prÃ©-adolescentes de 10 a 13 anos.",
    href: "/circuito-futuro-11",
    cta: "Conhecer o Circuito Futuro 11",
    icon: Flag
  },
  {
    title: "Bolsas e Oportunidades",
    text: "Ponte entre atletas, famÃ­lias, treinadores e oportunidades universitÃ¡rias nos EUA, JapÃ£o e outros centros esportivos.",
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
  "11-master": projects[2],
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
      { name: "athletes_count", label: "NÃºmero aproximado de atletas acompanhados" }
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
      { name: "mother_name", label: "Nome da mÃ£e" },
      { name: "guardian", label: "ResponsÃ¡vel legal" },
      { name: "guardian_rg", label: "RG do responsÃ¡vel" },
      { name: "guardian_cpf", label: "CPF do responsÃ¡vel" },
      { name: "guardian_pix", label: "Conta bancÃ¡ria ou chave PIX do responsÃ¡vel" },
      { name: "athlete_rg", label: "RG do atleta" },
      { name: "athlete_cpf", label: "CPF do atleta" },
      { name: "address", label: "EndereÃ§o completo" },
      { name: "shoe_size", label: "Tamanho do calÃ§ado" },
      { name: "height_cm", label: "Altura em cm", type: "number" },
      { name: "weight_kg", label: "Peso em kg", type: "number" },
      { name: "coach_name", label: "Nome do treinador" },
      { name: "coach_phone", label: "Contato do treinador" },
      { name: "coach_cref", label: "CREF do treinador" },
      { name: "school", label: "Escola" },
      { name: "sports", label: "Modalidades praticadas" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "competitions", label: "Provas disputadas" },
      { name: "social_link", label: "Link de vÃ­deo ou Instagram" },
      { name: "athlete_dream", label: "Maior sonho do atleta", type: "textarea" }
    ]
  },
  "11-regional": {
    label: "11 Master",
    projectType: "11-regional",
    title: "InscriÃ§Ã£o 11 Master",
    fields: [
      { name: "cpf", label: "CPF" },
      { name: "rg", label: "RG" },
      { name: "address", label: "EndereÃ§o completo" },
      { name: "social_link", label: "Perfil de redes sociais" },
      { name: "best_marks", label: "Melhores provas e resultados", type: "textarea" },
      { name: "competitions", label: "HistÃ³rico competitivo", type: "textarea" },
      {
        name: "within_itatiba_radius",
        label: "Mora em Itatiba ou em raio de atÃ© 40 km",
        type: "select",
        options: ["sim", "nÃ£o"]
      }
    ]
  },
  "circuito-futuro-11": {
    label: "Circuito Futuro 11",
    projectType: "circuito-futuro-11",
    title: "InscriÃ§Ã£o Circuito Futuro 11",
    fields: [
      { name: "guardian_name", label: "Nome do responsÃ¡vel" },
      { name: "guardian_cpf", label: "CPF do responsÃ¡vel" },
      { name: "guardian_rg", label: "RG do responsÃ¡vel" },
      { name: "guardian_email", label: "E-mail do responsÃ¡vel", type: "email" },
      { name: "guardian_phone", label: "WhatsApp do responsÃ¡vel" },
      { name: "athlete_name", label: "Nome do atleta" },
      { name: "athlete_cpf", label: "CPF do atleta" },
      { name: "athlete_rg", label: "RG do atleta" },
      { name: "birth_date", label: "Data de nascimento", type: "date" },
      {
        name: "race_event",
        label: "Prova / faixa etÃ¡ria",
        type: "select",
        options: ["10 anos - 800m", "11 anos - 1000m", "12 anos - 1500m", "13 anos - 2000m"]
      },
      {
        name: "payment_plan",
        label: "Plano de inscriÃ§Ã£o",
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
      { name: "country_interest", label: "PaÃ­s de interesse", type: "select", options: ["EUA", "JapÃ£o", "outro"] },
      { name: "language_english", label: "NÃ­vel de inglÃªs" },
      { name: "language_japanese", label: "NÃ­vel de japonÃªs" },
      { name: "best_marks", label: "Melhores marcas" },
      { name: "academic_history", label: "HistÃ³rico escolar" },
      { name: "social_link", label: "VÃ­deo ou Instagram" },
      { name: "international_goal", label: "Objetivo internacional" }
    ]
  }
} as const;

export type FormProjectSlug = keyof typeof formProjects;
