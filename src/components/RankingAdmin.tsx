"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { RankingRecord } from "@/lib/rankings";

const events = ["10 anos - 800m", "11 anos - 1000m", "12 anos - 1200m", "13 anos - 1500m"];

export function RankingAdmin({ initialRankings }: { initialRankings: RankingRecord[] }) {
  const [rankings, setRankings] = useState(initialRankings);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries(form.entries());
    const response = await fetch("/api/admin/rankings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Erro ao salvar ranking.");
      return;
    }
    setRankings((current) => [...current, result.ranking]);
    event.currentTarget.reset();
  }

  async function remove(id: string) {
    const response = await fetch(`/api/admin/rankings?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setRankings((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="admin-panel admin-subpanel">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">ranking circuito</span>
          <h1>Ranking por prova e idade</h1>
          <p>Gerencie nome, tempo, data e local dos atletas do Circuito Futuro 11.</p>
        </div>
      </div>

      <form className="ranking-form" onSubmit={onSubmit}>
        <label>
          <span>Faixa / prova</span>
          <select name="age_group" required>
            <option value="">Selecione</option>
            {events.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="event" value="" />
        <label>
          <span>Nome do atleta</span>
          <input name="athlete_name" required />
        </label>
        <label>
          <span>Tempo</span>
          <input name="time" placeholder="00:00.00" required />
        </label>
        <label>
          <span>Data</span>
          <input name="date" type="date" required />
        </label>
        <label>
          <span>Local</span>
          <input name="location" required />
        </label>
        <button className="button primary" type="submit">
          Salvar ranking
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </form>

      <div className="ranking-table">
        {rankings.length === 0 ? <p>Nenhum resultado cadastrado.</p> : null}
        {rankings.map((item) => (
          <article key={item.id}>
            <div>
              <strong>{item.athlete_name}</strong>
              <span>{item.age_group}</span>
            </div>
            <span>{item.time}</span>
            <span>{item.date}</span>
            <span>{item.location}</span>
            <button type="button" onClick={() => remove(item.id)} aria-label="Remover resultado">
              <Trash2 size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
