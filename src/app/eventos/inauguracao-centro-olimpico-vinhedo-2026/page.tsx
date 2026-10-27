import { createEventMetadata } from "@/components/EventLanding";
import { VinhedoLanding } from "@/components/VinhedoLanding";
import { vinhedoEvent } from "@/lib/event-content";

export const metadata = {
  ...createEventMetadata(vinhedoEvent),
  description: `${vinhedoEvent.description} ${vinhedoEvent.dateLabel}, ${vinhedoEvent.timeLabel.toLowerCase()}. Inscrições gratuitas até 02/11/2026.`
};
export const dynamic = "force-dynamic";

export default function CentroOlimpicoVinhedoPage() {
  return <VinhedoLanding event={vinhedoEvent} />;
}
