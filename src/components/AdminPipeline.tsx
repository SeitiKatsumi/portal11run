"use client";

import { useEffect, useMemo, useState, type FormEvent, type MouseEvent } from "react";
import { CheckCircle2, Download, Eye, ImageIcon, KeyRound, RefreshCw, X } from "lucide-react";
import { createPortal } from "react-dom";

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

type MemberRole = "atleta_onze_futuro" | "atleta_11_regional" | "atleta_11_bolsista" | "atleta_circuito_futuro";

type MemberAccount = {
  id: string;
  lead_id: string;
  role: MemberRole;
  username: string;
  active: number;
  created_at: string;
  updated_at: string;
};

const defaultStatuses = ["Cadastro recebido", "Em análise", "Aceitos", "Declinados", "Outros"];
const circuitoStatuses = ["Perfil redes sociais", "Inscrições solicitadas", "Aguardando pagamento", "Aceitas", "Declinados"];
const statusesByProject: Record<string, string[]> = {
  "circuito-futuro-11": circuitoStatuses
};
const receiptItems = ["Uniforme", "Material esportivo", "Ajuda de custo", "Inscrição ou evento", "Outro recebimento"];

const projectLabels: Record<string, string> = {
  "app-11run": "App 11Run",
  "onze-futuro": "Onze Futuro",
  "11-regional": "11 Master",
  "circuito-futuro-11": "Circuito Futuro 11",
  bolsas: "Bolsas"
};

const memberRolesByProject: Record<string, MemberRole | undefined> = {
  "onze-futuro": "atleta_onze_futuro",
  "11-regional": "atleta_11_regional"
};

const memberRoleLabels: Record<MemberRole, string> = {
  atleta_onze_futuro: "Atleta 11 Futuro",
  atleta_11_regional: "Atleta 11 Master",
  atleta_11_bolsista: "Atleta 11 Bolsista",
  atleta_circuito_futuro: "Atleta Circuito do Futuro"
};

const fieldLabels: Record<string, string> = {
  name: "Nome completo",
  email: "E-mail",
  phone: "WhatsApp",
  city: "Cidade",
  state: "Estado",
  profile_type: "Perfil",
  project_type: "Projeto",
  message: "Mensagem",
  athlete_name: "Nome do atleta",
  birth_date: "Data de nascimento",
  age: "Idade",
  category: "Categoria",
  school: "Escola",
  team: "Equipe",
  father_name: "Nome do pai",
  mother_name: "Nome da mãe",
  address: "Endereço",
  shoe_size: "Tamanho do calçado",
  height_cm: "Altura",
  weight_kg: "Peso",
  coach_name: "Nome do treinador",
  coach_phone: "Contato do treinador",
  coach_cref: "CREF do treinador",
  athlete_rg: "RG do atleta",
  athlete_cpf: "CPF do atleta",
  guardian_name: "Nome do responsável",
  guardian_email: "E-mail do responsável",
  guardian_phone: "WhatsApp do responsável",
  guardian_rg: "RG do responsável",
  guardian_cpf: "CPF do responsável",
  guardian_pix: "PIX do responsável",
  athlete_dream: "Maior sonho do atleta",
  cpf: "CPF",
  rg: "RG",
  social_link: "Perfil em redes sociais",
  best_marks: "Melhores marcas",
  competitions: "Competições",
  within_itatiba_radius: "Raio de 40 km de Itatiba",
  race_event: "Prova",
  payment_plan: "Plano de pagamento",
  payment_receipt_url: "Comprovante de pagamento",
  accepted_contact: "Aceite de contato",
  accepted_terms: "Aceite do termo",
  term_acceptor_name: "Nome de quem aceitou",
  term_acceptor_cpf: "CPF de quem aceitou",
  created_at: "Criado em"
};

const fieldGroups = [
  {
    title: "Dados do cadastrante",
    keys: ["name", "email", "phone", "city", "state", "profile_type", "message"]
  },
  {
    title: "Dados do atleta",
    keys: [
      "athlete_name",
      "birth_date",
      "age",
      "category",
      "school",
      "team",
      "athlete_rg",
      "athlete_cpf",
      "cpf",
      "rg",
      "father_name",
      "mother_name",
      "address",
      "shoe_size",
      "height_cm",
      "weight_kg",
      "athlete_dream",
      "social_link",
      "best_marks",
      "competitions",
      "within_itatiba_radius"
    ]
  },
  {
    title: "Treinador e responsáveis",
    keys: ["coach_name", "coach_phone", "coach_cref", "guardian_name", "guardian_email", "guardian_phone", "guardian_rg", "guardian_cpf", "guardian_pix"]
  },
  {
    title: "Projeto, termos e pagamento",
    keys: ["project_type", "race_event", "payment_plan", "payment_receipt_url", "accepted_contact", "accepted_terms", "term_acceptor_name", "term_acceptor_cpf"]
  }
];

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

