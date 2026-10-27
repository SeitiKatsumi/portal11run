export type EventLandingContent = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  dateLabel: string;
  dateTime: string;
  timeLabel: string;
  city: string;
  venue: string;
  address: string;
  ageLabel: string;
  format: string;
  bannerSrc: string;
  bannerAlt: string;
  showBannerLabel?: boolean;
  directionsUrl: string;
  instagramUrl?: string;
  whatsapp: string;
  phoneLabel: string;
  free: boolean;
  registrationUrl?: string;
  schoolEnabled?: boolean;
  introTitle: string;
  paragraphs: string[];
  highlight: { value: string; label: string; text: string };
  benefits: { title: string; text: string }[];
  schedule: { time: string; title: string; detail: string }[];
  registrationText: string;
  faq: { question: string; answer: string }[];
};

export const finalissimaEvent: EventLandingContent = {
  id: "finalissima-desafio-virtual-2026",
  title: "Grande Finalíssima do Desafio Virtual",
  shortTitle: "Finalíssima · Desafio Virtual 1000m",
  description: "A jornada virtual encontra a pista. Uma tarde para correr, celebrar os vencedores e viver a última etapa presencial do Desafio Virtual 1000m, no IVCL em Campinas.",
  dateLabel: "13 de novembro de 2026",
  dateTime: "2026-11-13T14:00:00-03:00",
  timeLabel: "14h",
  city: "Campinas · SP",
  venue: "IVCL · Instituto Vanderlei Cordeiro de Lima",
  address: "IVCL · Campinas, São Paulo. Consulte o ponto de acesso no mapa da organização.",
  ageLabel: "9 a 13 anos",
  format: "1.000 m em pista",
  bannerSrc: "/assets/eventos/finalissima-ivcl-2026.webp",
  bannerAlt: "Pista azul do IVCL em Campinas com bandeiras 11RUN do Desafio Virtual de 1.000 metros",
  directionsUrl: "https://tinyurl.com/444zt8h5",
  instagramUrl: "https://www.instagram.com/p/DeJrMvIkT2H/",
  whatsapp: "5511999385329",
  phoneLabel: "+55 11 99938-5329",
  free: true,
  introTitle: "Do desafio à pista. Cada conquista merece esse encontro.",
  paragraphs: [
    "Depois de cada treino e de cada marca enviada, chegou a hora de reunir a comunidade do Desafio Virtual 1000m. A Grande Finalíssima acontece no dia 13 de novembro, às 14h, no IVCL, em Campinas.",
    "O encontro terá a premiação de todos os vencedores do desafio e a última etapa presencial, aberta a todos os participantes da faixa etária de 9 a 13 anos. Uma oportunidade de correr 1.000 metros em pista, reencontrar amigos e celebrar a evolução de cada atleta.",
    "A participação é gratuita. O responsável pode fazer a inscrição pelo site ou diretamente no local, no dia do evento."
  ],
  highlight: { value: "1.000 m", label: "Uma última largada, juntos", text: "A energia da pista e a celebração de uma jornada que começou no Desafio Virtual." },
  benefits: [
    { title: "Premiação dos vencedores", text: "Um encontro para reconhecer todos os vencedores do Desafio Virtual e celebrar suas conquistas." },
    { title: "Etapa presencial aberta", text: "Crianças de 9 a 13 anos podem participar da última prova em pista, com inscrição gratuita." },
    { title: "Inscrição simples", text: "Preencha o cadastro online com o responsável ou faça a inscrição na hora, no IVCL." }
  ],
  schedule: [{ time: "14h", title: "Grande Finalíssima do Desafio Virtual 1000m", detail: "Etapa presencial em pista e premiação dos vencedores, no IVCL em Campinas." }],
  registrationText: "Inscreva o atleta com os dados do responsável. Também será possível se inscrever gratuitamente no local, no dia do evento.",
  faq: [
    { question: "Quem pode participar da prova?", answer: "A etapa presencial é destinada a crianças de 9 a 13 anos e é aberta aos participantes dessa faixa etária. A participação é gratuita." },
    { question: "Preciso fazer a inscrição pelo site?", answer: "O cadastro online facilita a organização, mas também haverá inscrição gratuita na hora, no IVCL, com o responsável." },
    { question: "Como funciona a premiação?", answer: "Durante a Grande Finalíssima acontecerá a premiação de todos os vencedores do Desafio Virtual. Consulte o desafio para acompanhar suas regras e resultados." }
  ]
};

