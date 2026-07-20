import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Trophy } from "lucide-react";
import styles from "./MasterOfficialEvents.module.css";

const events = [
  {
    day: "11–12",
    month: "JUL",
    title: "68º Campeonato Paulista de Atletismo Master",
    place: "São Paulo (SP)",
    status: "Realizado",
    featured: true
  },
  {
    day: "18",
    month: "SET",
    title: "Festival de Atletismo Master Prof. Guaracy Mendes",
    place: "Rio de Janeiro (RJ)",
    status: "Próxima prova"
  },
  {
    day: "18–20",
    month: "SET",
    title: "Troféu Bandeirantes",
    place: "Pindamonhangaba (SP)",
    status: "Planejamento"
  },
  {
    day: "18–20",
    month: "SET",
    title: "Troféu Brasil de Atletismo Master",
    place: "Porto Alegre (RS)",
    status: "Planejamento"
  },
  {
    day: "18",
    month: "OUT",
    title: "Campeonato Paulista de Cross Country",
    place: "Tupã (SP)",
    status: "Planejamento"
  },
  {
    day: "06–08",
    month: "NOV",
    title: "VI Taça Brasil Master Loterias Caixa de Atletismo",
    place: "Bragança Paulista (SP)",
    status: "Planejamento"
  }
];

export function MasterOfficialEvents() {
  return (
    <section className={styles.section} id="calendario" aria-labelledby="calendar-title">
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Calendário competitivo · 2026</span>
            <h2 id="calendar-title">Uma temporada com direção clara.</h2>
          </div>
          <p>
            Datas, cidades e o momento de cada competição em uma visão simples para atletas,
            familiares e equipe técnica.
          </p>
        </header>

        <div className={styles.summary}>
          <div><CalendarDays size={20} /><span><strong>6</strong> competições no calendário</span></div>
          <div><Trophy size={20} /><span><strong>1</strong> estreia histórica concluída</span></div>
          <Link href="#paulista">Ver resultados do Paulista <ArrowRight size={17} /></Link>
        </div>

        <div className={styles.grid}>
          {events.map((event) => (
            <article className={event.featured ? styles.featured : undefined} key={event.title}>
              <div className={styles.date}>
                <strong>{event.day}</strong>
                <span>{event.month}</span>
              </div>
              <div className={styles.eventCopy}>
                <span className={styles.status}>
                  {event.featured && <CheckCircle2 size={14} />}
                  {event.status}
                </span>
                <h3>{event.title}</h3>
                <p><MapPin size={15} /> {event.place}</p>
              </div>
              {event.featured && (
                <Link href="#paulista" aria-label="Ver os resultados do Campeonato Paulista">
                  <ArrowRight size={18} />
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
