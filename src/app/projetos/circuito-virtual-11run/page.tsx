import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Medal, Route, ShieldCheck, Trophy, Users } from "lucide-react";
import { CircuitRegistration } from "@/components/CircuitRegistration";
import { CircuitRanking } from "@/components/CircuitRanking";
import { CIRCUIT_HERO_IMAGE, getCircuitEdition, listCircuitRanking } from "@/lib/virtual-circuit";
import { CIRCUIT_CATEGORY_AGES, circuitCategoryBirthYear, circuitCategoryName } from "@/lib/virtual-circuit-category";
import {
  CIRCUIT_ABSOLUTE,
  CIRCUIT_AWARD_COPY,
  CIRCUIT_BIMONTHS,
  CIRCUIT_MONTHS,
  circuitPeriodStatus
} from "@/lib/virtual-circuit-schedule";
import styles from "./virtual-circuit.module.css";

export const metadata: Metadata = {
  title: "Circuito Virtual 11Run | Desafio Nacional de 1.000 Metros",
  description:
    "Atletas brasileiros das categorias Sub 10 a Sub 14, residentes no Brasil ou no exterior, podem registrar sua marca nos 1.000 metros e participar do ranking.",
  alternates: { canonical: "/projetos/circuito-virtual-11run" },
  openGraph: {
    title: "Desafio Virtual 1km 11Run Futuro",
    description: "Primeira competição virtual para as categorias Sub 10 a Sub 14.",
    images: [CIRCUIT_HERO_IMAGE]
  }
};

export const dynamic = "force-dynamic";

const modes = [
  ["Competição oficial", "Resultado público emitido por federação ou organização esportiva.", Trophy],
  ["Pista oficial de 400m", "Duas voltas completas e mais 200 metros, com vídeo público.", Route],
  ["Percurso aberto", "Registro no Strava, vídeo público e análise de distância e altimetria.", MapPin]
] as const;

