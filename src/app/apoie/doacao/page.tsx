import type { Metadata } from "next";
import { DonationForm } from "@/components/SupportHubForms";
import { getSupportHubSettings } from "@/lib/support-hub";
import styles from "../support.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Faça uma Doação",
  description: "Doe via PIX para materiais, viagens, inscrições e oportunidades de atletas da 11RUN.",
  alternates: { canonical: "/apoie/doacao" }
};

export default function DonationPage() {
  const settings = getSupportHubSettings();
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}><span>Doação direta e transparente</span><h1>Um pequeno gesto pode construir um grande futuro.</h1><p>Qualquer valor contribui com materiais, transporte, inscrições, alimentação, estrutura e oportunidades para os atletas. O pagamento é feito diretamente por PIX.</p></div>
        <div className={styles.heroImage}><img src="/assets/donation-young-athletes.webp" alt="Três jovens atletas reunidas em um campo de treinamento" /></div>
      </section>
      <section className={styles.section}><DonationForm settings={settings} /></section>
    </main>
  );
}
