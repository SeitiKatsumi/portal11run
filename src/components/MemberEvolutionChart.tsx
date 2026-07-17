type Mark = {
  event?: string | null;
  time?: string | null;
  date?: string | null;
};

function isThousandMeters(event?: string | null) {
  const normalized = String(event ?? "")
    .trim()
    .toLowerCase()
    .replaceAll(" ", "");

  return normalized === "1000" || normalized === "1000m" || normalized === "1.000m";
}

function parseTime(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .replace(",", ".")
    .replace(/[^\d:.]/g, "");

  if (!normalized) return null;
  const parts = normalized.split(":");
  if (parts.some((part) => part === "" || Number.isNaN(Number(part)))) return null;

  return parts.reduce((total, part) => total * 60 + Number(part), 0);
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${minutes}:${remainder.toFixed(2).padStart(5, "0")}`;
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

export function MemberEvolutionChart({ marks }: { marks: Mark[] }) {
  const points = marks
    .filter((mark) => isThousandMeters(mark.event))
    .map((mark) => ({ date: mark.date ?? "", seconds: parseTime(mark.time) }))
    .filter((point): point is { date: string; seconds: number } => point.seconds !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (points.length === 0) {
    return (
      <div className="member-evolution-chart empty">
        <span className="eyebrow">evolução</span>
        <h3>1000 m</h3>
        <p>O gráfico aparecerá quando a primeira marca de 1000 m for enviada.</p>
      </div>
    );
  }

  const width = 680;
  const height = 190;
  const paddingX = 36;
  const paddingY = 32;
  const minimum = Math.min(...points.map((point) => point.seconds));
  const maximum = Math.max(...points.map((point) => point.seconds));
  const range = Math.max(maximum - minimum, 1);
  const toX = (index: number) =>
    points.length === 1
      ? width / 2
      : paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
  const toY = (seconds: number) =>
    paddingY + ((seconds - minimum) / range) * (height - paddingY * 2);
  const polyline = points.map((point, index) => `${toX(index)},${toY(point.seconds)}`).join(" ");
  const latest = points.at(-1)!;

  return (
    <div className="member-evolution-chart">
      <header>
        <div>
          <span className="eyebrow">evolução</span>
          <h3>1000 m</h3>
        </div>
        <strong>Melhor: {formatTime(minimum)}</strong>
      </header>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de evolução das marcas de 1000 metros">
        {[paddingY, height / 2, height - paddingY].map((y) => (
          <line className="chart-gridline" key={y} x1={paddingX} x2={width - paddingX} y1={y} y2={y} />
        ))}
        <polyline className="chart-line" points={polyline} />
        {points.map((point, index) => (
          <g key={`${point.date}-${index}`}>
            <circle className="chart-point" cx={toX(index)} cy={toY(point.seconds)} r="4" />
            <text x={toX(index)} y={height - 8} textAnchor="middle">
              {formatDate(point.date)}
            </text>
          </g>
        ))}
      </svg>
      <p>{points.length} marca(s) registrada(s). Última: {formatTime(latest.seconds)}.</p>
    </div>
  );
}
