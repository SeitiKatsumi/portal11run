export const circuitCategories = [
  { category: "Sub 10", age: 9, distance: "800 m" },
  { category: "Sub 11", age: 10, distance: "800 m" },
  { category: "Sub 12", age: 11, distance: "1.000 m" },
  { category: "Sub 13", age: 12, distance: "1.000 m" },
  { category: "Sub 14", age: 13, distance: "1.500 m" },
  { category: "Sub 15", age: 14, distance: "2.000 m" },
  { category: "Sub 16", age: 15, distance: "2.000 m" },
  { category: "Sub 17", age: 16, distance: "3.000 m" },
  { category: "Sub 18", age: 17, distance: "3.000 m" }
] as const;

export const circuitRaceOptions = circuitCategories.map((item) => `${item.category} - ${item.age} anos no ano - ${item.distance.replace(" m", "m")}`);

export function circuitCategoryForBirthDate(birthDate: string, year: number) {
  const age = ageForBirthDate(birthDate, year);
  return circuitCategories.find((item) => item.age === age);
}

function ageForBirthDate(birthDate: string, year: number) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return undefined;
  const date = new Date(`${birthDate}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate) return undefined;
  return year - Number(birthDate.slice(0, 4));
}

export const crossCountryRaces = [
  { minAge: 16, maxAge: 17, label: "16 e 17 anos", distance: "4.000 m", time: "08:00" },
  { minAge: 14, maxAge: 15, label: "14 e 15 anos", distance: "3.000 m", time: "08:40" },
  { minAge: 12, maxAge: 13, label: "12 e 13 anos", distance: "2.000 m", time: "09:00" },
  { minAge: 10, maxAge: 11, label: "10 e 11 anos", distance: "1.000 m", time: "09:20" },
  { minAge: 0, maxAge: 9, label: "9 anos ou menos", distance: "1.000 m", time: "09:35" }
] as const;

export function crossCountryCategoryForBirthDate(birthDate: string) {
  const age = ageForBirthDate(birthDate, 2026);
  if (age === undefined || birthDate > new Date().toISOString().slice(0, 10)) return undefined;
  const race = crossCountryRaces.find((item) => age >= item.minAge && age <= item.maxAge);
  return race ? { category: `Sub ${Math.max(10, age + 1)}`, age, distance: race.distance } : undefined;
}

const crossCountryStartTimes = crossCountryRaces.map((race) => `${race.time} — ${race.label}: ${race.distance}, masculino e feminino.`);

export const crossCountryDirections = "https://tinyurl.com/444zt8h5";

export const crossCountryFaq = [
  { question: "Quando e onde acontece o evento?", answer: "A primeira edição será em 15 de novembro de 2026, no IVCL, em Campinas. Toda a programação acontece pela manhã, das 8h às 10h, no horário de São Paulo. Não haverá período da tarde." },
  { question: "Como chegar ao IVCL?", answer: "O evento acontece no IVCL, em Campinas, São Paulo. Acesse o link abaixo para abrir a localização e planejar sua chegada.", link: crossCountryDirections },
  { question: "Quais são os horários e as distâncias?", answer: [...crossCountryStartTimes, "09:45 — Premiação geral.", "10:00 — Foto geral e encerramento."].join("\n") },
  { question: "Quem pode participar e como a idade é calculada?", answer: "Atletas de até 17 anos, considerando a idade completada em 2026. A faixa de 9 anos ou menos também recebe crianças mais novas. A inscrição calcula a categoria e a distância pela data de nascimento." },
  { question: "Masculino e feminino largam juntos?", answer: "Sim. Masculino e feminino largam no mesmo horário em cada faixa etária. A classificação, a pontuação e o pódio permanecem separados por categoria individual e gênero. A categoria Sub 10 reúne atletas de 9 anos ou menos." },
  { question: "A inscrição é gratuita? Qual é o prazo?", answer: "Sim. As inscrições são gratuitas até 12 de novembro de 2026, às 23h59, no horário de São Paulo. O responsável deve preencher os dados do atleta e aceitar o regulamento e a autorização. O envio fica sujeito à conferência e confirmação da organização." },
  { question: "O responsável precisa acompanhar o atleta?", answer: "Sim. O responsável legal deve acompanhar o atleta, seguir as orientações da organização e informar condições que possam afetar sua participação segura. As orientações de acesso serão enviadas aos responsáveis." },
  { question: "Como funcionam a premiação e a pontuação?", answer: "A premiação geral acontece às 9h45. Os três primeiros de cada categoria e gênero recebem troféus e brindes 11Run. Do primeiro ao décimo lugar, a pontuação vai de 10 a 1 ponto. A classificação geral soma as edições, com pontuação dobrada na terceira edição, a final. As datas da segunda e da terceira edição serão confirmadas." },
  { question: "Haverá transmissão, fotos e resultados?", answer: "Estão previstos transmissão ao vivo pelo YouTube, fotos profissionais gratuitas após o evento e atualização da pontuação do ranking em tempo real no site." }
] as const;

export const crossCountryTerm = {
  title: "Regulamento e autorização de participação · CROSS COUNTRY IVCL 11RUN",
  clauses: [
    "Como responsável legal, autorizo a participação do atleta na primeira edição do CIRCUITO DE CROSS COUNTRY IVCL 11RUN, em 15 de novembro de 2026, no IVCL, em Campinas.",
    "Podem participar atletas de até 17 anos, considerando a idade completada em 2026. A categoria Sub 10 inclui os atletas de 9 anos ou menos. As distâncias e os horários de cada faixa etária estão descritos abaixo.",
    "A corrida acontece em percurso de CROSS COUNTRY preparado para o evento, em terreno natural. O responsável deve acompanhar o atleta, observar as orientações da organização e informar condições que possam afetar sua participação segura.",
    "As inscrições são gratuitas até 12 de novembro de 2026, às 23h59, no horário de São Paulo. A participação fica sujeita à conferência e confirmação da organização. Orientações de acesso e eventuais ajustes de horário serão comunicados aos responsáveis.",
    "A programação ocorre em período único, pela manhã, das 8h às 10h, no horário de São Paulo. Não haverá período da tarde. Masculino e feminino largam no mesmo horário em cada faixa etária, conforme a programação:",
    ...crossCountryStartTimes,
    "09:45 — Premiação geral. Classificação, pontuação e pódio permanecem separados por categoria individual e gênero.",
    "10:00 — Foto geral e encerramento do evento.",
    "Os três primeiros de cada categoria e gênero subirão ao pódio e receberão troféus e brindes 11Run. Do primeiro ao décimo lugar, a pontuação é de 10 a 1 ponto. A classificação geral soma as edições, com pontuação dobrada na edição final. As datas da segunda e da terceira edição serão confirmadas.",
    "Os dados serão usados para organizar a inscrição, conferir a categoria e entrar em contato sobre o evento, conforme a Política de Privacidade do portal."
  ]
};

// 12/11/2026 às 23h59 em São Paulo; limite exclusivo em UTC.
export function isCrossRegistrationOpen(now = Date.now()) {
  return now < Date.parse("2026-11-13T03:00:00.000Z");
}
