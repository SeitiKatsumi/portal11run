import type { Metadata } from "next";
import { FinanceAdmin } from "@/components/FinanceAdmin";
import { listFinancialRecords } from "@/lib/finance";
import { listLeads } from "@/lib/leads";
import { listSponsors } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Financeiro 11RUN",
  description: "Entradas, saídas, patrocinadores e benefícios vinculados aos atletas."
};

export default function AdminFinanceiroPage() {
  const leads = listLeads().filter((lead) => ["Aceitos", "Aceitas"].includes(lead.pipeline_status));
  const financialRecords = listFinancialRecords();
  const sponsors = listSponsors({ activeOnly: true });

  return (
    <FinanceAdmin
      initialRecords={JSON.parse(JSON.stringify(financialRecords))}
      leads={JSON.parse(JSON.stringify(leads))}
      sponsors={JSON.parse(JSON.stringify(sponsors))}
    />
  );
}
