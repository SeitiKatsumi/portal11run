import type { Metadata } from "next";
import { AdminPipeline } from "@/components/AdminPipeline";
import { AdminDataNotice } from "@/components/AdminDataNotice";
import { collectAdminErrors, safeAdminData } from "@/lib/adminSafeData";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "CROSS COUNTRY | Admin 11RUN", robots: { index: false, follow: false } };

export default function CrossCountryAdmin() {
  const project = "circuito-cross-country-ivcl-11run";
  const leads = safeAdminData("inscrições do CROSS COUNTRY", () => listLeads().filter((lead) => lead.project_type === project), []);
  return <><AdminDataNotice errors={collectAdminErrors(leads)} /><AdminPipeline project={project} initialLeads={JSON.parse(JSON.stringify(leads.data))} initialMemberAccounts={[]} /></>;
}
