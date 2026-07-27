export type MemberMarkChartInput = {
  event: string;
  time: string;
  date: string;
};

export function parseMemberMarkTime(value: string) {
  const normalized = value.trim().replace(",", ".");
  const parts = normalized.split(":");

  if (parts.length === 3) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    const fraction = Number(`0.${parts[2]}`);
    if (![minutes, seconds, fraction].every(Number.isFinite) || seconds >= 60) return null;
    return minutes * 60 + seconds + fraction;
  }

  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);
    if (![minutes, seconds].every(Number.isFinite) || seconds >= 60) return null;
    return minutes * 60 + seconds;
  }

  if (parts.length === 1) {
    const seconds = Number(parts[0]);
    return Number.isFinite(seconds) ? seconds : null;
  }

  return null;
}

export function buildMemberMarkChartData(marks: MemberMarkChartInput[], now = new Date()) {
  const referenceDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 11 + index, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  });
  const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 11, 1);
  const end = months.at(-1)?.end ?? now;
  const validMarks = marks
    .map((mark) => ({
      ...mark,
      is1000m: mark.event.replace(/\D/g, "") === "1000",
      seconds: parseMemberMarkTime(mark.time),
      markDate: new Date(`${mark.date}T12:00:00`),
    }))
    .filter(
      (mark) =>
        mark.is1000m &&
        mark.seconds !== null &&
        !Number.isNaN(mark.markDate.getTime()) &&
        mark.markDate >= start &&
        mark.markDate <= end,
    );
  const events = validMarks.length > 0 ? ["1000m"] : [];
  let best: number | undefined;
  const data = months.map((month) => {
    validMarks
      .filter((mark) => mark.markDate <= month.end)
      .forEach((mark) => {
        best = Math.min(best ?? Number.POSITIVE_INFINITY, mark.seconds as number);
      });
    return {
      month: month.label,
      monthKey: month.key,
      "1000m": best ?? null,
    };
  });

  return { data, events };
}
