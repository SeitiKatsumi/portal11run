import { EventLanding, createEventMetadata } from "@/components/EventLanding";
import { finalissimaEvent } from "@/lib/event-content";

export const metadata = createEventMetadata(finalissimaEvent);

export default function FinalissimaDesafioVirtualPage() {
  return <EventLanding event={finalissimaEvent} />;
}
