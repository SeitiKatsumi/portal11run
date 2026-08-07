import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Gauge, Route, Timer } from "lucide-react";
import { PaceCalculator } from "@/components/PaceCalculator";
import styles from "./pace.module.css";

export const metadata: Metadata = { title: "Calculadora de Pace | 11Run", description: "Converta tempo, pace e velocidade e calcule passagens por distância e por volta na pista." };

export default function PaceCalculatorPage() {
  return <main className={styles.page}>
    <nav className={styles.breadcrumb}><Link href="/">Início</Link><span>/</span><span>Referências</span><span>/</span><span>Calculadoras</span><span>/</span><strong>Calculadora de Pace</strong></nav>
    <section className={styles.hero}><div><span className={styles.eyebrow}><Calculator size={15}/> Ferramentas 11RUN</span><h1>Seu objetivo,<br/><em>passagem por passagem.</em></h1><p>Converta tempo, ritmo e velocidade. Planeje cada 100 m, quilômetro e volta para entender exatamente o esforço necessário até a chegada.</p></div><aside><Timer/><strong>15:00</strong><span>5.000 m</span><i/><Gauge/><strong>3:00/km</strong><span>72 s por volta</span></aside></section>
    <PaceCalculator/>
    <section className={styles.guide}><span className={styles.eyebrow}>Como interpretar</span><h2>Referência para planejar.<br/>Não uma obrigação para competir.</h2><div><article><Timer/><strong>Tempo acumulado</strong><p>É o que o cronômetro deve mostrar ao cruzar cada marca.</p></article><article><Route/><strong>Parcial por volta</strong><p>Ajuda treinador e atleta a acompanhar o ritmo em pista.</p></article><article><Gauge/><strong>Ritmo médio</strong><p>Uma média matemática; a estratégia real pode prever variações.</p></article></div></section>
  </main>;
}
