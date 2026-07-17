import type { Metadata } from "next";
import { AdminDataNotice } from "@/components/AdminDataNotice";
import { RankingAdmin } from "@/components/RankingAdmin";
import { safeAdminData } from "@/lib/adminSafeData";
import { listRankings } from "@/lib/rankings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Ranking 11RUN",
  description: "Gestão de ranking por prova e idade do Circuito Futuro 11."
};

export default function AdminRankingPage() {
  const rankings = safeAdminData("ranking", () => listRankings(), []);

  return (
    <>
      <AdminDataNotice errors={rankings.error ? [rankings.error] : []} />
      <RankingAdmin initialRankings={JSON.parse(JSON.stringify(rankings.data))} />
    </>
  );
}