function formatFieldName(key: string) {
  return fieldLabels[key] ?? key.replaceAll("_", " ");
}

function formatFieldValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === null || value === undefined || value === "") return "Não informado";
  return String(value);
}

function isInteractiveTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest("button, a, input, select, textarea, label, form, details, summary"));
}

export function AdminPipeline({ initialLeads, initialMemberAccounts }: { initialLeads: AdminLead[]; initialMemberAccounts: MemberAccount[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [memberAccounts, setMemberAccounts] = useState(initialMemberAccounts);
  const [projectFilter, setProjectFilter] = useState("todos");
  const [updating, setUpdating] = useState("");
  const [memberError, setMemberError] = useState("");
  const [memberErrorLead, setMemberErrorLead] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const selectedLead = useMemo(() => leads.find((lead) => lead.id === selectedLeadId) ?? null, [leads, selectedLeadId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(selectedLead));
    return () => document.body.classList.remove("modal-open");
  }, [selectedLead]);

  const projects = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => lead.project_type))).sort();
  }, [leads]);

  const filteredLeads = useMemo(() => {
    if (projectFilter === "todos") return leads;
    return leads.filter((lead) => lead.project_type === projectFilter);
  }, [leads, projectFilter]);

  const activeStatuses = useMemo(() => {
    if (projectFilter !== "todos") return statusesByProject[projectFilter] ?? defaultStatuses;
    return Array.from(new Set([...defaultStatuses, ...circuitoStatuses, ...leads.map((lead) => lead.pipeline_status)]));
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

  async function saveMemberAccess(event: FormEvent<HTMLFormElement>, lead: AdminLead) {
    event.preventDefault();
    setMemberError("");
    setMemberErrorLead("");
    setUpdating(lead.id);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leadId: lead.id,
        role: formData.get("role"),
        username: formData.get("username"),
        password: formData.get("password"),
        active: formData.get("active") === "on"
      })
    });
    const result = await response.json();
    setUpdating("");

    if (!response.ok) {
      setMemberError(result.error ?? "Erro ao salvar acesso.");
      setMemberErrorLead(lead.id);
      return;
    }

    setMemberAccounts((current) => [result.account, ...current.filter((account) => account.lead_id !== lead.id)]);
  }

  function openLeadModalFromCard(event: MouseEvent<HTMLElement>, lead: AdminLead) {
    if (isInteractiveTarget(event.target)) return;
    setSelectedLeadId(lead.id);
  }

  const selectedPayload = selectedLead ? parseJson<Record<string, unknown>>(selectedLead.payload_json, {}) : {};
  const selectedPhotos = selectedLead ? parseJson<string[]>(selectedLead.photos_json, []) : [];
  const selectedProjectLabel = selectedLead ? projectLabels[selectedLead.project_type] ?? selectedLead.project_type : "";
  const selectedDetails: Record<string, unknown> = selectedLead
    ? {
        ...selectedPayload,
        project_type: selectedProjectLabel,
        created_at: formatDate(selectedLead.created_at)
      }
    : {};
  const groupedKeys = new Set(fieldGroups.flatMap((group) => group.keys));
  const remainingDetails = Object.entries(selectedDetails).filter(
    ([key, value]) => !groupedKeys.has(key) && !["id", "photos", "receipts", "updated_at"].includes(key) && formatFieldValue(value) !== "Não informado"
  );

  function detailEntries(keys: string[]) {
    return keys
      .map((key) => [key, selectedDetails[key]] as const)
      .filter(([, value]) => formatFieldValue(value) !== "Não informado");
  }

  function renderDetailValue(key: string, value: unknown) {
    if (key === "payment_receipt_url" && typeof value === "string" && value) {
      return (
        <a href={value} target="_blank" rel="noreferrer">
          Abrir comprovante
        </a>
      );
    }
    return formatFieldValue(value);
  }

  const detailModal =
    selectedLead && selectedPayload ? (
      <div className="lead-detail-backdrop" role="dialog" aria-modal="true" aria-label={`Cadastro de ${selectedLead.athlete_name || selectedLead.name}`} onClick={() => setSelectedLeadId(null)}>
        <div className="lead-detail-modal" onClick={(event) => event.stopPropagation()}>
          <button className="modal-close" type="button" onClick={() => setSelectedLeadId(null)} aria-label="Fechar cadastro">
            <X size={20} />
          </button>

          <div className="lead-detail-head">
            <div>
              <span className="eyebrow">{selectedProjectLabel}</span>
              <h2>{selectedLead.athlete_name || selectedLead.name}</h2>
              <p>
                {selectedLead.name} · {selectedLead.email} · {selectedLead.phone}
              </p>
            </div>
            {selectedPhotos.length > 0 ? (
              <a className="button primary" href={`/api/admin/leads/${selectedLead.id}/photos`} download>
                <Download size={17} />
                Baixar fotos
              </a>
            ) : null}
          </div>

          {selectedPhotos.length > 0 ? (
            <div className="lead-photo-downloads">
              {selectedPhotos.map((photo, index) => (
                <figure key={photo}>
                  <img src={photo} alt={`Foto ${index + 1} de ${selectedLead.athlete_name || selectedLead.name}`} />
                  <a href={photo} download>
                    <Download size={15} />
                    Foto {index + 1}
                  </a>
                </figure>
              ))}
            </div>
          ) : (
            <div className="admin-no-photo">
              <ImageIcon size={16} />
              Sem fotos anexadas
            </div>
          )}

          <div className="lead-detail-grid">
            {fieldGroups.map((group) => {
              const entries = detailEntries(group.keys);
              if (entries.length === 0) return null;

              return (
                <section className="lead-detail-group" key={group.title}>
                  <h3>{group.title}</h3>
                  <dl>
                    {entries.map(([key, value]) => (
                      <div key={key}>
                        <dt>{formatFieldName(key)}</dt>
                        <dd>{renderDetailValue(key, value)}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}

            {remainingDetails.length > 0 ? (
              <section className="lead-detail-group">
                <h3>Outras informações</h3>
                <dl>
                  {remainingDetails.map(([key, value]) => (
                    <div key={key}>
                      <dt>{formatFieldName(key)}</dt>
                      <dd>{renderDetailValue(key, value)}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    ) : null;

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
        {activeStatuses.map((status) => {
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
                const memberRole = memberRolesByProject[lead.project_type];
                const memberAccount = memberAccounts.find((account) => account.lead_id === lead.id);
                const canCreateMember = memberRole && ["Aceitos", "Aceitas"].includes(lead.pipeline_status);

                return (
                  <article
                    className="admin-card clickable"
                    key={lead.id}
                    onClick={(event) => openLeadModalFromCard(event, lead)}
                  >
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
                        {(statusesByProject[lead.project_type] ?? defaultStatuses).map((option) => (
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

                    <button className="admin-view-button" type="button" onClick={() => setSelectedLeadId(lead.id)}>
                      <Eye size={16} />
                      Ver dados completos
                    </button>

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

                    {memberRole ? (
                      <form className="member-access-card" onSubmit={(event) => saveMemberAccess(event, lead)}>
                        <div>
                          <KeyRound size={17} />
                          <strong>Acesso de membro</strong>
                        </div>
                        {!canCreateMember ? (
                          <p>O acesso abre quando o cadastro estiver na etapa Aceitos.</p>
                        ) : (
                          <>
                            <input type="hidden" name="role" value={memberAccount?.role ?? memberRole} />
                            <label>
                              <span>Perfil</span>
                              <input value={memberRoleLabels[memberAccount?.role ?? memberRole]} disabled />
                            </label>
                            <label>
                              <span>Usuário</span>
                              <input name="username" defaultValue={memberAccount?.username ?? lead.email} required />
                            </label>
                            <label>
                              <span>{memberAccount ? "Nova senha (opcional)" : "Senha inicial"}</span>
                              <input name="password" type="password" minLength={6} required={!memberAccount} />
                            </label>
                            <label className="member-active-check">
                              <input name="active" type="checkbox" defaultChecked={memberAccount ? memberAccount.active === 1 : true} />
                              <span>Acesso ativo</span>
                            </label>
                            {memberError && memberErrorLead === lead.id ? <p className="form-error">{memberError}</p> : null}
                            <button className="button primary" type="submit" disabled={updating === lead.id}>
                              {memberAccount ? "Atualizar acesso" : "Liberar dashboard"}
                            </button>
                          </>
                        )}
                      </form>
                    ) : null}
                  </article>
                );
              })}
            </section>
          );
        })}
      </div>
      {mounted && detailModal ? createPortal(detailModal, document.body) : null}
    </section>
  );
}
