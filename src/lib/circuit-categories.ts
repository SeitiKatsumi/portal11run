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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return undefined;
  const date = new Date(`${birthDate}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate) return undefined;
  return circuitCategories.find((item) => item.age === year - Number(birthDate.slice(0, 4)));
}

export const crossCountryTerm = {
  title: "Autorização de participação · Cross Country IVCL 11Run",
  clauses: [
    "Como responsável legal, autorizo a participação do atleta na primeira edição do Circuito de Cross Country IVCL 11Run, em 15 de novembro de 2026, no IVCL, em Campinas.",
    "As categorias consideram a idade completada em 2026: Sub 10 e Sub 11, 800 m; Sub 12 e Sub 13, 1.000 m; Sub 14, 1.500 m; Sub 15 e Sub 16, 2.000 m; Sub 17 e Sub 18, 3.000 m. Há classificação feminina e masculina em cada categoria.",
    "A corrida acontece em percurso de cross country preparado para o evento, em terreno natural. O responsável deve acompanhar o atleta, observar as orientações da organização e informar condições que possam afetar sua participação segura.",
    "Esta solicitação de inscrição fica sujeita à conferência e confirmação da organização. Valores, orientações de acesso, baterias e eventuais ajustes de horário serão comunicados aos responsáveis. O horário dos 1.500 m será confirmado.",
    "Serão premiados os cinco primeiros de cada categoria e gênero. Do primeiro ao décimo lugar, a pontuação é de 10 a 1 ponto. A classificação geral soma as edições, com pontuação dobrada na edição final. As datas da segunda e da terceira edição serão confirmadas.",
    "Os dados serão usados para organizar a inscrição, conferir a categoria e entrar em contato sobre o evento, conforme a Política de Privacidade do portal."
  ]
};
