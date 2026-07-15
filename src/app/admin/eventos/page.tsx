import type { Metadata } from "next";
import { EventsAdmin } from "@/components/EventsAdmin";
import { listMemberEvents } from "@/lib/events";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Próximos eventos 11RUN",
  description: "Agenda de eventos vinculados aos atletas do projeto."
};

export default function AdminEventosPage() {
  const events = listMemberEvents();
  const leads = listLeads().filter((lead) => ["Aceitos", "Aceitas"].includes(lead.pipeline_status));

  return <EventsAdmin initialEvents={JSON.parse(JSON.stringify(events))} leads={JSON.parse(JSON.stringify(leads))} />;
}
