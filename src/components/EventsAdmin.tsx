"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CalendarPlus, Trash2 } from "lucide-react";
import type { MemberEvent } from "@/lib/events";

type AdminLead = {
  id: string;
  name: string;
  athlete_name?: string | null;
  project_type: string;
  email: string;
};

const projectLabels: Record<string, string> = {
  todos: "Todos os projetos",
  "onze-futuro": "11 Futuro",
  "11-regional": "11 Master",
  "circuito-futuro-11": "Circuito Futuro 11",
  bolsas: "Bolsas",
  "app-11run": "App 11Run"
};

function parseParticipants(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function formatDate(date: string, time?: string | null) {
  const [year, month, day] = date.split("-");
  const formatted = year && month && day ? `${day}/${month}/${year}` : date;
  return time ? `${formatted} às ${time}` : formatted;
}

export function EventsAdmin({ initialEvents, leads }: { initialEvents: MemberEvent[]; leads: AdminLead[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [project, setProject] = useState("todos");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const visibleLeads = useMemo(() => {
    if (project === "todos") return leads;
    return leads.filter((lead) => lead.project_type === project);
  }, [leads, project]);

  const leadNameById = useMemo(() => {
    return new Map(leads.map((lead) => [lead.id, lead.athlete_name || lead.name]));
  }, [leads]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const participants = formData.getAll("participants").map(String);

    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        project_type: formData.get("project_type"),
        event_date: formData.get("event_date"),
        event_time: formData.get("event_time"),
        location: formData.get("location"),
        description: formData.get("description"),
        participants
      })
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Erro ao salvar evento.");
      return;
    }

    setEvents((current) => [result.event, ...current]);
    event.currentTarget.reset();
    setProject("todos");
  }

  async function removeEvent(id: string) {
    const response = await fetch(`/api/admin/events?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setEvents((current) => current.filter((event) => event.id !== id));
  }

  return (
    <section className="admin-panel admin-subpanel events-admin">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">agenda dos atletas</span>
          <h1>Próximos eventos</h1>
          <p>Cadastre treinos, provas, reuniões ou entregas e selecione quais atletas vão participar.</p>
        </div>
      </div>

      <form className="events-form" onSubmit={onSubmit}>
        <label>
          <span>Projeto</span>
          <select name="project_type" value={project} onChange={(event) => setProject(event.target.value)} required>
            {Object.entries(projectLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Título do evento</span>
          <input name="title" placeholder="Treino oficial, prova, reunião..." required />
        </label>
        <label>
          <span>Data</span>
          <input name="event_date" type="date" required />
        </label>
        <label>
          <span>Horário</span>
          <input name="event_time" type="time" />
        </label>
        <label className="events-wide">
          <span>Local</span>
          <input name="location" placeholder="Pista, cidade, endereço ou link" />
        </label>
        <label className="events-wide">
          <span>Descrição</span>
          <textarea name="description" rows={3} placeholder="Orientações importantes para os atletas." />
        </label>
        <fieldset className="events-participants">
          <legend>Atletas participantes</legend>
          {visibleLeads.length === 0 ? <p>Nenhum atleta encontrado neste projeto.</p> : null}
          {visibleLeads.map((lead) => (
            <label key={lead.id}>
              <input type="checkbox" name="participants" value={lead.id} />
              <span>{lead.athlete_name || lead.name}</span>
              <small>{projectLabels[lead.project_type] ?? lead.project_type}</small>
            </label>
          ))}
        </fieldset>
        {error ? <p className="form-error events-wide">{error}</p> : null}
        <button className="button primary" type="submit" disabled={loading}>
          <CalendarPlus size={17} />
          {loading ? "Salvando..." : "Adicionar evento"}
        </button>
      </form>

      <div className="events-list">
        {events.length === 0 ? <p>Nenhum evento cadastrado ainda.</p> : null}
        {events.map((event) => {
          const participants = parseParticipants(event.participants_json);
          return (
            <article key={event.id}>
              <div>
                <span className="eyebrow">{projectLabels[event.project_type] ?? event.project_type}</span>
                <h2>{event.title}</h2>
                <p>{formatDate(event.event_date, event.event_time)}</p>
                {event.location ? <p>{event.location}</p> : null}
                {event.description ? <small>{event.description}</small> : null}
              </div>
              <div className="events-athletes">
                <strong>Atletas</strong>
                <p>{participants.map((id) => leadNameById.get(id) ?? id).join(", ")}</p>
              </div>
              <button type="button" onClick={() => removeEvent(event.id)} aria-label="Excluir evento">
                <Trash2 size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
