import type { Metadata } from "next";
import { CompetitionAdmin } from "@/components/CompetitionAdmin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Competição CROSS COUNTRY | Admin 11RUN", robots: { index: false, follow: false } };

export default function CrossCountryCompetitionAdmin() {
  return <CompetitionAdmin />;
}
