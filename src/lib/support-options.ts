export const supportInterestTypes = ["Profissionais Voluntários", "Quero Patrocinar o projeto"] as const;

export const supportProjects = ["App 11Run", "11 Futuro", "11 Master", "Circuito 11 Futuro", "Bolsas"] as const;

export const supportStatuses = ["Novo interesse", "Em contato", "Voluntário", "Patrocinador", "Concluído", "Arquivado"] as const;

export const supportPlans = [
  {
    id: "associado",
    name: "Associado",
    price: "R$ 28,10",
    period: "/mês",
    idealFor: "Pessoas que querem apoiar o clube e fazer parte da comunidade.",
    description:
      "A 11RUN é um clube. Ao se associar, você ajuda nosso projeto a crescer e fortalece diretamente nossas atividades.",
    benefits: [
      "Carteirinha oficial do projeto.",
      "Nome na lista de apoiadores.",
      "Acesso à prestação de contas macro.",
      "Acesso ao calendário de atividades.",
      "Possibilidade de participar das reuniões semanais estratégicas e de visão de futuro."
    ],
    highlighted: false
  },
  {
    id: "bronze",
    name: "Patrocinador Bronze",
    price: "R$ 51,50",
    period: "/mês",
    idealFor: "Pequenos apoiadores e marcas que querem iniciar como patrocinadores.",
    description:
      "Com o plano Bronze, você se torna patrocinador oficial da 11RUN e contribui mensalmente para o crescimento do projeto.",
    benefits: [
      "Carteirinha digital oficial do projeto.",
      "Logo no site.",
      "Acesso à prestação de contas macro.",
      "Acesso ao calendário de atividades.",
      "Possibilidade de participar das reuniões semanais estratégicas e de visão de futuro."
    ],
    highlighted: false
  },
  {
    id: "prata",
    name: "Patrocinador Prata",
    price: "R$ 91,10",
    period: "/mês",
    idealFor: "Marcas que desejam presença digital nas redes da 11RUN.",
    description:
      "Com o plano Prata, você fortalece sua presença como patrocinador oficial e amplia a visibilidade da sua marca nos canais digitais da 11RUN.",
    benefits: [
      "Carteirinha digital oficial do projeto.",
      "Logo no site.",
      "Logo nas redes sociais: YouTube, Instagram e TikTok.",
      "Acesso à prestação de contas macro.",
      "Acesso ao calendário de atividades.",
      "Possibilidade de participar das reuniões semanais estratégicas e de visão de futuro."
    ],
    highlighted: false
  },
  {
    id: "ouro",
    name: "Patrocinador Ouro",
    price: "R$ 280,10",
    period: "/mês",
    idealFor: "Marcas que desejam maior visibilidade e entrega mensal de mídia.",
    description:
      "O plano Ouro é ideal para marcas e apoiadores que desejam maior visibilidade e participação ativa no crescimento da 11RUN.",
    benefits: [
      "Carteirinha digital oficial do projeto.",
      "Logo no site.",
      "Logo nas redes sociais: YouTube, Instagram e TikTok.",
      "Mídia kit mensal com 1 post estático + 1 vídeo.",
      "Acesso à prestação de contas macro.",
      "Acesso ao calendário de atividades.",
      "Possibilidade de participar das reuniões semanais estratégicas e de visão de futuro."
    ],
    highlighted: true
  }
] as const;

export const supportPlanOptions = supportPlans.map((plan) => `${plan.name} — ${plan.price}${plan.period}`) as [
  string,
  string,
  string,
  string
];
