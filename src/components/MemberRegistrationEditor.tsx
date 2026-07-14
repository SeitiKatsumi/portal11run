"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PencilLine, Save, X } from "lucide-react";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "textarea";
};

const editableFields: FieldConfig[] = [
  { key: "name", label: "Nome do cadastrante" },
  { key: "email", label: "E-mail", type: "email" },
  { key: "phone", label: "WhatsApp", type: "tel" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
  { key: "profile_type", label: "Perfil" },
  { key: "message", label: "Mensagem", type: "textarea" },
  { key: "athlete_name", label: "Nome do atleta" },
  { key: "birth_date", label: "Data de nascimento", type: "date" },
  { key: "father_name", label: "Nome do pai" },
  { key: "mother_name", label: "Nome da mãe" },
  { key: "guardian_name", label: "Nome do responsável" },
  { key: "guardian_rg", label: "RG do responsável" },
  { key: "guardian_cpf", label: "CPF do responsável" },
  { key: "guardian_pix", label: "PIX do responsável" },
  { key: "athlete_rg", label: "RG do atleta" },
  { key: "athlete_cpf", label: "CPF do atleta" },
  { key: "address", label: "Endereço", type: "textarea" },
  { key: "shoe_size", label: "Tamanho do calçado", type: "number" },
  { key: "height_cm", label: "Altura (cm)", type: "number" },
  { key: "weight_kg", label: "Peso (kg)", type: "number" },
  { key: "coach_name", label: "Nome do treinador" },
  { key: "coach_phone", label: "Contato do treinador", type: "tel" },
  { key: "coach_cref", label: "CREF do treinador" },
  { key: "athlete_dream", label: "Maior sonho do atleta", type: "textarea" },
  { key: "school", label: "Escola" },
  { key: "team", label: "Equipe" },
  { key: "best_marks", label: "Melhores marcas", type: "textarea" },
  { key: "competitions", label: "Competições", type: "textarea" },
  { key: "social_link", label: "Perfil em redes sociais" }
];

export function MemberRegistrationEditor({ payload }: { payload: Record<string, string | boolean | string[]> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setSaving(true);
    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    const response = await fetch("/api/members/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setStatus(result.error ?? "Não foi possível salvar as alterações.");
      return;
    }

    setStatus("Cadastro atualizado com sucesso.");
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="member-edit-box">
      <button className="button ghost" type="button" onClick={() => setOpen((current) => !current)}>
        {open ? <X size={17} /> : <PencilLine size={17} />}
        {open ? "Fechar edição" : "Editar cadastro"}
      </button>
      {status ? <p className="form-status">{status}</p> : null}
      {open ? (
        <form className="member-profile-form" onSubmit={onSubmit}>
          {editableFields.map((field) => {
            const value = payload[field.key];
            const defaultValue = Array.isArray(value) ? value.join(", ") : typeof value === "boolean" ? (value ? "Sim" : "Não") : String(value ?? "");
            return (
              <label key={field.key} className={field.type === "textarea" ? "wide" : undefined}>
                <span>{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea name={field.key} rows={3} defaultValue={defaultValue} />
                ) : (
                  <input name={field.key} type={field.type ?? "text"} defaultValue={defaultValue} />
                )}
              </label>
            );
          })}
          <button className="button primary" type="submit" disabled={saving}>
            <Save size={17} />
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
