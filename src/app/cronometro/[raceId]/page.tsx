import type { Metadata } from "next";
import { CompetitionTimer } from "@/components/CompetitionTimer";

export const metadata: Metadata = {
  title: "Cronometragem da prova",
  robots: { index: false, follow: false }
};

export default async function TimingPage({ params }: { params: Promise<{ raceId: string }> }) {
  const { raceId } = await params;
  return <CompetitionTimer raceId={raceId} />;
}
