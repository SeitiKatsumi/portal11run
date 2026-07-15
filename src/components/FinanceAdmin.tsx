"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Banknote, PencilLine, Trash2, X } from "lucide-react";
import type { FinancialRecord } from "@/lib/finance";

type AdminLead = {
  id: string;
  name: string;
  athlete_name?: string | null;
  project_type: string;
  email: string;
};

const projectLabels: Record<string, string> = {
  "onze-futuro": "11 Futuro",
  "11-regional": "11 Master",
  "circuito-futuro-11": "Circuito Futuro 11",
  bolsas: "Bolsas",
  "app-11run": "App 11Run"
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function centsToInput(cents: number) {
  return String((cents / 100).toFixed(2)).replace(".", ",");
}

export function FinanceAdmin({ initialRecords, leads }: { initialRecords: FinancialRecord[]; leads: AdminLead[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const totals = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        if (record.direction === "entrada") acc.entries += record.amount_cents;
        if (record.direction === "saida") acc.expenses += record.amount_cents;
        acc.projects.add(record.project_type ?? "sem-projeto");
        if (record.athlete_name) acc.athletes.add(record.athlete_name);
        if (record.sponsor_name) acc.sponsors.add(record.sponsor_name);
        return acc;
      },
      { entries: 0, expenses: 0, projects: new Set<string>(), athletes: new Set<string>(), sponsors: new Set<string>() }
    );
  }, [records]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    if (editingRecord?.id) {
      formData.set("id", editingRecord.id);
    }

    const response = await fetch("/api/admin/finance", {
      method: editingRecord ? "PATCH" : "POST",
      body: formData
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? "Erro ao salvar lançamento.");
      return;
    }

    setRecords((current) =>
      editingRecord ? current.map((record) => (record.id === result.record.id ? result.record : record)) : [result.record, ...current]
    );
    setEditingRecord(null);
    event.currentTarget.reset();
  }

  async function removeRecord(id: string) {
    const response = await fetch(`/api/admin/finance?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setRecords((current) => current.filter((record) => record.id !== id));
  }

  return (
    <section className="admin-panel admin-subpanel finance-admin">
      <div className="admin-toolbar">
        <div>
          <span className="eyebrow">financeiro</span>
          <h1>Módulo financeiro</h1>
          <p>Entradas, saídas, patrocinadores, projetos e atletas beneficiados com vínculo automático ao dashboard.</p>
        </div>
      </div>

      <div className="finance-kpis">
        <article>
          <span>Total de entradas</span>
          <strong>{formatMoney(totals.entries)}</strong>
        </article>
        <article>
          <span>Total de saídas</span>
          <strong>{formatMoney(totals.expenses)}</strong>
        </article>
        <article>
          <span>Saldo registrado</span>
          <strong>{formatMoney(totals.entries - totals.expenses)}</strong>
        </article>
        <article>
          <span>Atletas beneficiados</span>
          <strong>{totals.athletes.size}</strong>
        </article>
        <article>
          <span>Patrocinadores</span>
          <strong>{totals.sponsors.size}</strong>
        </article>
        <article>
          <span>Projetos apoiados</span>
          <strong>{totals.projects.size}</strong>
        </article>
      </div>

      <form className="finance-form" onSubmit={onSubmit} key={editingRecord?.id ?? "new-record"}>
        <label>
          <span>Entrada ou saída</span>
          <select name="direction" required defaultValue={editingRecord?.direction ?? "entrada"}>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída / benefício</option>
          </select>
        </label>
        <label>
          <span>Atleta aceito / cadastro vinculado</span>
          <select name="lead_id" required defaultValue={editingRecord?.lead_id ?? ""}>
            <option value="">Selecione</option>
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.athlete_name || lead.name} · {projectLabels[lead.project_type] ?? lead.project_type}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Tipo</span>
          <input name="type" placeholder="Ajuda de custo, uniforme, entrada em dinheiro..." defaultValue={editingRecord?.type ?? ""} required />
        </label>
        <label>
          <span>Valor</span>
          <input name="amount" placeholder="500,00" defaultValue={editingRecord ? centsToInput(editingRecord.amount_cents) : ""} required />
        </label>
        <label>
          <span>Patrocinador/apoiador</span>
          <input name="sponsor_name" placeholder="Empresa, pessoa ou apoiador" defaultValue={editingRecord?.sponsor_name ?? ""} />
        </label>
        <label>
          <span>Data prevista</span>
          <input name="due_date" type="date" defaultValue={editingRecord?.due_date ?? ""} />
        </label>
        <label>
          <span>Data realizada</span>
          <input name="paid_date" type="date" defaultValue={editingRecord?.paid_date ?? ""} />
        </label>
        <label>
          <span>Status</span>
          <select name="status" defaultValue={editingRecord?.status ?? "Previsto"}>
            <option>Previsto</option>
            <option>Confirmada</option>
            <option>Pendente</option>
            <option>Pago</option>
            <option>Entregue</option>
            <option>Cancelada</option>
            <option>Em análise</option>
          </select>
        </label>
        <label className="finance-wide">
          <span>Imagem do item</span>
          <input name="image" type="file" accept="image/*" />
        </label>
        {editingRecord?.image_url ? (
          <div className="finance-current-image">
            <img src={editingRecord.image_url} alt={`Imagem atual de ${editingRecord.type}`} />
            <span>Imagem atual do item</span>
          </div>
        ) : null}
        <label className="finance-wide">
          <span>Descrição / discriminação do item</span>
          <textarea name="description" rows={3} defaultValue={editingRecord?.description ?? ""} required />
        </label>
        <label className="finance-wide">
          <span>Observação de transparência</span>
          <textarea
            name="transparency_notes"
            rows={2}
            placeholder="Resumo público sem dados sensíveis."
            defaultValue={editingRecord?.transparency_notes ?? ""}
          />
        </label>
        {error ? <p className="form-error finance-wide">{error}</p> : null}
        <div className="finance-form-actions">
          <button className="button primary" type="submit" disabled={loading}>
            <Banknote size={17} />
            {loading ? "Salvando..." : editingRecord ? "Atualizar lançamento" : "Salvar lançamento"}
          </button>
          {editingRecord ? (
            <button className="button ghost" type="button" onClick={() => setEditingRecord(null)}>
              <X size={17} />
              Cancelar edição
            </button>
          ) : null}
        </div>
      </form>

      <div className="finance-table">
        {records.length === 0 ? <p>Nenhum lançamento financeiro cadastrado.</p> : null}
        {records.map((record) => (
          <article key={record.id}>
            <div>
              {record.image_url ? <img className="finance-table-thumb" src={record.image_url} alt={`Imagem de ${record.type}`} /> : null}
              <span className={`finance-badge ${record.direction}`}>{record.direction}</span>
              <strong>{record.type}</strong>
              <p>{record.description}</p>
            </div>
            <div>
              <span>Projeto</span>
              <strong>{projectLabels[record.project_type ?? ""] ?? record.project_type ?? "Sem projeto"}</strong>
            </div>
            <div>
              <span>Atleta</span>
              <strong>{record.athlete_name ?? "Não vinculado"}</strong>
            </div>
            <div>
              <span>Patrocinador</span>
              <strong>{record.sponsor_name ?? "Não informado"}</strong>
            </div>
            <div>
              <span>Valor</span>
              <strong>{formatMoney(record.amount_cents)}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{record.status}</strong>
            </div>
            <div className="finance-row-actions">
              <button type="button" onClick={() => setEditingRecord(record)} aria-label="Editar lançamento">
                <PencilLine size={16} />
              </button>
              <button type="button" onClick={() => removeRecord(record.id)} aria-label="Excluir lançamento">
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
