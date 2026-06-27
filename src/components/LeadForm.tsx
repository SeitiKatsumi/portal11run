"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { formProjects, type FormProjectSlug } from "@/lib/content";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: readonly string[];
};

const generalFields: Field[] = [
  { name: "name", label: "Nome completo" },
  { name: "email", label: "E-mail", type: "email" },
  { name: "phone", label: "WhatsApp" },
  { name: "city", label: "Cidade" },
  { name: "state", label: "Estado" },
  {
    name: "profile_type",
    label: "Perfil",
    type: "select",
    options: ["atleta", "pai/mae/responsavel", "treinador", "projeto", "escola", "universidade", "parceiro"]
  },
  { name: "message", label: "Mensagem", type: "textarea" }
];

export function LeadForm({ project }: { project: FormProjectSlug }) {
  const router = useRouter();
  const config = formProjects[project];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fields = useMemo<Field[]>(() => [...generalFields, ...(config.fields as readonly Field[])], [config.fields]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          project_type: config.projectType,
          accepted_contact: formData.get("accepted_contact") === "on"
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao enviar cadastro.");
      }

      router.push("/obrigado");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao enviar cadastro.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <input type="hidden" name="project_interest" value={config.label} />
      <div className="form-grid">
        {fields.map((field) => (
          <label key={field.name} className={field.type === "textarea" ? "full" : ""}>
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select name={field.name} required={field.name === "profile_type"}>
                <option value="">Selecione</option>
                {field.options?.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea name={field.name} rows={5} placeholder={field.placeholder} />
            ) : (
              <input
                name={field.name}
                type={field.type ?? "text"}
                placeholder={field.placeholder}
                required={["name", "email", "phone"].includes(field.name)}
              />
            )}
          </label>
        ))}
      </div>

      <label className="accept">
        <input type="checkbox" name="accepted_contact" required />
        <span>Aceito receber contato da equipe 11RUN sobre este cadastro.</span>
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button primary submit-button" type="submit" disabled={loading}>
        {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
        Enviar cadastro
      </button>
    </form>
  );
}