export default function VirtualCircuitPage() {
  const edition = getCircuitEdition();
  const ranking = listCircuitRanking();
  const participants = listCircuitRanking({ includeOutsideEdition: true });
  const latestParticipants = [...participants]
    .sort((a, b) => b.activityDate.localeCompare(a.activityDate) || a.publicName.localeCompare(b.publicName, "pt-BR"))
    .slice(0, 3);
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
            <aside className={styles.participationHighlight} aria-label="Participação no desafio virtual">
              <div className={styles.participationTotal}>
                <span className={styles.participationIcon} aria-hidden="true"><Users size={19} /></span>
                <span>
                  <strong>{participants.length}</strong>
                  <small>atletas já participaram</small>
                </span>
              </div>
              <div className={styles.latestParticipants}>
                <span className={styles.latestLabel}><Clock3 size={13} /> Últimos participantes</span>
                <ul>
                  {latestParticipants.map((participant) => (
                    <li key={participant.athleteId}>
                      <strong>{participant.publicName}</strong>
                      <small>{circuitCategoryName(participant.categoryAge)} · {participant.state}</small>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
            <span className={styles.eyebrow}>Circuito Virtual 11Run</span>
            <h1>Desafio Virtual 1km 11Run Futuro</h1>
            <p className={styles.lead}>Para atletas brasileiros das categorias Sub 10 a Sub 14, residentes no Brasil ou no exterior.</p>
            <p>Corra 1.000 metros, registre sua atividade e participe de um ranking nacional criado para incentivar e descobrir novos talentos.</p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#inscricao">Registrar atividade</a>
              <a className={styles.secondaryButton} href="#ranking">Ver ranking nacional</a>
            </div>
            <div className={styles.quickFacts}>
              <span><Clock3 size={17} /> 1 ago — 30 nov 2026</span>
              <span><ShieldCheck size={17} /> Participação gratuita</span>
              <span><Users size={17} /> Exclusivo para brasileiros</span>
            </div>
            <p className={styles.datePolicy}>
              Inscrições abertas. Atividades anteriores a 1º de agosto serão registradas com a data de 01/08/2026.
            </p>
          </div>
          <div className={styles.heroImage}>
            <a href="#inscricao" aria-label="Participar gratuitamente do Desafio Virtual 1.000 m">
              <img
                src={edition.hero_image || CIRCUIT_HERO_IMAGE}
                alt="Participe gratuitamente do Desafio Virtual 1.000 m 11Run para atletas de 9 a 13 anos"
                width="1080"
                height="1350"
              />
            </a>
          </div>
        </section>

        <section className={styles.categoryGuide} aria-labelledby="categorias-2026">
          <div>
            <span className={styles.eyebrow}>Categorias da edição 2026</span>
            <h2 id="categorias-2026">A categoria é definida pelo ano de nascimento.</h2>
            <p>Exemplo: quem nasceu em 2017 completa 9 anos em 2026 e compete na categoria Sub 10.</p>
          </div>
          <div className={styles.categoryRail}>
            <div className={styles.categoryList}>
              {CIRCUIT_CATEGORY_AGES.map((age) => (
                <article key={age}>
                  <strong>{circuitCategoryName(age)}</strong>
                  <span>{age} anos em 2026</span>
                  <small>Nascidos em {circuitCategoryBirthYear(age)}</small>
                </article>
              ))}
            </div>
            <span className={styles.categorySwipeHint}>Deslize para ver todas as categorias →</span>
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
              ["02", "Aceite o termo", "O responsável declara as condições de saúde e assume os cuidados antes, durante e depois do teste."],
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
            <h2>Três disputas. Premiações que se acumulam.</h2>
            <p>Mensal, bimestral e absoluta: cada classificação considera categoria e gênero, com datas próprias e marcas validadas.</p>
          </div>
          <div className={styles.awardGrid}>
            <article>
              <CalendarDays />
              <span>Premiação mensal</span>
              <h3>Do primeiro ao último dia de cada mês</h3>
              <div className={styles.periodList}>{CIRCUIT_MONTHS.map((period) => <span key={period.id}><b>{period.label.replace(" de 2026", "")}</b><small>{period.shortLabel} · {circuitPeriodStatus(period)}</small></span>)}</div>
              <ul>{CIRCUIT_AWARD_COPY.monthly.map((prize) => <li key={prize}>{prize}</li>)}</ul>
            </article>
            <article>
              <Trophy />
              <span>Premiação bimestral</span>
              <h3>Dois ciclos com ranking próprio</h3>
              <div className={styles.periodList}>{CIRCUIT_BIMONTHS.map((period) => <span key={period.id}><b>{period.label}</b><small>{period.shortLabel} · {circuitPeriodStatus(period)}</small></span>)}</div>
              <ul>{CIRCUIT_AWARD_COPY.bimonthly.map((prize) => <li key={prize}>{prize}</li>)}</ul>
            </article>
            <article className={styles.finalAward}>
              <Medal />
              <span>Ranking absoluto</span>
              <h3>01/08 a 30/11 · {circuitPeriodStatus(CIRCUIT_ABSOLUTE)}</h3>
              <p>A melhor marca validada de cada atleta em toda a edição.</p>
              <ul>{CIRCUIT_AWARD_COPY.absolute.map((prize) => <li key={prize}>{prize.startsWith("R$ 500") ? <strong>{prize}</strong> : prize}</li>)}</ul>
            </article>
          </div>
          <p className={styles.cumulativeNotice}><CheckCircle2 size={18} /> As premiações são cumulativas: o atleta recebe todos os itens correspondentes à posição conquistada em cada período.</p>
          <div className={styles.futureCallout}>
            <div><strong>Oportunidade 11Run Futuro</strong><p>Na premiação absoluta, atletas Sub 10, Sub 11 e Sub 12 poderão ser avaliados para uma oportunidade no projeto. A classificação não garante ingresso automático.</p></div>
            <Link href="/onze-futuro">Conheça o 11Run Futuro</Link>
          </div>
        </section>

        <section className={styles.section} id="ranking">
          <CircuitRanking initialRanking={ranking} />
        </section>

        <section className={styles.section} id="inscricao">
          <div className={styles.medicalNotice}>
            <ShieldCheck size={24} />
            <div>
              <strong>Termo obrigatório do responsável</strong>
              <p>Não exigimos atestado médico. O pai, a mãe, o tutor ou o responsável legal deve confirmar o CPF, declarar que a criança está em boas condições gerais de saúde e assumir integral responsabilidade pela preparação, supervisão e por ocorrências antes, durante e depois do teste.</p>
            </div>
          </div>
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
