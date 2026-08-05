import type { Metadata } from "next";
import SeitiTrajectory from "@/app/admin/trajetoria-seiti/page";

export const metadata: Metadata = {
  title: "Seiti Katsumi — Esporte, branding e inteligência artificial",
  description:
    "Conheça a trajetória e a formação de Seiti Katsumi em Comunicação Social, Design Industrial, Marketing, Branding, Comunicação e Business Intelligence.",
  alternates: { canonical: "/institucional/seiti-katsumi" },
};

export default function SeitiKatsumiPage() {
  return <SeitiTrajectory />;
}
