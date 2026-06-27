"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Loader2, Send, ShieldCheck, Upload } from "lucide-react";
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
    options: ["atleta", "pai/mãe/responsável", "treinador", "projeto", "escola", "universidade", "parceiro"]
  },
  { name: "message", label: "Mensagem", type: "textarea" }
];

const onzeFuturoRequiredFields = new Set([
  "athlete_name",
  "birth_date",
  "father_name",
  "mother_name",
  "guardian",
  "guardian_rg",
  "guardian_cpf",
  "athlete_rg",
  "athlete_cpf",
  "address",
  "shoe_size",
  "height_cm",
  "weight_kg",
  "coach_name",
  "coach_phone",
  "coach_cref",
  "school",
  "athlete_dream"
]);

const termClauses = [
  "O Onze Futuro é um projeto privado de desenvolvimento esportivo, formação de base, acompanhamento e oportunidade, sem promessa de resultado, patrocínio, bolsa ou permanência automática.",
  "A participação exige que o atleta tenha treinador formado, com CREF ativo, responsável pela condução técnica cotidiana dos treinos.",
  "Toda responsabilidade por acidentes, lesões, intercorrências ou danos antes, durante ou depois de treinos, competições, deslocamentos e atividades é integralmente dos pais ou responsáveis legais e dos profissionais que acompanham o atleta.",
  "A 11RUN pode apoiar indicando profissionais, caminhos, contatos e boas práticas, mas não assume a execução diária dos treinamentos.",
  "Valores de ajuda de custo, modelos de materiais, uniformes, equipamentos e periodicidade de recebimento podem variar conforme disponibilidade, patrocinadores, fornecedores e critérios internos do projeto.",
  "Cada recebimento de ajuda, uniforme, material ou benefício deverá ser confirmado no painel do site pelo responsável interno do projeto.",
  "O calendário de circuitos e provas é uma referência de desenvolvimento, sem obrigatoriedade de participação. Atletas que não participarem podem ficar fora do ranking, da certificação de tempos e de indicações a patrocinadores especiais.",
  "Podem existir patrocínios adicionais conforme desempenho, comportamento, assiduidade, evolução, visibilidade e interesse de parceiros, sem qualquer obrigação de concessão.",
  "As imagens enviadas poderão ser usadas pela 11RUN para perfil, análise, divulgação institucional e postagens relacionadas ao projeto, respeitando o contexto esportivo e a comunicação do ecossistema."
];

function getBirthDateLimits() {
  const now = new Date();
  const max = new Date(now.getFullYear() - 9, now.getMonth(), now.getDate());
  const min = new Date(now.getFullYear() - 14, now.getMonth(), now.getDate() + 1);
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { min: format(min), max: format(max) };
}

function cleanCpf(value: string) {
  return value.replace(/\D/g, "");
}

