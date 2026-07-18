"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { usePathname } from "next/navigation";

const events = [
  ["10 a 12 de junho", "58º Campeonato Paulista de Atletismo Master", "São Paulo (SP)"],
  ["18 de setembro", "Festival de Atletismo Master Prof. Guaracy Mendes", "Rio de Janeiro (RJ)"],
  ["18 a 20 de setembro", "Troféu Bandeirantes", "Pindamonhangaba (SP)"],
  ["18 a 20 de setembro", "Troféu Brasil de Atletismo Master", "Porto Alegre (RS)"],
  ["18 de outubro", "Campeonato Paulista de Cross Country", "Tupã (SP)"],
  ["6 a 8 de novembro", "VI Taça Brasil Master Loterias Caixa de Atletismo", "Bragança Paulista (SP)"],
];

export function MasterOfficialEvents() {
  const pathname = usePathname();
  if (pathname !== "/11-master") return null;
  return <section className="page-shell master-calendar content-section"><div className="section-heading"><div><p className="eyebrow">CALENDÁRIO 2026</p><h2>Provas oficiais em foco.</h2></div><p>Uma agenda de referência para orientar o planejamento competitivo do 11 Master.</p></div><div className="master-calendar-grid">{events.map(([date, title, place]) => <article className="panel master-event" key={title}><p><CalendarDays size={16} />{date}</p><h3>{title}</h3><span><MapPin size={15} />{place}</span></article>)}</div></section>;
}
