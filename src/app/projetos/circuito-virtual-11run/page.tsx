import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Medal, Route, ShieldCheck, Trophy, Users } from "lucide-react";
import { CircuitRegistration } from "@/components/CircuitRegistration";
import { CircuitRanking } from "@/components/CircuitRanking";
import { getCircuitEdition } from "@/lib/virtual-circuit";
import styles from "./virtual-circuit.module.css";

export const metadata: Metadata = {
  title: "Circuito Virtual 11Run | Desafio Nacional de 1.000 Metros",
  description:
    "Crianças brasileiras de 9 a 13 anos, residentes no Brasil ou no exterior, podem registrar sua marca nos 1.000 metros e participar do ranking.",
  alternates: { canonical: "/projetos/circuito-virtual-11run" },
  openGraph: {
    title: "Desafio Virtual 1km 11Run Futuro",
    description: "Primeira competição virtual para atletas de 9 a 13 anos.",
    images: ["/assets/circuito-virtual/hero-atletas-2026.webp"]
  }
};

const modes = [
  ["Competição oficial", "Resultado público emitido por federação ou organização esportiva.", Trophy],
  ["Pista oficial de 400m", "Duas voltas completas e mais 200 metros, com vídeo público.", Route],
  ["Percurso aberto", "Registro no Strava, vídeo público e análise de distância e altimetria.", MapPin]
] as const;

export default function VirtualCircuitPage() {
  const edition = getCircuitEdition();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: edition.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer }
    }))
  };

  return (
    <>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Circuito Virtual 11Run</span>
            <h1>Desafio Virtual 1km 11Run Futuro</h1>
            <p className={styles.lead}>Para atletas brasileiros de 9 a 13 anos, residentes no Brasil ou no exterior.</p>
            <p>Corra 1.000 metros, registre sua atividade e participe de um ranking nacional criado para incentivar e descobrir novos talentos.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#inscricao">Registrar atividade</a>
              <a className={styles.secondaryButton} href="#ranking">Ver ranking nacional</a>
            </div>
            <div className={styles.quickFacts}>
              <span><Clock3 size={17} /> 1 jul — 15 dez 2026</span>
              <span><ShieldCheck size={17} /> Participação gratuita</span>
              <span><Users size={17} /> Exclusivo para brasileiros</span>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img
              src={edition.hero_image || "/assets/circuito-virtual/hero-atletas-2026.webp"}
              alt="Três jovens atletas brasileiros correndo em provas de rua"
            />
            <div><strong>1.000 m</strong><span>de qualquer cidade do Brasil</span></div>
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.eyebrow}>Uma iniciativa nacional</span>
          <div className={styles.splitHeading}>
            <h2>Talentos mais perto de novas oportunidades.</h2>
            <div>
              <p>O Brasil possui milhares de crianças apaixonadas pela corrida, mas muitas vivem longe de pistas, competições e projetos de desenvolvimento.</p>
              <p>O Circuito Virtual 11Run nasceu para diminuir essa distância, incentivar cada evolução e revelar atletas que talvez ainda não tenham sido vistos.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.eyebrow}>Como participar</span>
          <h2>Quatro passos. Uma marca que pode abrir caminhos.</h2>
          <div className={styles.steps}>
            {[
              ["01", "Faça seu teste", "Corra 1.000 metros em competição, pista ou percurso aberto."],
              ["02", "Envie as informações", "Cadastre o atleta e anexe os links ou documentos necessários."],
              ["03", "Aguarde a validação", "A comissão 11Run confere a marca e pode solicitar correções."],
              ["04", "Entre no ranking", "A melhor marca aprovada aparece na categoria correspondente."]
            ].map(([number, title, text]) => (
              <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.eyebrow}>Modalidades de comprovação</span>
          <h2>Uma competição que chega onde a pista ainda não chegou.</h2>
          <div className={styles.modeGrid}>
            {modes.map(([title, text, Icon]) => (
              <article key={title}><Icon size={25} /><h3>{title}</h3><p>{text}</p><CheckCircle2 size={18} /></article>
            ))}
          </div>
        </section>

        <section className={`${styles.section} ${styles.awards}`}>
          <div>
            <span className={styles.eyebrow}>Muito mais que um ranking</span>
            <h2>Premiações para celebrar coragem e evolução.</h2>
          </div>
          <div className={styles.awardGrid}>
            <article>
              <CalendarDays />
              <span>Mensal</span>
              <h3>Melhor marca de cada categoria</h3>
              <ul>
                <li>Camiseta 11Run para a melhor marca mensal de cada categoria.</li>
              </ul>
            </article>
            <article>
              <Trophy />
              <span>Trimestral · 2 ciclos</span>
              <h3>01/07 a 30/09 e 01/10 a 15/12</h3>
              <ul>
                <li>Tênis para o primeiro de cada categoria.</li>
                <li>Camiseta 11Run para os três primeiros de cada categoria.</li>
              </ul>
            </article>
            <article className={styles.finalAward}>
              <Medal />
              <span>Final da edição 2026</span>
              <h3>Premiação completa por categoria</h3>
              <ul>
                <li><strong>R$ 500,00</strong> para o líder de cada categoria.</li>
                <li>Tênis para o primeiro de cada categoria.</li>
                <li>Camiseta 11Run para os dez primeiros de cada categoria.</li>
                <li>Troféu 11Run.</li>
                <li>Oportunidade de entrar para o 11Run Futuro, exclusiva para atletas de 9, 10 e 11 anos.</li>
              </ul>
            </article>
          </div>
          <div className={styles.futureCallout}>
            <div><strong>Oportunidade 11Run Futuro</strong><p>Na premiação final, atletas de 9, 10 e 11 anos poderão receber a oportunidade de entrar para o projeto.</p></div>
            <Link href="/onze-futuro">Conheça o 11Run Futuro</Link>
          </div>
        </section>

        <section className={styles.section} id="ranking">
          <CircuitRanking />
        </section>

        <section className={styles.section} id="inscricao">
          <CircuitRegistration startDate={edition.start_date} endDate={edition.end_date} />
        </section>

        <section className={styles.section} id="regulamento">
          <span className={styles.eyebrow}>Regulamento oficial · versão {edition.regulations_version}</span>
          <h2>Regras claras para uma disputa justa.</h2>
          <div className={styles.accordion}>
            {edition.regulations.map(([title, text]) => <details key={title}><summary>{title}</summary><p>{text}</p></details>)}
          </div>
        </section>

        <section className={styles.section}>
          <span className={styles.eyebrow}>Perguntas frequentes</span>
          <h2>O que sua família precisa saber.</h2>
          <div className={styles.accordion}>
            {edition.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
          </div>
        </section>

        <section className={styles.finalCta}>
          <div><span className={styles.eyebrow}>Seu 1 km começa aqui</span><h2>Registre uma marca. Acompanhe uma evolução.</h2></div>
          <a className={styles.primaryButton} href="#inscricao">Registrar atividade</a>
        </section>
      </div>
      <a className={styles.mobileCta} href="#inscricao">Registrar atividade</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
