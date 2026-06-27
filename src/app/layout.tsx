import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"]
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "11RUN - Ecossistema de corrida, base e alto rendimento",
    template: "%s | 11RUN"
  },
  description:
    "Portal oficial da 11RUN, conectando App 11Run, Onze Futuro, 11 Regional, Circuito Futuro 11 e oportunidades internacionais para corredores.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal11run.com.br")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={geist.variable}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
