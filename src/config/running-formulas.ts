export type TrainingZoneId = "Z1" | "Z2" | "Z3" | "Z4" | "Z5" | "Z6";

export const TEST_DISTANCES = [1000, 3000, 5000, 10000] as const;
export const PROJECTION_DISTANCES = [800, 1000, 1500, 3000, 5000, 10000] as const;
export const SEGMENT_DISTANCES = [100, 200, 300, 400, 600, 800, 1000] as const;

export const TRAINING_ZONE_CONFIG: Record<TrainingZoneId, {
  name: string; min: number; max: number; basis: "oxygenFraction" | "vVdotFraction";
  rpe: string; talk: string; purpose: string; examples: string[];
}> = {
  Z1: { name: "Recuperação", min: .55, max: .64, basis: "oxygenFraction", rpe: "1–2/10", talk: "Conversa completa", purpose: "Recuperar, aquecer e desacelerar.", examples: ["Trote regenerativo", "Aquecimento leve"] },
  Z2: { name: "Aeróbia fácil", min: .65, max: .74, basis: "oxygenFraction", rpe: "2–4/10", talk: "Frases completas", purpose: "Construir base aeróbia com controle.", examples: ["Rodagem fácil", "Contínuo leve"] },
  Z3: { name: "Aeróbia sustentada", min: .75, max: .84, basis: "oxygenFraction", rpe: "4–5/10", talk: "Frases mais curtas", purpose: "Sustentar ritmo moderado e estável.", examples: ["Contínuo moderado", "Progressivo controlado"] },
  Z4: { name: "Limiar", min: .85, max: .91, basis: "oxygenFraction", rpe: "6–7/10", talk: "Poucas palavras", purpose: "Ampliar a capacidade de sustentar esforço forte.", examples: ["Blocos de tempo run", "Intervalos de limiar"] },
  Z5: { name: "Potência aeróbia", min: .92, max: 1, basis: "oxygenFraction", rpe: "8–9/10", talk: "Palavras isoladas", purpose: "Trabalhar potência aeróbia em repetições controladas.", examples: ["Intervalos de 2 a 5 minutos", "Repetições com recuperação ativa"] },
  Z6: { name: "Velocidade e economia", min: 1.05, max: 1.2, basis: "vVdotFraction", rpe: "9–10/10", talk: "Conversa impraticável", purpose: "Estimular técnica, velocidade e economia sem corrida contínua.", examples: ["Acelerações curtas", "Repetições com recuperação ampla"] }
};
