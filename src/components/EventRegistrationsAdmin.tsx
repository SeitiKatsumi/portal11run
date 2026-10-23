"use client";

import { useState } from "react";
import { ClipboardList, Search, School, Users } from "lucide-react";
import type { EventRegistration } from "@/lib/event-registrations";
import styles from "./event-registrations-admin.module.css";

const eventLabels: Record<string, string> = {
  "finalissima-desafio-virtual-2026": "Finalíssima do Desafio Virtual · 13/11/2026",
  "inauguracao-centro-olimpico-vinhedo-2026": "Centro Olímpico de Vinhedo · 14/11/2026"
};
function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

export function EventRegistrationsAdmin({ registrations }: { registrations: EventRegistration[] }) {
  const [event, setEvent] = useState("");
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase("pt-BR");
  const visible = registrations.filter((registration) => (!event || registration.event_id === event) && (!search || [registration.name, registration.email, registration.school_name, ...registration.participants.map((participant) => participant.name)].some((value) => value?.toLocaleLowerCase("pt-BR").includes(search))));
  const participantCount = visible.reduce((total, registration) => total + registration.participants.length, 0);

  return (
    <section className={`admin-panel admin-subpanel ${styles.panel}`} aria-labelledby="event-registrations-title">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">inscrições gratuitas</span>
          <h1 id="event-registrations-title">Inscrições dos eventos</h1>
          <p>Acompanhe participantes e grupos escolares inscritos nas páginas dos eventos.</p>
        </div>
      </div>
      <div className={styles.stats}>
        <div><ClipboardList size={19} aria-hidden="true" /><strong>{visible.length}</strong><span>inscrições</span></div>
        <div><Users size={19} aria-hidden="true" /><strong>{participantCount}</strong><span>participantes</span></div>
        <div><School size={19} aria-hidden="true" /><strong>{visible.filter((registration) => registration.registration_type === "school").length}</strong><span>grupos escolares</span></div>
      </div>
      <div className={styles.filters}>
        <label><span>Evento</span><select value={event} onChange={(change) => setEvent(change.target.value)}><option value="">Todos os eventos</option>{Object.entries(eventLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label><span><Search size={14} aria-hidden="true" /> Buscar inscrição</span><input type="search" value={query} onChange={(change) => setQuery(change.target.value)} placeholder="Responsável, escola, aluno ou e-mail" /></label>
      </div>
      <div className={styles.list}>
        {visible.length === 0 ? <p className={styles.empty}>Nenhuma inscrição encontrada.</p> : null}
        {visible.map((registration) => (
          <details key={registration.id} className={styles.registration}>
            <summary>
              <span><small>{eventLabels[registration.event_id]}</small><strong>{registration.school_name || registration.participants[0]?.name}</strong><span>{registration.registration_type === "school" ? "Grupo escolar" : "Individual"} · {registration.participants.length} {registration.participants.length === 1 ? "participante" : "participantes"} · {registration.city}/{registration.state}</span></span>
              <span className={styles.date}>Recebida em {formatDate(registration.created_at)}</span>
            </summary>
            <div className={styles.content}>
              <dl className={styles.contact}>
                <div><dt>Responsável</dt><dd>{registration.name}</dd></div>
                <div><dt>E-mail</dt><dd><a href={`mailto:${registration.email}`}>{registration.email}</a></dd></div>
                <div><dt>Telefone</dt><dd><a href={`tel:${registration.phone.replace(/[^+\d]/g, "")}`}>{registration.phone}</a></dd></div>
                <div><dt>Protocolo</dt><dd>{registration.id}</dd></div>
              </dl>
              <div className={styles.tableScroll} role="region" aria-label={`Participantes da inscrição de ${registration.name}`} tabIndex={0}>
                <table><thead><tr><th scope="col">Participante</th><th scope="col">Nascimento</th><th scope="col">Gênero</th></tr></thead><tbody>{registration.participants.map((participant, index) => <tr key={index}><td>{participant.name}</td><td>{formatDate(participant.birth_date)}</td><td>{participant.gender}</td></tr>)}</tbody></table>
              </div>
              <details className={styles.authorization}><summary>Consentimento e autorização registrados</summary><p>{registration.consent_text}</p><p>{registration.guardian_authorization_text}</p><small>Aceites registrados em {new Date(registration.created_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}.</small></details>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
