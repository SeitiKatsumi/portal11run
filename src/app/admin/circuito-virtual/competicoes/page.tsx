import type { Metadata } from "next";
import { VirtualCompetitionManager } from "@/components/VirtualCompetitionManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Competições do Desafio Virtual | Admin 11RUN", robots: { index: false, follow: false } };

export default function VirtualCompetitionsPage() {
  return <VirtualCompetitionManager />;
}
