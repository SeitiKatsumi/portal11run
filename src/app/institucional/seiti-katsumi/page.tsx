import type { Metadata } from "next";
import SeitiTrajectory from "@/app/admin/trajetoria-seiti/page";

export const metadata: Metadata = {
  title: "Seiti Katsumi — Trajetória no atletismo",
  description:
    "Conheça a trajetória esportiva de Seiti Katsumi, dos Jogos Regionais à experiência universitária no Japão e à conexão com o IVCL/Orcampi.",
  alternates: { canonical: "/institucional/seiti-katsumi" },
};

export default function SeitiKatsumiPage() {
  return <SeitiTrajectory />;
}
