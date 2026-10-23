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
  bannerSrc: "/assets/home/grupo-11run-pista.webp",
  bannerAlt: "Atletas e famílias da 11RUN reunidos na pista, em imagem temática do projeto",
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
  title: "Inauguração do Centro Olímpico de Vinhedo",
  shortTitle: "Centro Olímpico · Vinhedo",
  description: "Uma nova pista. Um novo horizonte para o esporte. Venha celebrar essa conquista de Vinhedo com uma corrida inclusiva, recreativa e cheia de diversão.",
  dateLabel: "14 de novembro de 2026",
  dateTime: "2026-11-14T08:00:00-03:00",
  timeLabel: "8h · corrida das 9h às 10h",
  city: "Vinhedo · SP",
  venue: "Centro Olímpico de Vinhedo",
  address: "R. Joana Fabri Thomé, 500 · Jardim Três Irmãos · Vinhedo – SP · CEP 13280-000",
  ageLabel: "6 a 17 anos",
  format: "Corrida recreativa em pista",
  bannerSrc: "/assets/home-future-track.jpg",
  bannerAlt: "Atleta 11RUN em uma pista de atletismo, em imagem temática do projeto",
  directionsUrl: "https://www.google.com/maps/search/?api=1&query=R.%20Joana%20Fabri%20Thom%C3%A9%2C%20500%2C%20Vinhedo%20SP%2013280-000",
  whatsapp: "5511999385329",
  phoneLabel: "+55 11 99938-5329",
  free: true,
  schoolEnabled: true,
  introTitle: "Um marco para a cidade. Uma largada para todos.",
  paragraphs: [
    "Vinhedo entrega à cidade e à região uma pista de atletismo de padrões internacionais. A inauguração do Centro Olímpico abre um novo espaço para a formação esportiva, os encontros da comunidade e os sonhos de quem está começando.",
    "As solenidades e comemorações começam às 8h. Das 9h às 10h, a pista recebe uma corrida comemorativa e inclusiva, com a participação conjunta dos atletas da 11RUN, do IVCL e de crianças e adolescentes das escolas de Vinhedo.",
    "A proposta é recreativa: correr, brincar e compartilhar um momento marcante para a cidade. Crianças e adolescentes de 6 a 17 anos são convidados a participar gratuitamente, com distribuição de prêmios pela 11RUN e pelo IVCL."
  ],
  highlight: { value: "9h–10h", label: "Uma hora para celebrar correndo", text: "Diversão, inclusão e encontro entre escolas, famílias e atletas, com distribuição de prêmios 11RUN e IVCL." },
  benefits: [
    { title: "Esporte que inclui", text: "Uma corrida recreativa para crianças e adolescentes de 6 a 17 anos, com espaço para participar e se divertir." },
    { title: "Prêmios para celebrar", text: "A 11RUN e o IVCL farão a distribuição de prêmios durante esse encontro especial." },
    { title: "Sua escola na pista", text: "Inscrição individual ou de grupos escolares em um único cadastro, de forma simples e gratuita." }
  ],
  schedule: [
    { time: "8h", title: "Inauguração do Centro Olímpico", detail: "Início das solenidades e comemorações dessa nova conquista de Vinhedo." },
    { time: "9h–10h", title: "Corrida comemorativa e inclusiva", detail: "Participação de atletas da 11RUN, IVCL e estudantes das escolas, com diversão e distribuição de prêmios." }
  ],
  registrationText: "Escolha a inscrição individual ou cadastre sua escola e os alunos em grupo. A participação é gratuita e também haverá inscrição no local.",
  faq: [
    { question: "A corrida é competitiva?", answer: "A proposta é comemorativa, inclusiva e recreativa. O objetivo é se divertir e celebrar a inauguração junto com outros estudantes e com as equipes da 11RUN e do IVCL." },
    { question: "Como inscrever uma escola?", answer: "No formulário, escolha a inscrição em grupo escolar. Informe a escola e o responsável e adicione os alunos no mesmo cadastro, sem precisar preencher um formulário separado para cada participante." },
    { question: "Qual é o horário da corrida?", answer: "As solenidades começam às 8h do dia 14 de novembro de 2026. A corrida recreativa acontece das 9h às 10h." },
    { question: "A participação tem custo?", answer: "Não. A inscrição e a participação são gratuitas, pelo site ou no local. A atividade é para crianças e adolescentes de 6 a 17 anos." }
  ]
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
  bannerSrc: "/assets/alex-lopes/atletas-em-prova-pista.webp",
  bannerAlt: "Atletas em uma prova de atletismo, em imagem temática da corrida de base",
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
