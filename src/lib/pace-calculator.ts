export const passageDistances = [100, 200, 400, 800, 1000, 1500, 2000, 3000, 5000, 10000, 21097.5, 42195];

export function parseClock(value: string) {
  const parts = value.trim().replace(",", ".").split(":").map(Number);
  if (!parts.length || parts.some((part) => !Number.isFinite(part) || part < 0)) return 0;
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function formatClock(totalSeconds: number, tenths = false) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "—";
  const rounded = tenths ? Math.round(totalSeconds * 10) / 10 : Math.round(totalSeconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const seconds = rounded - hours * 3600 - minutes * 60;
  const secondsText = tenths ? seconds.toFixed(1).padStart(4, "0") : String(Math.round(seconds)).padStart(2, "0");
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${secondsText}` : `${minutes}:${secondsText}`;
}

export function calculatePace(distanceMeters: number, totalSeconds: number) {
  if (distanceMeters <= 0 || totalSeconds <= 0) return null;
  const secondsPerKm = totalSeconds / (distanceMeters / 1000);
  return {
    secondsPerKm,
    secondsPerMile: secondsPerKm * 1.609344,
    speedKmh: 3600 / secondsPerKm,
    metersPerSecond: distanceMeters / totalSeconds
  };
}

export function timeAtDistance(secondsPerKm: number, meters: number) {
  return secondsPerKm * meters / 1000;
}
