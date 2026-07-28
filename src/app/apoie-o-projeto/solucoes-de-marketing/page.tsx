import type { Metadata } from "next";
import { MarketingSolutions } from "@/components/MarketingSolutions";

export const metadata: Metadata = {
  title: "Soluções de Marketing Esportivo para Marcas | 11Run",
  description:
    "Conecte sua marca ao público da corrida com projetos de marketing esportivo, conteúdo, mídia, tecnologia, SEO e Inteligência Artificial desenvolvidos pela 11Run e Elevenmind.",
  alternates: { canonical: "/apoie-o-projeto/solucoes-de-marketing" },
  openGraph: {
    title: "Soluções de Marketing Esportivo para Marcas | 11Run",
    description: "Esporte, conteúdo, tecnologia e dados em projetos personalizados para marcas.",
    type: "website",
    images: [{ url: "/assets/home/ayla-trofeus-hero.webp", alt: "Atleta 11Run com troféus" }]
  },
  keywords: [
    "marketing esportivo", "patrocínio esportivo", "patrocínio para corrida", "publicidade esportiva",
    "ativação de marca", "patrocínio de atletas", "conteúdo esportivo", "inteligência artificial no esporte"
  ]
};

export default function MarketingSolutionsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "11Run",
        url: "https://11run.com.br",
        logo: "https://11run.com.br/assets/logos/onzerun-menu.png"
      },
      {
        "@type": "Service",
        name: "Soluções de Marketing Esportivo 11Run",
        provider: { "@type": "Organization", name: "11Run" },
        serviceType: "Marketing esportivo, conteúdo, mídia, tecnologia, SEO e inteligência artificial",
        areaServed: "Brasil"
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: "https://11run.com.br" },
          { "@type": "ListItem", position: 2, name: "Apoie o Projeto", item: "https://11run.com.br/apoie" },
          { "@type": "ListItem", position: 3, name: "Soluções de Marketing" }
        ]
      }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <MarketingSolutions />
    </>
  );
}
