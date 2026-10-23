import type { Metadata } from "next";
import { AdminDataNotice } from "@/components/AdminDataNotice";
import { EventsAdmin } from "@/components/EventsAdmin";
import { EventRegistrationsAdmin } from "@/components/EventRegistrationsAdmin";
import { collectAdminErrors, safeAdminData } from "@/lib/adminSafeData";
import { listMemberEvents } from "@/lib/events";
import { listEventRegistrations } from "@/lib/event-registrations";
import { listLeads } from "@/lib/leads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin - Eventos e inscrições 11RUN",
  description: "Inscrições gratuitas e agenda de eventos dos atletas.",
  robots: { index: false, follow: false }
};

export default function AdminEventosPage() {
  const events = safeAdminData("eventos", () => listMemberEvents(), []);
  const leads = safeAdminData("cadastros aceitos", () => listLeads().filter((lead) => ["Aceitos", "Aceitas"].includes(lead.pipeline_status)), []);
  const registrations = safeAdminData("inscrições dos eventos", () => listEventRegistrations(), []);
  const errors = collectAdminErrors(events, leads, registrations);

  return (
    <>
      <AdminDataNotice errors={errors} />
      <EventRegistrationsAdmin registrations={registrations.data} />
      <EventsAdmin initialEvents={JSON.parse(JSON.stringify(events.data))} leads={JSON.parse(JSON.stringify(leads.data))} />
    </>
  );
}
