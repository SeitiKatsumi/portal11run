"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, X } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatMemberMarkEvent, memberMarkEvents, normalizeMemberMarkEvent } from "@/lib/member-mark-options";
import { buildMemberMarkChartData } from "@/lib/member-mark-chart";

type Mark = {
  id: string;
  event: string;
  time: string;
  date: string;
  location: string;
  editable?: boolean;
  source?: "MEMBER" | "RANKING";
};

type MemberMarkFormProps = {
  initialMarks?: Mark[];
  lockedTo1000m?: boolean;
};

const emptyForm = { event: "1000m", time: "", date: "", location: "" };
const chartColor = "#56633a";

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  const precision = seconds % 1 === 0 ? 0 : 2;
  return `${minutes}:${seconds.toFixed(precision).padStart(precision ? 5 : 2, "0")}`;
}

export function MemberMarkForm({ initialMarks = [], lockedTo1000m = true }: MemberMarkFormProps) {
  const [marks, setMarks] = useState(initialMarks);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm, event: lockedTo1000m ? "1000m" : emptyForm.event });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const chart = useMemo(() => buildMemberMarkChartData(marks), [marks]);

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, event: lockedTo1000m ? "1000m" : emptyForm.event });
  }

  function editMark(mark: Mark) {
    setEditingId(mark.id);
    setStatus("");
    setForm({
      event: lockedTo1000m ? "1000m" : (normalizeMemberMarkEvent(mark.event) ?? "1000m"),
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
      <section className="member-marks-chart member-marks-chart-top" aria-labelledby="member-marks-chart-title">
        <header>
          <div>
            <span className="eyebrow">evolução em 12 meses</span>
            <h3 id="member-marks-chart-title">Evolução nos 1.000 m</h3>
          </div>
          <p>O menor tempo registrado até cada mês.</p>
        </header>
        {chart.events.length === 0 ? (
          <div className="member-chart-empty">Adicione uma marca de 1.000 m para acompanhar sua evolução.</div>
        ) : (
          <div className="member-chart-canvas" role="img" aria-label="Gráfico de linha das melhores marcas de 1.000 m nos últimos 12 meses">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart.data} margin={{ top: 18, right: 20, bottom: 4, left: 4 }} accessibilityLayer>
                <CartesianGrid vertical={false} stroke="#ddd6ca" strokeDasharray="2 6" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#7b746a", fontSize: 12 }} />
                <YAxis reversed width={54} axisLine={false} tickLine={false} tick={{ fill: "#7b746a", fontSize: 12 }} tickFormatter={(value) => formatTime(Number(value))} domain={["dataMin - 3", "dataMax + 3"]} />
                <Tooltip
                  contentStyle={{ border: "1px solid #d8d4c9", borderRadius: 14, background: "#fffaf2", boxShadow: "0 12px 32px rgba(31,33,29,.12)" }}
                  formatter={(value) => [formatTime(Number(value)), "1.000 m"]}
                  labelStyle={{ color: "#66675f", marginBottom: 8 }}
                />
                <Legend formatter={() => "1.000 m"} wrapperStyle={{ paddingTop: 18, fontSize: 12 }} />
                <Line type="monotone" dataKey="1000m" name="1000m" stroke={chartColor} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 0, fill: chartColor }} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

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
            {mark.editable === false ? (
              <span className="member-mark-source">Marca oficial</span>
            ) : (
              <button className="member-mark-edit" type="button" onClick={() => editMark(mark)}>
                <Pencil size={15} /> Editar atividade
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