export const vinhedoEvent: EventLandingContent = {
  id: "inauguracao-centro-olimpico-vinhedo-2026",
  title: "Inauguração do Centro de Excelência em Atletismo de Vinhedo",
  shortTitle: "Centro de Excelência em Atletismo · Vinhedo",
  description: "A Prefeitura de Vinhedo convida os alunos do Ensino Fundamental I da Rede Municipal de Ensino e suas famílias para celebrar a inauguração do novo Centro de Excelência em Atletismo!",
  dateLabel: "14 de novembro de 2026 (sábado)",
  dateTime: "2026-11-14T07:30:00-03:00",
  timeLabel: "A partir das 7h30 – Chegada dos alunos",
  city: "Vinhedo · SP",
  venue: "Centro de Excelência em Atletismo de Vinhedo",
  address: "Rua Joana Fabri Thomé – Jardim São Matheus, Vinhedo/SP",
  ageLabel: "Alunos do Ensino Fundamental I da Rede Municipal de Ensino e suas famílias",
  format: "Corrida recreativa e inclusiva",
  bannerSrc: "/assets/eventos/inauguracao-vinhedo-banner-verde-2026.webp",
  bannerAlt: "Banner da Prefeitura de Vinhedo com atletas, famílias e equipe 11RUN reunidos na pista",
  showBannerLabel: false,
  directionsUrl: "https://www.google.com/maps/search/?api=1&query=Rua%20Joana%20Fabri%20Thom%C3%A9%2C%20Jardim%20S%C3%A3o%20Matheus%2C%20Vinhedo%20SP",
  whatsapp: "5511999385329",
  phoneLabel: "+55 11 99938-5329",
  free: true,
  schoolEnabled: false,
  introTitle: "Participe dessa conquista para o esporte de Vinhedo!",
  paragraphs: [
    "Venha participar de uma corrida recreativa, inclusiva e cheia de diversão, preparada especialmente para as crianças, em um momento de integração, esporte, alegria e premiação!"
  ],
  highlight: { value: "1º ao 5º ano", label: "Ensino Fundamental I", text: "Um convite aos alunos da Rede Municipal de Ensino e suas famílias." },
  benefits: [],
  schedule: [],
  registrationText: "Preencha os dados do responsável legal e do aluno para confirmar a participação gratuita.",
  faq: []
};

export const princesinhaEvent: EventLandingContent = {
  id: "princesinha-da-colina-2026",
  title: "Princesinha da Colina",
  shortTitle: "Princesinha da Colina · Itatiba",
  description: "Uma tarde para viver a emoção da corrida de rua. A categoria especial 11RUN reúne crianças de 9 a 13 anos em 1 km aferido, com cronometragem e pódio oficial.",
  dateLabel: "14 de novembro de 2026",
  dateTime: "2026-11-14T14:00:00-03:00",
  timeLabel: "14h",
  city: "Itatiba · SP",
  venue: "Parque da Juventude · Itatiba",
  address: "Parque da Juventude · Itatiba, São Paulo. Consulte o acesso no mapa da organização.",
  ageLabel: "9 a 13 anos · especial 11RUN",
  format: "1 km de corrida de rua",
  bannerSrc: "/assets/eventos/princesinha-banner-2026.webp",
  bannerAlt: "Crianças correndo em uma rua cercada por árvores e bambus, sob a luz do sol",
  directionsUrl: "https://tinyurl.com/3cshvffm",
  whatsapp: "5511985208864",
  phoneLabel: "+55 11 98520-8864",
  free: false,
  registrationUrl: "https://www.ticketsports.com.br/e/8a-corrida-princesinha-da-colina-87852",
  introTitle: "Pequenos corredores. Uma grande experiência.",
  paragraphs: [
    "No dia 14 de novembro, às 14h, Itatiba recebe a Princesinha da Colina. A categoria especial 11RUN convida crianças de 9 a 13 anos para um percurso de 1 km aferido na rua, com cronometragem e pódio oficial.",
    "É uma oportunidade de experimentar a corrida de rua com a energia de um evento esportivo, compartilhar a largada com outros jovens atletas e celebrar cada chegada.",
    "O evento também anuncia provas recreativas para crianças de 2 a 13 anos, com distâncias diferentes por faixa etária. Confira a modalidade adequada e faça a inscrição diretamente no TicketSports."
  ],
  highlight: { value: "1 km", label: "Categoria especial 11RUN", text: "Percurso aferido na rua para crianças de 9 a 13 anos, com cronometragem e pódio oficial." },
  benefits: [
    { title: "Pódio oficial", text: "A categoria especial 11RUN de 1.000 metros conta com cronometragem e pódio oficial." },
    { title: "Corrida desde a infância", text: "Além da categoria especial, o evento anuncia provas recreativas de 2 a 13 anos, com distâncias por faixa etária." },
    { title: "Cadastro no TicketSports", text: "Inscrições realizadas na plataforma oficial do evento. Consulte valores, categorias e disponibilidade de vagas." }
  ],
  schedule: [{ time: "14h", title: "Princesinha da Colina", detail: "Encontro no Parque da Juventude, em Itatiba. Confira os horários e instruções de cada categoria na inscrição oficial." }],
  registrationText: "Escolha a categoria do atleta e finalize a inscrição no TicketSports. O flyer anuncia R$ 60 e vagas limitadas; confira o valor vigente e as condições na plataforma oficial.",
  faq: [
    { question: "Qual é a categoria especial 11RUN?", answer: "É a prova de 1.000 metros na rua para crianças de 9 a 13 anos, nascidas de 2013 a 2017, com percurso aferido, cronometragem e pódio oficial." },
    { question: "Crianças mais novas podem participar?", answer: "O evento também anuncia provas recreativas para crianças de 2 a 13 anos, em distâncias diferentes. Consulte no TicketSports a categoria e o percurso adequados à idade do atleta." },
    { question: "A inscrição é gratuita?", answer: "O flyer anuncia inscrição de R$ 60 e vagas limitadas. Confira os valores, eventuais taxas e a disponibilidade diretamente no TicketSports antes de concluir o cadastro." }
  ]
};
