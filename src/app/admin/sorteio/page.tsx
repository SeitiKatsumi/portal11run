import type { Metadata } from "next";
import { RaffleAdmin } from "@/components/RaffleAdmin";
import { getRaffleStats, listRafflePrizes } from "@/lib/raffle";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sorteio | Admin 11RUN", robots: { index: false, follow: false } };

export default function AdminRafflePage() {
  return <RaffleAdmin initialPrizes={listRafflePrizes()} initialStats={getRaffleStats()} />;
}
