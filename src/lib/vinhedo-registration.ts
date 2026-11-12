// Encerramento antecipado solicitado pela organização em 12/11/2026, às 15h55 em São Paulo.
export const VINHEDO_REGISTRATION_DEADLINE = "2026-11-12T18:55:00.000Z";

export function isVinhedoRegistrationOpen(now: Date = new Date()) {
  return now.getTime() < Date.parse(VINHEDO_REGISTRATION_DEADLINE);
}
