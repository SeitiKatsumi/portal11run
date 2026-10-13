export const onzeFuturoAgeHelp = "Cadastro permitido para atletas de 9 a 13 anos completos na data da inscrição.";

export function onzeFuturoBirthDateLimits(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((item) => item.type === type)!.value);
  const year = part("year");
  const month = part("month") - 1;
  const day = part("day");
  const yearsAgo = (years: number) => new Date(Date.UTC(
    year - years, month, Math.min(day, new Date(Date.UTC(year - years, month + 1, 0)).getUTCDate())
  ));
  const min = yearsAgo(14);
  min.setUTCDate(min.getUTCDate() + 1);
  return { min: min.toISOString().slice(0, 10), max: yearsAgo(9).toISOString().slice(0, 10), help: onzeFuturoAgeHelp };
}

export function isOnzeFuturoBirthDateEligible(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return false;
  const { min, max } = onzeFuturoBirthDateLimits(now);
  return value >= min && value <= max;
}
