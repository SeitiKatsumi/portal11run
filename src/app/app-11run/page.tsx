import type { Metadata } from "next";
import { AppPerformanceLanding } from "@/components/AppPerformanceLanding";

export const metadata: Metadata = {
  title: "11RUN AI Performance OS | IA para Corrida e Performance",
  description:
    "Conheça o 11RUN AI Performance OS, plataforma de inteligência esportiva com IA para corrida, análise de provas, treino, recuperação, respiração neural, exames, wearables, treinadores, pais e equipes.",
  keywords: [
    "IA para corrida",
    "aplicativo de corrida com IA",
    "análise de provas com IA",
    "performance esportiva com IA",
    "treino de corrida inteligente",
    "inteligência esportiva para corredores",
    "app para treinadores de corrida",
    "análise Strava com IA",
    "análise Garmin com IA",
    "neuromodulação respiratória esportiva",
    "dashboard preditivo corrida",
    "carga de treino inteligente",
    "11RUN app",
    "11RUN AI Performance OS"
  ]
};

export default function Page() {
  return <AppPerformanceLanding />;
}
