import type { Metadata } from "next";
import { AdminPipeline } from "@/components/AdminPipeline";
import { listLeads } from "@/lib/leads";
import { listMemberAccounts } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Cadastros 11RUN",
  description: "Pipeline de cadastros e liberação de acesso dos atletas 11RUN."
};

export default function AdminCadastrosPage() {
  const leads = listLeads();
  const memberAccounts = listMemberAccounts();

  return <AdminPipeline initialLeads={JSON.parse(JSON.stringify(leads))} initialMemberAccounts={JSON.parse(JSON.stringify(memberAccounts))} />;
}
