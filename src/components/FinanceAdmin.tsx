"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Banknote, PencilLine, Trash2, X } from "lucide-react";
import type { FinancialRecord } from "@/lib/finance";
import type { SponsorRecord } from "@/lib/sponsors";

type AdminLead = {
  id: string;
  name: string;
  athlete_name?: string | null;
  project_type: string;
  email: string;
};

type FinanceAdminProps = {
  initialRecords: FinancialRecord[];
  leads: AdminLead[];
  sponsors: SponsorRecord[];
};

const projectLabels: Record<string, string> = {
  "onze-futuro": "11 Futuro",
  "11-regional": "11 Master",
  "circuito-futuro-11": "Circuito Futuro 11",
  bolsas: "Bolsas",
  "app-11run": "App 11Run"
};

const financeTypeOptions = [
  "Ajuda Mensal",
  "Tênis",
  "Uniforme",
  "Outros Materiais",
  "Transporte",
  "Hospedagem",
  "Alimentação",
  "Suplementação",
  "Outros"
];

function formatMoney(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function centsToInput(cents: number) {
  return String((cents / 100).toFixed(2)).replace(".", ",");
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function financeTypeCategory(type: string) {
  if (financeTypeOptions.includes(type)) return type;

  const normalized = normalizeText(type);
  if (normalized.includes("ajuda") || normalized.includes("custo")) return "Ajuda Mensal";
  if (normalized.includes("tenis")) return "Tênis";
  if (normalized.includes("uniforme")) return "Uniforme";
  if (normalized.includes("transporte")) return "Transporte";
  if (normalized.includes("hospedagem")) return "Hospedagem";
  if (normalized.includes("aliment")) return "Alimentação";
  if (normalized.includes("suplement")) return "Suplementação";
  if (normalized.includes("material")) return "Outros Materiais";
  return "Outros";
}

function leadLabel(lead: AdminLead) {
  return `${lead.athlete_name || lead.name} · ${projectLabels[lead.project_type] ?? lead.project_type}`;
}

function sponsorFilterKey(record: FinancialRecord) {
  return record.sponsor_id || (record.sponsor_name ? `name:${record.sponsor_name}` : "sem-origem");
}

export function FinanceAdmin({ initialRecords, leads, sponsors }: FinanceAdminProps) {
  const [records, setRecords] = useState(initialRecords);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [typeFilter, setTypeFilter] = useState("todos");
  const [sponsorFilter, setSponsorFilter] = useState("todos");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const totals = useMemo(() => {
    return records.reduce(
      (acc, record) => {
        if (record.direction === "entrada") acc.entries += record.amount_cents;
        if (record.direction === "saida") acc.expenses += record.amount_cents;
        acc.projects.add(record.project_type ?? "sem-projeto");
        if (record.athlete_name) acc.athletes.add(record.athlete_name);
        if (record.sponsor_id || record.sponsor_name) acc.sponsors.add(sponsorFilterKey(record));
        return acc;
      },
      { entries: 0, expenses: 0, projects: new Set<string>(), athletes: new Set<string>(), sponsors: new Set<string>() }
    );
  }, [records]);

  const sponsorFilterOptions = useMemo(() => {
    const oldSponsorNames = records
      .filter((record) => !record.sponsor_id && record.sponsor_name)
      .map((record) => record.sponsor_name as string)
      .filter((name, index, names) => names.indexOf(name) === index);

    return [
      ...sponsors.map((sponsor) => ({ value: sponsor.id, label: sponsor.name })),
      ...oldSponsorNames.map((name) => ({ value: `name:${name}`, label: name }))
    ];
  }, [records, sponsors]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const typeMatches = typeFilter === "todos" || financeTypeCategory(record.type) === typeFilter;
      const sponsorMatches = sponsorFilter === "todos" || sponsorFilterKey(record) === sponsorFilter;
      return typeMatches && sponsorMatches;
    });
  }, [records, sponsorFilter, typeFilter]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    if (editingRecord?.id) {
      formData.set("id", editingRecord.id);
    } else if (formData.getAll("lead_ids").length === 0) {
      setLoading(false);
      setError("Selecione pelo menos um atleta aceito para criar o lançamento.");
      return;
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

    setRecords((current) => {
      if (editingRecord) {
        return current.map((record) => (record.id === result.record.id ? result.record : record));
      }

      const createdRecords = Array.isArray(result.records) ? result.records : result.record ? [result.record] : [];
      return [...createdRecords, ...current];
    });
    setEditingRecord(null);
    event.currentTarget.reset();
  }

  async function removeRecord(id: string) {
    const response = await fetch(`/api/admin/finance?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setRecords((current) => current.filter((record) => record.id !== id));
  }

  const editingSponsorValue =
    editingRecord?.sponsor_id ?? sponsors.find((sponsor) => sponsor.name === editingRecord?.sponsor_name)?.id ?? "";

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

        {editingRecord ? (
          <label>
            <span>Atleta aceito / cadastro vinculado</span>
            <select name="lead_id" required defaultValue={editingRecord.lead_id}>
              <option value="">Selecione</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {leadLabel(lead)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <fieldset className="finance-athlete-picker">
            <legend>Atletas aceitos / cadastros vinculados</legend>
            <div className="finance-athlete-options">
              {leads.map((lead) => (
                <label className="finance-athlete-option" key={lead.id}>
                  <input type="checkbox" name="lead_ids" value={lead.id} />
                  <span>{leadLabel(lead)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <label>
          <span>Tipo</span>
          <select name="type" required defaultValue={editingRecord ? financeTypeCategory(editingRecord.type) : ""}>
            <option value="">Selecione</option>
            {financeTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Valor</span>
          <input name="amount" placeholder="500,00" defaultValue={editingRecord ? centsToInput(editingRecord.amount_cents) : ""} required />
        </label>
        <label>
          <span>Origem do investimento</span>
          <select name="sponsor_id" defaultValue={editingSponsorValue}>
            <option value="">Selecione o patrocinador/apoiador</option>
            {sponsors.map((sponsor) => (
              <option key={sponsor.id} value={sponsor.id}>
                {sponsor.name} · {sponsor.category}
              </option>
            ))}
          </select>
          {editingRecord?.sponsor_name && !editingSponsorValue ? (
            <input type="hidden" name="sponsor_name" value={editingRecord.sponsor_name} />
          ) : null}
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
            {loading ? "Salvando..." : editingRecord ? "Atualizar lançamento" : "Salvar lançamento(s)"}
          </button>
          {editingRecord ? (
            <button className="button ghost" type="button" onClick={() => setEditingRecord(null)}>
              <X size={17} />
              Cancelar edição
            </button>
          ) : null}
        </div>
      </form>

      <div className="finance-filters">
        <label>
          <span>Filtrar por tipo</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="todos">Todos os tipos</option>
            {financeTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Filtrar por origem</span>
          <select value={sponsorFilter} onChange={(event) => setSponsorFilter(event.target.value)}>
            <option value="todos">Todas as origens</option>
            {sponsorFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="finance-table">
        {records.length === 0 ? <p>Nenhum lançamento financeiro cadastrado.</p> : null}
        {records.length > 0 && filteredRecords.length === 0 ? <p>Nenhum lançamento encontrado para os filtros selecionados.</p> : null}
        {filteredRecords.map((record) => (
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
              <span>Origem</span>
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
