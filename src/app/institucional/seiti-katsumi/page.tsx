import type { Metadata } from "next";
import SeitiTrajectory from "@/app/admin/trajetoria-seiti/page";

export const metadata: Metadata = {
  title: "Seiti Katsumi — Esporte, branding e inteligência artificial",
  description:
    "Conheça a trajetória de Seiti Katsumi entre o atletismo de alto rendimento, branding, publicidade, marketing e inteligência artificial aplicada à gestão da 11RUN.",
  alternates: { canonical: "/institucional/seiti-katsumi" },
};

export default function SeitiKatsumiPage() {
  return <SeitiTrajectory />;
}