function isValidCpf(value: string) {
  const cpf = cleanCpf(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);
  const calcDigit = (factor: number) => {
    const total = digits.slice(0, factor - 1).reduce((sum, digit, index) => sum + digit * (factor - index), 0);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calcDigit(10) === digits[9] && calcDigit(11) === digits[10];
}

export function LeadForm({ project }: { project: FormProjectSlug }) {
  const router = useRouter();
  const config = formProjects[project];
  const isOnzeFuturo = project === "onze-futuro";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const birthDateLimits = useMemo(getBirthDateLimits, []);
  const fields = useMemo<Field[]>(() => [...generalFields, ...(config.fields as readonly Field[])], [config.fields]);
  const projectFields = useMemo<Field[]>(() => [...(config.fields as readonly Field[])], [config.fields]);

  function renderField(field: Field) {
    const required = ["name", "email", "phone"].includes(field.name) || (isOnzeFuturo && onzeFuturoRequiredFields.has(field.name));
    const isTextarea = field.type === "textarea";

    return (
      <label key={field.name} className={isTextarea || field.name === "address" ? "full" : ""}>
        <span>{field.label}</span>
        {field.type === "select" ? (
          <select name={field.name} required={required || field.name === "profile_type"}>
            <option value="">Selecione</option>
            {field.options?.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea name={field.name} rows={5} placeholder={field.placeholder} required={required} />
        ) : (
          <input
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            required={required}
            min={isOnzeFuturo && field.name === "birth_date" ? birthDateLimits.min : undefined}
            max={isOnzeFuturo && field.name === "birth_date" ? birthDateLimits.max : undefined}
          />
        )}
        {isOnzeFuturo && field.name === "birth_date" ? (
          <small>Permitido apenas para atletas com idade entre 9 e 13 anos.</small>
        ) : null}
      </label>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.set("project_type", config.projectType);
    formData.set("project_interest", config.label);

    if (isOnzeFuturo) {
      const photos = formData.getAll("athlete_photos").filter((item) => item instanceof File && item.size > 0);
      const acceptorCpf = String(formData.get("term_acceptor_cpf") ?? "");
      const athleteCpf = String(formData.get("athlete_cpf") ?? "");
      const guardianCpf = String(formData.get("guardian_cpf") ?? "");

      if (photos.length !== 5) {
        setError("Envie exatamente 5 fotos do atleta.");
        return;
      }

      if (!isValidCpf(athleteCpf) || !isValidCpf(guardianCpf) || !isValidCpf(acceptorCpf)) {
        setError("Informe CPFs válidos para atleta, responsável e aceite do termo.");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        body: formData
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
      <input type="hidden" name="project_type" value={config.projectType} />

      {isOnzeFuturo ? (
        <>
          <section className="form-section">
            <div className="form-section-head">
              <span className="eyebrow">dados do cadastrante</span>
              <h3>Quem está preenchendo</h3>
              <p>Use estes campos para identificar a pessoa responsável por enviar o cadastro e receber o contato da equipe.</p>
            </div>
            <div className="form-grid">{generalFields.map(renderField)}</div>
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <span className="eyebrow">dados do atleta</span>
              <h3>Atleta e responsáveis</h3>
              <p>Informações pessoais, familiares e medidas do atleta para análise do projeto Onze Futuro.</p>
            </div>
            <div className="form-grid">
              {projectFields
                .filter((field) =>
                  [
                    "athlete_name",
                    "birth_date",
                    "father_name",
                    "mother_name",
                    "guardian",
                    "guardian_rg",
                    "guardian_cpf",
                    "athlete_rg",
                    "athlete_cpf",
                    "address",
                    "shoe_size",
                    "height_cm",
                    "weight_kg",
                    "athlete_dream"
                  ].includes(field.name)
                )
                .map(renderField)}
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-head">
              <span className="eyebrow">treinador e histórico</span>
              <h3>Contexto esportivo</h3>
              <p>Dados do treinador, escola, modalidades, marcas e histórico competitivo do atleta.</p>
            </div>
            <div className="form-grid">
              {projectFields
                .filter((field) =>
                  [
                    "coach_name",
                    "coach_phone",
                    "coach_cref",
                    "school",
                    "sports",
                    "best_marks",
                    "competitions",
                    "social_link"
                  ].includes(field.name)
                )
                .map(renderField)}
            </div>
          </section>
        </>
      ) : (
        <div className="form-grid">{fields.map(renderField)}</div>
      )}

      {isOnzeFuturo ? (
        <>
          <section className="photo-upload-box">
            <div>
              <Upload size={20} />
              <strong>Fotos obrigatórias do atleta</strong>
              <p>Envie exatamente 5 fotos. Elas serão usadas para perfil, análise e postagens do projeto.</p>
            </div>
            <input
              type="file"
              name="athlete_photos"
              accept="image/*"
              multiple
              required
              onChange={(event) => setPhotoCount(event.currentTarget.files?.length ?? 0)}
            />
            <span>{photoCount}/5 fotos selecionadas</span>
          </section>

          <section className="terms-box">
            <div className="terms-heading">
              <ShieldCheck size={22} />
              <div>
                <strong>Termo de aceite do Onze Futuro</strong>
                <p>Leia e aceite para finalizar o cadastro.</p>
              </div>
            </div>
            <ol>
              {termClauses.map((clause) => (
                <li key={clause}>{clause}</li>
              ))}
            </ol>
            <div className="form-grid">
              <label>
                <span>Nome de quem aceita o termo</span>
                <input name="term_acceptor_name" required />
              </label>
              <label>
                <span>CPF de quem aceita o termo</span>
                <input name="term_acceptor_cpf" required inputMode="numeric" placeholder="000.000.000-00" />
              </label>
            </div>
            <label className="accept">
              <input type="checkbox" name="accepted_terms" required />
              <span>Li, compreendi e aceito integralmente o termo do projeto Onze Futuro.</span>
            </label>
          </section>
        </>
      ) : null}

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
