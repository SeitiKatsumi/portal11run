import type { Metadata } from "next";
import { WorldAthleticsReferencePage } from "@/components/WorldAthleticsReferencePage";

export const metadata: Metadata = {
  title: "Ranking Juvenil de Uganda | 11Run",
  description: "Melhores tempos Sub-18 e Sub-20 de Uganda em provas de pista de 800 m a 5.000 m."
};

export default function UgandaRankingPage() {
  return <WorldAthleticsReferencePage scope="UG" />;
}
