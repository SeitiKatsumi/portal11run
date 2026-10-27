// O prazo inclui todo o dia 02/11 no horário de Brasília (UTC-3).
export const VINHEDO_REGISTRATION_DEADLINE = "2026-11-03T03:00:00.000Z";

export function isVinhedoRegistrationOpen(now: Date = new Date()) {
  return now.getTime() < Date.parse(VINHEDO_REGISTRATION_DEADLINE);
}
