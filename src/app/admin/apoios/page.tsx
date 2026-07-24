import type { Metadata } from "next";
import { SupportHubAdmin } from "@/components/SupportHubAdmin";
import { getSupportHubSettings, listSupportHubRecords, supportDashboard } from "@/lib/support-hub";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Patrocínios e Apoios | Admin 11RUN", robots: { index: false, follow: false } };

export default function SupportHubAdminPage() {
  return (
    <SupportHubAdmin
      initialRecords={listSupportHubRecords()}
      dashboard={supportDashboard()}
      initialSettings={getSupportHubSettings()}
    />
  );
}
