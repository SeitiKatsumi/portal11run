import type { Metadata } from "next";
import { CircuitAdmin } from "@/components/CircuitAdmin";
import { CircuitEditionSettings } from "@/components/CircuitEditionSettings";
import { getCircuitAdminDashboard, getCircuitEdition, listCircuitAdminSubmissions } from "@/lib/virtual-circuit";

export const metadata: Metadata = { title: "Circuito Virtual | Admin 11RUN", robots: { index: false, follow: false } };

export default function CircuitAdminPage() {
  const edition = getCircuitEdition();
  return <>
    <CircuitAdmin initialMetrics={getCircuitAdminDashboard()} initialSubmissions={listCircuitAdminSubmissions()} />
    <CircuitEditionSettings initialEdition={{
      start_date: edition.start_date,
      end_date: edition.end_date,
      hero_image: edition.hero_image,
      settings: edition.settings,
      regulations: edition.regulations,
      faq: edition.faq
    }} />
  </>;
}
