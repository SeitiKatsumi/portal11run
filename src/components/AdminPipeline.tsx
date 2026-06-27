"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ImageIcon, RefreshCw } from "lucide-react";

type AdminLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string | null;
  state?: string | null;
  profile_type?: string | null;
  project_type: string;
  athlete_name?: string | null;
  birth_date?: string | null;
  pipeline_status: string;
  photos_json?: string | null;
  receipts_json?: string | null;
  payload_json: string;
  created_at: string;
};

const statuses = ["Cadastro recebido", "Em análise", "Aceitos", "Declinados", "Outros"];
const receiptItems = ["Uniforme", "Material esportivo", "Ajuda de custo", "Inscrição ou evento", "Outro recebimento"];

const projectLabels: Record<string, string> = {
  "app-11run": "App 11Run",
  "onze-futuro": "Onze Futuro",
  "11-regional": "11 Regional",
  "circuito-futuro-11": "Circuito Futuro 11",
  bolsas: "Bolsas"
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function AdminPipeline({ initialLeads }: { initialLeads: AdminLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [projectFilter, setProjectFilter] = useState("todos");
  const [updating, setUpdating] = useState("");

  const projects = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.project_type))).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (projectFilter === "todos") return leads;
    return leads.filter((lead) => lead.project_type === projectFilter);
  }, [leads, projectFilter]);

  async function patchLead(id: string, body: Record<string, unknown>) {
    setUpdating(id);
    const response = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body })
    });
    const result = await response.json();
    setUpdating("");

    if (!response.ok) {
      throw new Error(result.error ?? "Erro ao atualizar cadastro.");
    }

    setLeads((current) => current.map((lead) => (lead.id === id ? result.lead : lead)));
  }

  return (
    <section className="admin-panel">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">painel admin</span>
          <h1>Pipeline de cadastros</h1>
          <p>Todos os registros do site organizados por projeto, categoria e etapa de análise.</p>
        </div>
        <label>
          <span>Projeto</span>
          <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
            <option value="todos">Todos os projetos</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {projectLabels[project] ?? project}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="pipeline-board">
        {statuses.map((status) => {
          const columnLeads = filteredLeads.filter((lead) => lead.pipeline_status === status);

          return (
            <section className="pipeline-column" key={status}>
              <div className="pipeline-column-head">
                <strong>{status}</strong>
                <span>{columnLeads.length}</span>
              </div>

              {columnLeads.length === 0 ? <p className="empty-column">Sem cadastros nesta etapa.</p> : null}

              {columnLeads.map((lead) => {
                const payload = parseJson<Record<string, string | boolean | string[]>>(lead.payload_json, {});
                const photos = parseJson<string[]>(lead.photos_json, []);
                const receipts = parseJson<Record<string, boolean>>(lead.receipts_json, {});
                const projectLabel = projectLabels[lead.project_type] ?? lead.project_type;

                return (
                  <article className="admin-card" key={lead.id}>
                    <div className="admin-card-head">
                      <span>{projectLabel}</span>
                      {updating === lead.id ? <RefreshCw className="spin" size={16} /> : null}
                    </div>
                    <h2>{lead.athlete_name || lead.name}</h2>
                    <p>
                      {lead.name} · {lead.phone}
                    </p>
                    <p>
                      {lead.email}
                      {lead.city ? ` · ${lead.city}${lead.state ? `/${lead.state}` : ""}` : ""}
                    </p>
                    <small>{formatDate(lead.created_at)}</small>

                    <label className="admin-status">
                      <span>Etapa</span>
                      <select
                        value={lead.pipeline_status}
                        onChange={(event) => patchLead(lead.id, { pipeline_status: event.target.value })}
                      >
                        {statuses.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    {photos.length > 0 ? (
                      <div className="admin-photos">
                        {photos.map((photo) => (
                          <img src={photo} alt={`Foto de ${lead.athlete_name || lead.name}`} key={photo} />
                        ))}
                      </div>
                    ) : (
                      <div className="admin-no-photo">
                        <ImageIcon size={16} />
                        Sem fotos anexadas
                      </div>
                    )}

                    <details>
                      <summary>Dados completos</summary>
                      <dl>
                        {Object.entries(payload)
                          .filter(([key]) => !["photos"].includes(key))
                          .map(([key, value]) => (
                            <div key={key}>
                              <dt>{key.replaceAll("_", " ")}</dt>
                              <dd>{String(value)}</dd>
                            </div>
                          ))}
                      </dl>
                    </details>

                    <div className="receipt-list">
                      <strong>Recebimentos</strong>
                      {receiptItems.map((item) => (
                        <label key={item}>
                          <input
                            type="checkbox"
                            checked={receipts[item] === true}
                            onChange={(event) => patchLead(lead.id, { receipts: { [item]: event.target.checked } })}
                          />
                          <span>{item}</span>
                          {receipts[item] ? <CheckCircle2 size={15} /> : null}
                        </label>
                      ))}
                    </div>
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>
    </section>
  );
}
