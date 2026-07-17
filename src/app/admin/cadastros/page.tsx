import type { Metadata } from "next";
import { AdminDataNotice } from "@/components/AdminDataNotice";
import { AdminPipeline } from "@/components/AdminPipeline";
import { collectAdminErrors, safeAdminData } from "@/lib/adminSafeData";
import { listLeads } from "@/lib/leads";
import { listMemberAccounts } from "@/lib/members";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Cadastros 11RUN",
  description: "Pipeline de cadastros e liberação de acesso dos atletas 11RUN."
};

export default function AdminCadastrosPage() {
  const leads = safeAdminData("cadastros", () => listLeads(), []);
  const memberAccounts = safeAdminData("acessos de membros", () => listMemberAccounts(), []);
  const errors = collectAdminErrors(leads, memberAccounts);

  return (
    <>
      <AdminDataNotice errors={errors} />
      <AdminPipeline
        initialLeads={JSON.parse(JSON.stringify(leads.data))}
        initialMemberAccounts={JSON.parse(JSON.stringify(memberAccounts.data))}
      />
    </>
  );
}
