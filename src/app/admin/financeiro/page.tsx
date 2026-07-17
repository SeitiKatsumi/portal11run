import type { Metadata } from "next";
import { AdminDataNotice } from "@/components/AdminDataNotice";
import { FinanceAdmin } from "@/components/FinanceAdmin";
import { collectAdminErrors, safeAdminData } from "@/lib/adminSafeData";
import { listFinancialRecords } from "@/lib/finance";
import { listLeads } from "@/lib/leads";
import { listSponsors } from "@/lib/sponsors";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Financeiro 11RUN",
  description: "Entradas, saídas, patrocinadores e benefícios vinculados aos atletas."
};

export default function AdminFinanceiroPage() {
  const leads = safeAdminData("cadastros aceitos", () => listLeads().filter((lead) => ["Aceitos", "Aceitas"].includes(lead.pipeline_status)), []);
  const financialRecords = safeAdminData("financeiro", () => listFinancialRecords(), []);
  const sponsors = safeAdminData("patrocinadores", () => listSponsors({ activeOnly: true }), []);
  const errors = collectAdminErrors(leads, financialRecords, sponsors);

  return (
    <>
      <AdminDataNotice errors={errors} />
      <FinanceAdmin
        initialRecords={JSON.parse(JSON.stringify(financialRecords.data))}
        leads={JSON.parse(JSON.stringify(leads.data))}
        sponsors={JSON.parse(JSON.stringify(sponsors.data))}
      />
    </>
  );
}
