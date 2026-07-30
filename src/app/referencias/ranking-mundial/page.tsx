import type { Metadata } from "next";
import { WorldAthleticsReferencePage } from "@/components/WorldAthleticsReferencePage";

export const metadata: Metadata = {
  title: "Ranking Mundial World Athletics | 11Run",
  description: "Melhores tempos mundiais Sub-18, Sub-20 e adultos em provas de pista de 800 m a 10.000 m."
};

export default function WorldRankingPage() {
  return <WorldAthleticsReferencePage scope="WORLD" />;
}
