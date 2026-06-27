import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "11RUN - Ecossistema de corrida, base e alto rendimento",
    template: "%s | 11RUN"
  },
  description:
    "Portal oficial da 11RUN, conectando tecnologia, formacao de base, alto rendimento, circuito infantil e oportunidades internacionais para corredores.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal11run.com.br")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${space.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
