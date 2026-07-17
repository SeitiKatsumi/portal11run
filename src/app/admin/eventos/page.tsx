import type { Metadata } from "next";
import { AdminDataNotice } from "@/components/AdminDataNotice";
import { EventsAdmin } from "@/components/EventsAdmin";
import { collectAdminErrors, safeAdminData } from "@/lib/adminSafeData";
import { listMemberEvents } from "@/lib/events";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Próximos eventos 11RUN",
  description: "Agenda de eventos vinculados aos atletas do projeto."
};

export default function AdminEventosPage() {
  const events = safeAdminData("eventos", () => listMemberEvents(), []);
  const leads = safeAdminData("cadastros aceitos", () => listLeads().filter((lead) => ["Aceitos", "Aceitas"].includes(lead.pipeline_status)), []);
  const errors = collectAdminErrors(events, leads);

  return (
    <>
      <AdminDataNotice errors={errors} />
      <EventsAdmin initialEvents={JSON.parse(JSON.stringify(events.data))} leads={JSON.parse(JSON.stringify(leads.data))} />
    </>
  );
}
