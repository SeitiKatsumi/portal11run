import { EventLanding, createEventMetadata } from "@/components/EventLanding";
import { princesinhaEvent } from "@/lib/event-content";

export const metadata = createEventMetadata(princesinhaEvent);

export default function PrincesinhaDaColinaPage() {
  return <EventLanding event={princesinhaEvent} />;
}
