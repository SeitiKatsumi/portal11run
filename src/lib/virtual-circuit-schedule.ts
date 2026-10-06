export const CIRCUIT_EDITION_START = "2026-08-01";
export const CIRCUIT_EDITION_END = "2026-11-13";
export const CIRCUIT_REGULATIONS_VERSION = "1.4-2026";
export const CIRCUIT_AWARD_DELIVERY = "O ranking encerra em 13 de novembro de 2026. A premiação presencial será no mesmo dia, no IVCL, logo após a finalíssima. Quem não estiver presente receberá os prêmios posteriormente pelos Correios.";

export type CircuitRankingPeriod = "monthly" | "bimonthly" | "absolute";
export type CircuitPrize =
  | "voucher"
  | "shoes"
  | "shirt"
  | "trophy"
  | "physical-certificate"
  | "digital-certificate"
  | "future-opportunity";

export type CircuitPeriodDefinition = {
  id: string;
  label: string;
  shortLabel: string;
  start: string;
  end: string;
};

export const CIRCUIT_MONTHS: readonly CircuitPeriodDefinition[] = [
  { id: "2026-08", label: "Agosto de 2026", shortLabel: "01/08 a 31/08", start: "2026-08-01", end: "2026-08-31" },
  { id: "2026-09", label: "Setembro de 2026", shortLabel: "01/09 a 30/09", start: "2026-09-01", end: "2026-09-30" },
  { id: "2026-10", label: "Outubro de 2026", shortLabel: "01/10 a 31/10", start: "2026-10-01", end: "2026-10-31" },
  { id: "2026-11", label: "Novembro de 2026", shortLabel: "01/11 a 13/11", start: "2026-11-01", end: "2026-11-13" }
];

export const CIRCUIT_BIMONTHS: readonly CircuitPeriodDefinition[] = [
  { id: "2026-08-01|2026-09-30", label: "1º bimestre · agosto e setembro", shortLabel: "01/08 a 30/09", start: "2026-08-01", end: "2026-09-30" },
  { id: "2026-10-01|2026-11-13", label: "2º bimestre · outubro e novembro", shortLabel: "01/10 a 13/11", start: "2026-10-01", end: "2026-11-13" }
];

export const CIRCUIT_ABSOLUTE: CircuitPeriodDefinition = {
  id: "2026-edition",
  label: "Ranking absoluto da edição 2026",
  shortLabel: "01/08 a 13/11",
  start: CIRCUIT_EDITION_START,
  end: CIRCUIT_EDITION_END
};

export const CIRCUIT_AWARD_COPY = {
  monthly: ["Camiseta 11Run para o primeiro de cada categoria."],
  bimonthly: ["Camiseta 11Run para os três primeiros de cada categoria."],
  absolute: [
    "Vale-compras de R$ 500,00 na Bahia Esportes para o campeão absoluto de cada categoria e gênero. Não há pagamento em dinheiro.",
    "Um par de tênis exclusivamente para o campeão absoluto de cada categoria e gênero.",
    "Camiseta 11Run para os dez primeiros de cada categoria.",
    "Troféu 11Run para os três primeiros de cada categoria.",
    "Certificado físico para os cinco primeiros de cada categoria.",
    "Certificado digital para todos os concluintes com marca validada.",
    "Oportunidade de avaliação para o 11Run Futuro nas categorias Sub 10, Sub 11 e Sub 12."
  ]
} as const;

export function circuitPeriodStatus(period: CircuitPeriodDefinition, today = todayInSaoPaulo()) {
  if (today < period.start) return "Próximo";
  if (today > period.end) return "Encerrado";
  return "Em andamento";
}

export function circuitPrizesForPosition(period: CircuitRankingPeriod, position: number, categoryAge: number) {
  const prizes: CircuitPrize[] = [];
  if (period === "monthly") {
    if (position === 1) prizes.push("shirt");
    return prizes;
  }
  if (period === "bimonthly") {
    if (position <= 3) prizes.push("shirt");
    return prizes;
  }
  if (position === 1) prizes.push("voucher", "shoes");
  if (position <= 10) prizes.push("shirt");
  if (position <= 3) prizes.push("trophy");
  if (position <= 5) prizes.push("physical-certificate");
  prizes.push("digital-certificate");
  if (categoryAge >= 9 && categoryAge <= 11) prizes.push("future-opportunity");
  return prizes;
}

function todayInSaoPaulo() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export const CIRCUIT_TRACK_RULE = "Na pista oficial de 400 m, os 1.000 m devem ser medidos pelas marcações oficiais: duas voltas completas e mais meia volta (400 + 400 + 200 m), seguindo a linha de medição da raia 1. Não serão aceitas distâncias medidas por GPS de relógio, celular ou aplicativo para comprovar testes em pista, pois podem apresentar erro. O vídeo deve ser integral, contínuo e sem cortes, mostrando largada, percurso e chegada.";
export const CIRCUIT_PRIZE_EVIDENCE_RULE = "Para receber qualquer premiação bimestral ou premiação em vale-compras, é imprescindível comprovar a marca em teste na pista oficial de 400 m, com vídeo na íntegra, contínuo e sem cortes, ou em competição oficial, com resultado oficial verificável. Marca em percurso aberto ou distância comprovada apenas por GPS não atende a essa exigência. A entrega depende da homologação da comissão.";
