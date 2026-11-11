import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RunAssistant } from "@/components/RunAssistant";
import { PRIMARY_EMAIL } from "@/lib/site-contact";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "11RUN - Ecossistema de corrida, base e alto rendimento",
    template: "%s | 11RUN"
  },
  description:
    "Portal oficial da 11RUN, conectando App 11Run, Onze Futuro, 11 Master, Circuito Futuro 11 e oportunidades internacionais para corredores.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://11run.com.br")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "11RUN",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://11run.com.br",
    email: PRIMARY_EMAIL
  };
  return (
    <html lang="pt-BR">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <Header />
        <main>{children}</main>
        <Footer />
        <RunAssistant />
      </body>
    </html>
  );
}
