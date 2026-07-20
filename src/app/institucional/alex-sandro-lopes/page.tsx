import type { Metadata } from "next";
import { AlexProfileExperience } from "@/components/AlexProfileExperience";

export const metadata: Metadata = {
  title: "Alex Sandro Lopes — Treinador Conselheiro",
  description:
    "Conheça a trajetória, a formação e os resultados de Alex Sandro Lopes, treinador conselheiro do Projeto 11RUN e coordenador de performance do IVCL/Orcampi.",
  alternates: { canonical: "/institucional/alex-sandro-lopes" },
  openGraph: {
    title: "Alex Sandro Lopes | Projeto 11RUN",
    description:
      "Método, presença e resultados que atravessam gerações no atletismo brasileiro.",
    url: "/institucional/alex-sandro-lopes",
    type: "profile",
    images: [{ url: "/assets/alex-lopes/hero-parceria.webp", width: 709, height: 945, alt: "Alex Sandro Lopes em ambiente de treinamento" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Alex Sandro Lopes | Projeto 11RUN",
    description: "Treinador conselheiro, formador de atletas e referência em alto rendimento.",
    images: ["/assets/alex-lopes/hero-parceria.webp"],
  },
};

export default function AlexSandroLopesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Alex Sandro de Jesus Lopes",
    jobTitle: "Treinador Conselheiro do Projeto 11RUN",
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Universidade de São Paulo" },
      { "@type": "CollegeOrUniversity", name: "Universidade Federal de São Paulo" },
    ],
    affiliation: [
      { "@type": "Organization", name: "IVCL/Orcampi Unimed" },
      { "@type": "Organization", name: "Instituto Vanderlei Cordeiro de Lima" },
      { "@type": "Organization", name: "Projeto 11RUN" },
    ],
    knowsAbout: ["Atletismo", "Meio-fundo", "Fundo", "Marcha atlética", "Alto rendimento"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <AlexProfileExperience />
    </>
  );
}
