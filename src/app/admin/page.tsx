import type { Metadata } from "next";
import { AdminPipeline } from "@/components/AdminPipeline";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Cadastros 11RUN",
  description: "Painel administrativo para pipeline de cadastros do portal 11RUN."
};

export default function AdminPage() {
  const leads = listLeads();

  return (
    <div className="admin-page">
      <AdminPipeline initialLeads={JSON.parse(JSON.stringify(leads))} />
    </div>
  );
}
