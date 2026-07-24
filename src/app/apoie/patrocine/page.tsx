import type { Metadata } from "next";
import { Activity, ArrowDown, BadgeCheck, Building2, Bus, HeartPulse, Package, Plane, Shirt, Sparkles, Utensils, Wrench } from "lucide-react";
import { SponsorshipForm } from "@/components/SupportHubForms";
import styles from "../support.module.css";

export const metadata: Metadata = {
  title: "Patrocine o Projeto",
  description: "Sua marca pode apoiar o esporte de base, jovens atletas e projetos nacionais da 11RUN.",
  alternates: { canonical: "/apoie/patrocine" }
};

const forms = [
  ["Patrocínio institucional", Building2], ["Apoio financeiro", Activity], ["Patrocínio de atletas", Sparkles],
  ["Apoio com produtos", Package], ["Apoio com serviços", Wrench], ["Transporte e hospedagem", Bus],
  ["Uniformes e materiais", Shirt], ["Alimentação", Utensils], ["Saúde multidisciplinar", HeartPulse], ["Viagens e eventos", Plane]
] as const;

const benefits = ["Exposição da marca no site", "Presença em uniformes e materiais", "Divulgação em redes sociais", "Ativações em eventos", "Relatórios de impacto", "Conteúdos com atletas", "Visibilidade regional ou nacional", "Projetos personalizados"];

export default function SponsorPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}><span>Patrocínios e apoios</span><h1>Sua marca pode impulsionar a próxima geração do esporte.</h1><p>Transforme investimento em impacto esportivo, desenvolvimento humano e visibilidade conectada a histórias reais.</p><div className={styles.actions}><a href="#formulario">Quero ser patrocinador <ArrowDown size={17} /></a></div></div>
        <div className={styles.heroImage}><img src="/assets/sponsor-ayla.webp" alt="Representante 11RUN em um ambiente esportivo com troféus" /></div>
      </section>
      <section className={styles.section}><div className={styles.sectionHead}><span>Modalidades</span><h2>Uma parceria que cabe no objetivo da sua marca.</h2></div><div className={styles.useGrid}>{forms.map(([title, Icon]) => <article key={title}><Icon size={22} strokeWidth={1.45} /><strong>{title}</strong></article>)}</div></section>
      <section className={styles.section}><div className={styles.sectionHead}><span>Contrapartidas</span><h2>Impacto com clareza e presença.</h2></div><div className={styles.benefitGrid}>{benefits.map((benefit) => <article key={benefit}><BadgeCheck size={22} strokeWidth={1.45} /><strong>{benefit}</strong></article>)}</div></section>
      <section className={styles.section} id="formulario"><SponsorshipForm /></section>
    </main>
  );
}
