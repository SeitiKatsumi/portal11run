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

export const crossCountryTerm = {
  title: "Autorização de participação · CROSS COUNTRY IVCL 11RUN",
  clauses: [
    "Como responsável legal, autorizo a participação do atleta na primeira edição do CIRCUITO DE CROSS COUNTRY IVCL 11RUN, em 15 de novembro de 2026, no IVCL, em Campinas.",
    "As categorias consideram a idade completada em 2026: 16 e 17 anos, 4 km; 14 e 15 anos, 3 km; 12 e 13 anos, 2 km; 10 e 11 anos, 1 km; 9 anos ou menos, 1 km. A categoria Sub 10 inclui os atletas de 9 anos ou menos. Há classificação feminina e masculina em cada categoria.",
    "A corrida acontece em percurso de CROSS COUNTRY preparado para o evento, em terreno natural. O responsável deve acompanhar o atleta, observar as orientações da organização e informar condições que possam afetar sua participação segura.",
    "As inscrições são gratuitas e encerram-se ao fim do dia 12 de novembro de 2026, no horário de São Paulo. A participação fica sujeita à conferência e confirmação da organização. Orientações de acesso, baterias e eventuais ajustes de horário serão comunicados aos responsáveis. O evento acontece em período único, das 8h às 10h, com largadas masculinas e femininas no mesmo horário em cada faixa etária: 16 e 17 anos às 8h; 14 e 15 anos às 8h40; 12 e 13 anos às 9h; 10 e 11 anos às 9h20; 9 anos ou menos às 9h35. Premiação geral às 9h45; foto geral e encerramento às 10h. Classificação e premiação permanecem separadas por categoria e gênero.",
    "Os três primeiros de cada categoria e gênero subirão ao pódio e receberão troféus e brindes 11Run. Do primeiro ao décimo lugar, a pontuação é de 10 a 1 ponto. A classificação geral soma as edições, com pontuação dobrada na edição final. As datas da segunda e da terceira edição serão confirmadas.",
    "Os dados serão usados para organizar a inscrição, conferir a categoria e entrar em contato sobre o evento, conforme a Política de Privacidade do portal."
  ]
};

// 12/11/2026 às 23h59 em São Paulo; limite exclusivo em UTC.
export function isCrossRegistrationOpen(now = Date.now()) {
  return now < Date.parse("2026-11-13T03:00:00.000Z");
}
