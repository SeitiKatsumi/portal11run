"use client";

import { useState } from "react";
import { Check, ExternalLink } from "lucide-react";
import type { AlexLopesApplication as Application } from "@/lib/alex-lopes";

const statuses = ["Recebido", "Em análise", "Contato realizado", "Matriculado", "Arquivado"];

export function AlexLopesAdmin({ initialApplications }: { initialApplications: Application[] }) {
  const [applications, setApplications] = useState(initialApplications);
  const [selected, setSelected] = useState<Application | null>(null);
  const [notice, setNotice] = useState("");

  async function updateStatus(application: Application, status: string) {
    const response = await fetch("/api/admin/alex-lopes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: application.id, status }) });
    if (!response.ok) return;
    const updated = await response.json() as Application;
    setApplications((current) => current.map((item) => item.id === updated.id ? updated : item));
    if (selected?.id === updated.id) setSelected(updated);
    setNotice("Status atualizado.");
  }

  return <div className="alex-admin-grid">
    <section className="panel alex-admin-list"><div className="section-heading"><div><p className="eyebrow">TREINE COM O ALEX</p><h1>Solicitações de avaliação</h1></div><p>{applications.length} registro(s)</p></div>{notice ? <p className="alex-notice"><Check size={18} />{notice}</p> : null}
      <div className="alex-table">
        {applications.length === 0 ? <p>Nenhuma solicitação recebida ainda.</p> : applications.map((application) => <button className="alex-admin-row" key={application.id} onClick={() => setSelected(application)} type="button"><span><strong>{application.fullName}</strong><small>{application.cityState || "Cidade não informada"} · {application.email}</small></span><span>{new Date(application.createdAt).toLocaleDateString("pt-BR")}</span><span>{application.status}</span></button>)}
      </div>
    </section>
    {selected ? <aside className="panel alex-admin-detail"><p className="eyebrow">SOLICITAÇÃO</p><h2>{selected.fullName}</h2><div className="alex-detail-status"><select value={selected.status} onChange={(event) => updateStatus(selected, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div><div className="alex-detail-grid">{Object.entries(selected).filter(([key, value]) => !["id", "createdAt", "updatedAt", "status"].includes(key) && value).map(([key, value]) => <div key={key}><small>{key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())}</small>{key === "trainingAudioUrl" ? <audio controls preload="none" src={String(value)} /> : <p>{typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value)}</p>}</div>)}</div><a className="button button-secondary" href="https://www.instagram.com/treinador.corrida.alex.lopes/" target="_blank" rel="noreferrer">Instagram do Alex <ExternalLink size={16} /></a></aside> : <aside className="panel alex-admin-detail empty"><p>Selecione uma solicitação para visualizar as respostas completas.</p></aside>}
  </div>;
}
