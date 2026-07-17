"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";

type MemberMarkFormProps = {
  lockedTo1000m?: boolean;
};

export function MemberMarkForm({ lockedTo1000m = false }: MemberMarkFormProps) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/members/marks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        age_group: formData.get("age_group"),
        event: lockedTo1000m ? "1000m" : formData.get("event"),
        time: formData.get("time"),
        date: formData.get("date"),
        location: formData.get("location")
      })
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(result.error ?? "Erro ao salvar marca.");
      return;
    }

    event.currentTarget.reset();
    setStatus("Marca enviada para acompanhamento.");
  }

  return (
    <form className="member-mark-form" onSubmit={onSubmit}>
      <label>
        <span>Idade/categoria</span>
        <input name="age_group" placeholder="10 anos, Master 40..." required />
      </label>
      <label>
        <span>Prova</span>
        {lockedTo1000m ? (
          <input name="event" value="1000m" readOnly aria-readonly="true" />
        ) : (
          <input name="event" placeholder="800m, 1500m, 5km..." required />
        )}
      </label>
      <label>
        <span>Tempo/marca</span>
        <input name="time" placeholder="03:45.20" required />
      </label>
      <label>
        <span>Data</span>
        <input name="date" type="date" required />
      </label>
      <label>
        <span>Local</span>
        <input name="location" placeholder="Itatiba/SP" required />
      </label>
      {status ? <p className="form-status">{status}</p> : null}
      <button className="button primary" type="submit" disabled={loading}>
        <Plus size={17} />
        {loading ? "Salvando..." : "Adicionar marca"}
      </button>
    </form>
  );
}
