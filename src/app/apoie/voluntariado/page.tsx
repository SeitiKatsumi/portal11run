import type { Metadata } from "next";
import { HeartPulse, Scale, Stethoscope, Video, Wrench, Dumbbell, Camera, Laptop, Truck, Users } from "lucide-react";
import { VolunteerForm } from "@/components/SupportHubForms";
import styles from "../support.module.css";

export const metadata: Metadata = {
  title: "Seja um Voluntário",
  description: "Doe conhecimento, atendimento ou apoio operacional para atletas e famílias da 11RUN.",
  alternates: { canonical: "/apoie/voluntariado" }
};

const areas = [["Treinamento esportivo", Dumbbell], ["Fisioterapia e saúde", HeartPulse], ["Medicina", Stethoscope], ["Comunicação e vídeo", Video], ["Fotografia", Camera], ["Tecnologia", Laptop], ["Assessoria jurídica", Scale], ["Transporte", Truck], ["Eventos", Users], ["Apoio operacional", Wrench]] as const;

export default function VolunteerPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}><span>Rede multidisciplinar</span><h1>Seu conhecimento também pode transformar trajetórias.</h1><p>Estamos formando uma rede de apoio para atletas, famílias, eventos e ações sociais. Você pode contribuir presencialmente, remotamente ou de forma híbrida.</p></div>
        <div className={styles.heroImage}><img src="/assets/volunteer-ayla.webp" alt="Representante 11RUN em uma pista de atletismo" /></div>
      </section>
      <section className={styles.section}><div className={styles.sectionHead}><span>Áreas de atuação</span><h2>Conhecimento aplicado a novos sonhos.</h2></div><div className={styles.useGrid}>{areas.map(([title, Icon]) => <article key={title}><Icon size={22} strokeWidth={1.45} /><strong>{title}</strong></article>)}</div></section>
      <section className={styles.section}><VolunteerForm /></section>
    </main>
  );
}
