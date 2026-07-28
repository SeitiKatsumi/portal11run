import type { Metadata } from "next";
import { BrandingManual } from "@/components/BrandingManual";

export const metadata: Metadata = {
  title: "Branding 11Run | Manual oficial da marca",
  description: "Manual oficial da marca 11Run: assinaturas, paleta, tipografia, aplicações, downloads e solicitação de autorização.",
  alternates: { canonical: "/institucional/branding" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Branding 11Run | Manual oficial da marca",
    description: "Diretrizes, arquivos oficiais e solicitação de autorização para uso da marca 11Run.",
    type: "website"
  }
};

export default function BrandingPage() {
  return <BrandingManual />;
}
