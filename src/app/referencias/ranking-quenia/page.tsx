import type { Metadata } from "next";
import { WorldAthleticsReferencePage } from "@/components/WorldAthleticsReferencePage";

export const metadata: Metadata = {
  title: "Ranking Juvenil do Quênia | 11Run",
  description: "Melhores tempos Sub-18 e Sub-20 do Quênia em provas de pista de 800 m a 5.000 m."
};

export default function KenyaRankingPage() {
  return <WorldAthleticsReferencePage scope="KE" />;
}
