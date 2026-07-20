"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMemberMarkEvent, memberMarkEvents, normalizeMemberMarkEvent } from "@/lib/member-mark-options";

type Mark = {
  id: string;
  event: string;
  time: string;
  date: string;
  location: string;
};

type MemberMarkFormProps = {
  initialMarks?: Mark[];
  lockedTo1000m?: boolean;
};

const emptyForm = { event: "800m", time: "", date: "", location: "" };
const chartColors = ["#56633a", "#844a21", "#2f6577", "#8a5d72", "#6b6d28", "#3f4a64"];

function parseTime(value: string) {
  const normalized = value.trim().replace(",", ".");
  const parts = normalized.split(":").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return null;
}

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  const precision = seconds % 1 === 0 ? 0 : 2;
  return `${minutes}:${seconds.toFixed(precision).padStart(precision ? 5 : 2, "0")}`;
}

function buildChartData(marks: Mark[]) {
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", ""),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
    };
  });
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  const validMarks = marks
    .map((mark) => ({ ...mark, normalizedEvent: normalizeMemberMarkEvent(mark.event), seconds: parseTime(mark.time), markDate: new Date(`${mark.date}T12:00:00`) }))
    .filter((mark) => mark.normalizedEvent && mark.seconds !== null && !Number.isNaN(mark.markDate.getTime()) && mark.markDate >= start && mark.markDate <= now);
  const events = memberMarkEvents.filter((event) => validMarks.some((mark) => mark.normalizedEvent === event));
  const bestByEvent = new Map<string, number>();
  const data = months.map((month) => {
    const row: Record<string, string | number | null> = { month: month.label, monthKey: month.key };
    events.forEach((event) => {
      validMarks
        .filter((mark) => mark.normalizedEvent === event && mark.markDate <= month.end)
        .forEach((mark) => bestByEvent.set(event, Math.min(bestByEvent.get(event) ?? Number.POSITIVE_INFINITY, mark.seconds as number)));
      row[event] = bestByEvent.get(event) ?? null;
    });
    return row;
  });
  return { data, events };
}

export function MemberMarkForm({ initialMarks = [], lockedTo1000m = false }: MemberMarkFormProps) {
  const [marks, setMarks] = useState(initialMarks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm, event: lockedTo1000m ? "1000m" : emptyForm.event });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const chart = useMemo(() => buildChartData(marks), [marks]);

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, event: lockedTo1000m ? "1000m" : emptyForm.event });
  }

  function editMark(mark: Mark) {
    setEditingId(mark.id);
    setStatus("");
    setForm({
      event: lockedTo1000m ? "1000m" : (normalizeMemberMarkEvent(mark.event) ?? "800m"),
      time: mark.time,
      date: mark.date,
      location: mark.location
    });
    const formTop = document.querySelector(".member-mark-form")?.getBoundingClientRect().top;
    if (formTop !== undefined) window.scrollTo({ top: window.scrollY + formTop - 120, behavior: "smooth" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setLoading(true);
    const response = await fetch("/api/members/marks", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...form, event: lockedTo1000m ? "1000m" : form.event })
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(result.error ?? "Erro ao salvar atividade.");
      return;
    }

    setMarks((current) => editingId
      ? current.map((mark) => mark.id === editingId ? result.mark : mark)
      : [result.mark, ...current]);
    setStatus(editingId ? "Atividade atualizada." : "Marca adicionada ao seu painel.");
    resetForm();
  }

  return (
    <>
      <form className="member-mark-form" onSubmit={onSubmit}>
        <label>
          <span>Prova</span>
          <select value={form.event} onChange={(event) => setForm((current) => ({ ...current, event: event.target.value }))} disabled={lockedTo1000m}>
            {(lockedTo1000m ? ["1000m"] : memberMarkEvents).map((event) => (
              <option key={event} value={event}>{formatMemberMarkEvent(event)}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Tempo/marca</span>
          <input value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} placeholder="03:45.20" required />
        </label>
        <label>
          <span>Data</span>
          <input value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} type="date" required />
        </label>
        <label>
          <span>Local</span>
          <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} placeholder="Itatiba/SP" required />
        </label>
        {status ? <p className="form-status" role="status">{status}</p> : null}
        <div className="member-mark-actions">
          {editingId ? <button className="button ghost" type="button" onClick={resetForm}><X size={17} />Cancelar</button> : null}
          <button className="button primary" type="submit" disabled={loading}>
            {editingId ? <Pencil size={17} /> : <Plus size={17} />}
            {loading ? "Salvando..." : editingId ? "Salvar atividade" : "Adicionar marca"}
          </button>
        </div>
      </form>

      <div className="member-table member-marks-table">
        {marks.length === 0 ? <p>Nenhuma marca enviada ainda.</p> : null}
        {marks.map((mark) => (
          <div key={mark.id}>
            <strong>{formatMemberMarkEvent(mark.event)}</strong>
            <span>{mark.time}</span>
            <span>{mark.date}</span>
            <span>{mark.location}</span>
            <button className="member-mark-edit" type="button" onClick={() => editMark(mark)}>
              <Pencil size={15} /> Editar atividade
            </button>
          </div>
        ))}
      </div>

      <section className="member-marks-chart" aria-labelledby="member-marks-chart-title">
        <header>
          <div>
            <span className="eyebrow">evolução em 12 meses</span>
            <h3 id="member-marks-chart-title">Melhores marcas por prova</h3>
          </div>
          <p>O menor tempo registrado até cada mês.</p>
        </header>
        {chart.events.length === 0 ? (
          <div className="member-chart-empty">Adicione marcas com data nos últimos 12 meses para acompanhar sua evolução.</div>
        ) : (
          <div className="member-chart-canvas" role="img" aria-label="Gráfico de linha das melhores marcas nos últimos 12 meses">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data} margin={{ top: 18, right: 20, bottom: 4, left: 4 }} accessibilityLayer>
                <CartesianGrid vertical={false} stroke="#ddd6ca" strokeDasharray="2 6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b746a", fontSize: 12 }} />
                <YAxis reversed width={54} axisLine={false} tickLine={false} tick={{ fill: "#7b746a", fontSize: 12 }} tickFormatter={(value) => formatTime(Number(value))} domain={["dataMin - 3", "dataMax + 3"]} />
                <Tooltip
                  contentStyle={{ border: "1px solid #d8d4c9", borderRadius: 14, background: "#fffaf2", boxShadow: "0 12px 32px rgba(31,33,29,.12)" }}
                  formatter={(value, name) => [formatTime(Number(value)), formatMemberMarkEvent(String(name))]}
                  labelStyle={{ color: "#66675f", marginBottom: 8 }}
                />
                <Legend formatter={(value) => formatMemberMarkEvent(String(value))} wrapperStyle={{ paddingTop: 18, fontSize: 12 }} />
                {chart.events.map((event, index) => (
                  <Line key={event} type="monotone" dataKey={event} name={event} stroke={chartColors[index]} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: chartColors[index] }} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} connectNulls={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </>
  );
}
