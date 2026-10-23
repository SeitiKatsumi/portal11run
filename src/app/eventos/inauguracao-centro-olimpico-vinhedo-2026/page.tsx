import { EventLanding, createEventMetadata } from "@/components/EventLanding";
import { vinhedoEvent } from "@/lib/event-content";

export const metadata = createEventMetadata(vinhedoEvent);

export default function CentroOlimpicoVinhedoPage() {
  return <EventLanding event={vinhedoEvent} />;
}
