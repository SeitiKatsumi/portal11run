"use client";

import { Download, FileCheck2, Mail, Save, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  brandingStatuses,
  type BrandingFile,
  type BrandingRequest,
  type BrandingStatus
} from "@/lib/branding-shared";
import styles from "./BrandingAdmin.module.css";

type RequestWithFiles = BrandingRequest & { files: BrandingFile[] };
const labels: Record<BrandingStatus, string> = {
  RECEIVED: "Recebida",
  IN_REVIEW: "Em análise",
  CHANGES_REQUESTED: "Ajustes solicitados",
  APPROVED: "Aprovada",
  REJECTED: "Rejeitada",
  EXPIRED: "Expirada"
};

export function BrandingAdmin({ initialRequests }: { initialRequests: RequestWithFiles[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [saving, setSaving] = useState("");
  const approved = requests.filter((item) => item.status === "APPROVED").length;

  function updateLocal(id: string, patch: Partial<RequestWithFiles>) {
    setRequests((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  async function save(item: RequestWithFiles) {
    setSaving(item.id);
    const response = await fetch(`/api/admin/branding/requests/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: item.status, adminNotes: item.admin_notes, handledBy: item.handled_by })
    });
    if (!response.ok) alert("Não foi possível atualizar a solicitação.");
    setSaving("");
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <p>BRANDING E LICENCIAMENTO</p>
        <h1>Solicitações de uso da marca</h1>
        <span>Analise aplicações, documentos e autorizações com rastreabilidade.</span>
      </section>
      <section className={styles.stats}>
        <article><FileCheck2 /><span>Solicitações</span><strong>{requests.length}</strong></article>
        <article><ShieldCheck /><span>Aprovadas</span><strong>{approved}</strong></article>
        <article><span>Pendentes de análise</span><strong>{requests.filter((item) => item.status === "RECEIVED" || item.status === "IN_REVIEW").length}</strong></article>
      </section>
      <section className={styles.list}>
        {!requests.length && <div className={styles.empty}>Nenhuma solicitação recebida até o momento.</div>}
        {requests.map((item) => (
          <article className={styles.card} key={item.id}>
            <header>
              <div><small>{new Date(item.created_at).toLocaleString("pt-BR")}</small><h2>{item.organization}</h2><p>{item.requester_name} · {item.requester_email} · {item.requester_phone}</p></div>
              <select value={item.status} onChange={(event) => updateLocal(item.id, { status: event.target.value as BrandingStatus })}>
                {brandingStatuses.map((status) => <option value={status} key={status}>{labels[status]}</option>)}
              </select>
            </header>
            <div className={styles.details}><div><strong>Uso pretendido</strong><p>{item.intended_use}</p></div><div><strong>Canais e período</strong><p>{item.channels}</p></div>{item.notes && <div><strong>Observações</strong><p>{item.notes}</p></div>}</div>
            {!!item.files.length && <div className={styles.files}>{item.files.map((file) => <a href={`/api/admin/branding/files/${file.id}`} key={file.id}><Download size={16} />{file.original_name}<small>{Math.ceil(file.size_bytes / 1024)} KB</small></a>)}</div>}
            <div className={styles.review}>
              <label>Responsável<input value={item.handled_by || ""} onChange={(event) => updateLocal(item.id, { handled_by: event.target.value })} /></label>
              <label>Notas internas<textarea value={item.admin_notes || ""} onChange={(event) => updateLocal(item.id, { admin_notes: event.target.value })} /></label>
              <div className={styles.actions}>
                <a href={`mailto:${item.requester_email}?subject=${encodeURIComponent(`Solicitação de uso da marca 11Run — ${item.organization}`)}`}><Mail size={16} />Responder</a>
                <button onClick={() => save(item)} disabled={saving === item.id}><Save size={16} />{saving === item.id ? "Salvando…" : "Salvar análise"}</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
