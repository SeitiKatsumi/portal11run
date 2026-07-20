export const memberMarkEvents = ["800m", "1000m", "1500m", "2000m", "3000m", "5000m"] as const;

export function normalizeMemberMarkEvent(value: string) {
  const compact = value.toLowerCase().replace(/[.\s]/g, "");
  const meters = compact.endsWith("km")
    ? `${Number.parseFloat(compact) * 1000}m`
    : compact.endsWith("m")
      ? compact
      : `${compact}m`;
  return memberMarkEvents.find((event) => event === meters) ?? null;
}

export function formatMemberMarkEvent(value: string) {
  const normalized = normalizeMemberMarkEvent(value) ?? value;
  const meters = Number.parseInt(normalized, 10);
  return Number.isFinite(meters) ? `${new Intl.NumberFormat("pt-BR").format(meters)} m` : value;
}
