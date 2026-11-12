import type { Metadata } from "next";
import { RaffleWheel } from "@/components/RaffleWheel";
import { getRaffleStats } from "@/lib/raffle";
import styles from "./sorteio.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Roleta de prêmios",
  description: "Digite o número da sua pulseira e descubra sua surpresa na roleta 11RUN."
};

export default function RafflePage() {
  return <div className={styles.page} id="raffle-page"><RaffleWheel initialStats={getRaffleStats()} /></div>;
}
