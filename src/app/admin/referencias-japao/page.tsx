import type { Metadata } from "next";
import { JapanRankingsAdmin } from "@/components/JapanRankingsAdmin";
import { getJapanRankingAdminData } from "@/lib/japan-rankings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — Referências do Japão | 11Run",
  description: "Monitoramento da integração dos rankings escolares da JAAF."
};

export default function JapanReferencesAdminPage() {
  const data = getJapanRankingAdminData();
  return <JapanRankingsAdmin initialData={JSON.parse(JSON.stringify(data))} />;
}
