import type { Metadata } from "next";
import { FinanceAdmin } from "@/components/FinanceAdmin";
import { listFinancialRecords } from "@/lib/finance";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Financeiro 11RUN",
  description: "Entradas, saídas, patrocinadores e benefícios vinculados aos atletas."
};

export default function AdminFinanceiroPage() {
  const leads = listLeads();
  const financialRecords = listFinancialRecords();

  return <FinanceAdmin initialRecords={JSON.parse(JSON.stringify(financialRecords))} leads={JSON.parse(JSON.stringify(leads))} />;
}
