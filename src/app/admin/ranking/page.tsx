import type { Metadata } from "next";
import { RankingAdmin } from "@/components/RankingAdmin";
import { listRankings } from "@/lib/rankings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Ranking 11RUN",
  description: "Gestão de ranking por prova e idade do Circuito Futuro 11."
};

export default function AdminRankingPage() {
  const rankings = listRankings();

  return <RankingAdmin initialRankings={JSON.parse(JSON.stringify(rankings))} />;
}
