"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send, ShieldCheck, Upload } from "lucide-react";
import { formProjects, type FormProjectSlug } from "@/lib/content";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  options?: readonly string[];
};

const baseFields: Field[] = [
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

const requiredByProject: Record<FormProjectSlug, Set<string>> = {
  "app-11run": new Set(["name", "email", "phone"]),
  bolsas: new Set(["name", "email", "phone"]),
  "onze-futuro": new Set([
    "name",
    "email",
    "phone",
    "athlete_name",
    "birth_date",
    "father_name",
    "mother_name",
    "guardian",
    "guardian_rg",
    "guardian_cpf",
    "guardian_pix",
    "athlete_rg",
    "athlete_cpf",
    "address",
    "shoe_size",
    "height_cm",
    "weight_kg",
    "coach_name",
    "coach_phone",
    "coach_cref",
    "athlete_dream",
    "term_acceptor_name",
    "term_acceptor_cpf"
  ]),
  "circuito-futuro-11": new Set([
    "name",
    "email",
    "phone",
    "guardian_name",
    "guardian_cpf",
    "guardian_rg",
    "guardian_email",
    "guardian_phone",
    "athlete_name",
    "athlete_cpf",
    "athlete_rg",
    "birth_date",
    "race_event",
    "payment_plan",
    "term_acceptor_name",
    "term_acceptor_cpf"
  ]),
  "11-regional": new Set([
    "name",
    "email",
    "phone",
    "cpf",
    "rg",
    "address",
    "social_link",
    "best_marks",
    "competitions",
    "within_itatiba_radius",
    "term_acceptor_name",
    "term_acceptor_cpf"
  ])
};

const termsByProject: Partial<Record<FormProjectSlug, { title: string; clauses: string[] }>> = {
  "onze-futuro": {
    title: "Termo de aceite do Onze Futuro",
    clauses: [
      "O Onze Futuro é um projeto privado de desenvolvimento esportivo, formação de base, acompanhamento e oportunidade, sem promessa de resultado, patrocínio, bolsa ou permanência automática.",
      "A participação exige que o atleta tenha treinador formado, com CREF ativo, responsável pela condução técnica cotidiana dos treinos.",
      "Toda responsabilidade por acidentes, lesões, intercorrências ou danos antes, durante ou depois de treinos, competições, deslocamentos e atividades é integralmente dos pais ou responsáveis legais e dos profissionais que acompanham o atleta.",
      "A 11RUN pode apoiar indicando profissionais, caminhos, contatos e boas práticas, mas não assume a execução diária dos treinamentos.",
      "A ajuda de custo, quando concedida, será paga todo dia 15 de cada mês, podendo variar conforme critérios internos, disponibilidade financeira e patrocinadores.",
      "Valores de ajuda de custo, modelos de materiais, uniformes, equipamentos e periodicidade de recebimento podem variar conforme disponibilidade, patrocinadores, fornecedores e critérios internos do projeto.",
      "Atletas Onze Futuro terão inscrições gratuitas para todas as provas do Circuito 11, respeitando calendário, vagas disponíveis, regras técnicas e critérios de participação.",
      "Uma agência de publicidade poderá assessorar o processo de imagem, comunicação, perfil, postagens e posicionamento dos atletas dentro do projeto.",
      "Cada recebimento de ajuda, uniforme, material, inscrição ou benefício deverá ser confirmado no painel do site pelo responsável interno do projeto.",
      "O calendário de circuitos e provas é uma referência de desenvolvimento, sem obrigatoriedade de participação. Atletas que não participarem podem ficar fora do ranking, da certificação de tempos e de indicações a patrocinadores especiais.",
      "Podem existir patrocínios adicionais conforme desempenho, comportamento, assiduidade, evolução, visibilidade e interesse de parceiros, sem qualquer obrigação de concessão.",
      "As imagens enviadas poderão ser usadas pela 11RUN e por sua assessoria de comunicação para perfil, análise, divulgação institucional e postagens relacionadas ao projeto."
    ]
  },
  "circuito-futuro-11": {
    title: "Termo de autorização e regulamento do Circuito Futuro 11",
    clauses: [
      "O responsável legal autoriza a participação do atleta no Circuito Futuro 11, em provas de meio-fundo e fundo organizadas pela 11RUN.",
      "As provas seguem, por enquanto, referência técnica das regras oficiais do atletismo para 800 m e 1500 m, adaptadas às faixas etárias do projeto.",
      "As faixas do circuito consideram sempre a idade que o atleta completa no ano da competição.",
      "As provas por idade são: 10 anos - 800 m, 11 anos - 1000 m, 12 anos - 1500 m e 13 anos - 2000 m.",
      "Cada prova terá limite de 20 atletas por bateria/prova, podendo haver organização por ordem de inscrição, categoria ou critério técnico.",
      "O valor de inscrição é de R$ 50,00 por etapa ou R$ 150,00 para as 4 etapas, com necessidade de envio de comprovante de pagamento.",
      "A participação no ranking depende de inscrição confirmada, presença na etapa, resultado válido e conferência da organização.",
      "Toda responsabilidade por condições de saúde, deslocamento, autorização familiar e acompanhamento do atleta é dos pais ou responsáveis legais.",
      "A organização pode ajustar horários, baterias, regulamento, locais e calendário para preservar segurança, logística e qualidade técnica."
    ]
  },
  "11-regional": {
    title: "Termo de inscrição 11 Regional",
    clauses: [
      "O 11 Regional é uma iniciativa privada da 11RUN para atletas master com histórico, disciplina e potencial competitivo real.",
      "O atleta declara que mora em Itatiba ou em raio aproximado de até 40 km da cidade, condição necessária para avaliação inicial do projeto.",
      "A inscrição não garante aceite automático, vaga, patrocínio ou suporte financeiro. A equipe 11RUN fará análise técnica, territorial e competitiva.",
      "O atleta declara estar apto para treinos e competições, assumindo responsabilidade por sua condição de saúde e acompanhamento profissional quando necessário.",
      "Os dados informados poderão ser usados para contato, análise técnica, organização do pipeline e acompanhamento administrativo do projeto."
    ]
  }
};

const fieldGroups: Partial<Record<FormProjectSlug, { title: string; eyebrow: string; text: string; fields: string[] }[]>> = {
  "onze-futuro": [
    {
      eyebrow: "dados do cadastrante",
      title: "Quem está preenchendo",
      text: "Identificação da pessoa responsável por enviar o cadastro e receber o contato da equipe.",
      fields: ["name", "email", "phone", "city", "state", "profile_type", "message"]
    },
    {
      eyebrow: "dados do atleta",
      title: "Atleta e responsáveis",
      text: "Informações pessoais, familiares, medidas e conta PIX do responsável.",
      fields: [
        "athlete_name",
        "birth_date",
        "father_name",
        "mother_name",
        "guardian",
        "guardian_rg",
        "guardian_cpf",
        "guardian_pix",
        "athlete_rg",
        "athlete_cpf",
        "address",
        "shoe_size",
        "height_cm",
        "weight_kg",
        "athlete_dream"
      ]
    },
    {
      eyebrow: "treinador e histórico",
      title: "Contexto esportivo",
      text: "Dados do treinador, escola, modalidades, marcas e histórico competitivo.",
      fields: ["coach_name", "coach_phone", "coach_cref", "school", "sports", "best_marks", "competitions", "social_link"]
    }
  ],
  "circuito-futuro-11": [
    {
      eyebrow: "dados do responsável",
      title: "Responsável legal",
      text: "Dados de contato e documentos de quem autoriza a participação do atleta.",
      fields: ["name", "email", "phone", "city", "state", "guardian_name", "guardian_cpf", "guardian_rg", "guardian_email", "guardian_phone"]
    },
    {
      eyebrow: "dados do atleta",
      title: "Atleta e inscrição",
      text: "Dados do atleta, prova pretendida, equipe e plano de pagamento.",
      fields: ["athlete_name", "athlete_cpf", "athlete_rg", "birth_date", "race_event", "payment_plan", "team", "social_link", "message"]
    }
  ],
  "11-regional": [
    {
      eyebrow: "dados do atleta master",
      title: "Perfil competitivo",
      text: "Dados do atleta, documentos, endereço, redes sociais, provas e resultados para análise do projeto.",
      fields: [
        "name",
        "email",
        "phone",
        "city",
        "state",
        "cpf",
        "rg",
        "address",
        "social_link",
        "best_marks",
        "competitions",
        "within_itatiba_radius",
        "message"
      ]
    }
  ]
};

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

function getBirthDateLimits(project: FormProjectSlug) {
  const now = new Date();
  const format = (date: Date) => date.toISOString().slice(0, 10);

  if (project === "onze-futuro") {
    const max = new Date(now.getFullYear() - 9, now.getMonth(), now.getDate());
    const min = new Date(now.getFullYear() - 14, now.getMonth(), now.getDate() + 1);
    return { min: format(min), max: format(max), help: "Permitido apenas para atletas com idade entre 9 e 13 anos." };
  }

  if (project === "circuito-futuro-11") {
    const max = new Date(now.getFullYear() - 10, 11, 31);
    const min = new Date(now.getFullYear() - 13, 0, 1);
    return {
      min: format(min),
      max: format(max),
      help: "A categoria considera a idade que o atleta completa no ano da competição."
    };
  }

  return { min: undefined, max: undefined, help: "" };
}

export function LeadForm({ project }: { project: FormProjectSlug }) {
  const router = useRouter();
  const config = formProjects[project];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoCount, setPhotoCount] = useState(0);
  const [receiptName, setReceiptName] = useState("");
  const birthDateLimits = useMemo(() => getBirthDateLimits(project), [project]);
  const requiredFields = requiredByProject[project];
  const projectFields = useMemo<Field[]>(() => [...baseFields, ...(config.fields as readonly Field[])], [config.fields]);
  const groups = fieldGroups[project];
  const term = termsByProject[project];

  function findField(name: string) {
    return projectFields.find((field) => field.name === name);
  }

  function renderField(field: Field) {
    const required = requiredFields.has(field.name);
    const isTextarea = field.type === "textarea";
    const full = isTextarea || ["address", "message", "athlete_dream", "best_marks", "competitions", "social_link"].includes(field.name);

    return (
      <label key={field.name} className={full ? "full" : ""}>
        <span>{field.label}</span>
        {field.type === "select" ? (
          <select name={field.name} required={required}>
            <option value="">Selecione</option>
            {(field.options ?? []).map((option) => (
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
            min={field.name === "birth_date" ? birthDateLimits.min : undefined}
            max={field.name === "birth_date" ? birthDateLimits.max : undefined}
            inputMode={field.name.includes("cpf") ? "numeric" : undefined}
          />
        )}
        {field.name === "birth_date" && birthDateLimits.help ? <small>{birthDateLimits.help}</small> : null}
      </label>
    );
  }

  function validateFormData(formData: FormData) {
    if (project === "onze-futuro") {
      const photos = formData.getAll("athlete_photos").filter((item) => item instanceof File && item.size > 0);
      if (photos.length !== 5) return "Envie exatamente 5 fotos do atleta.";
      if (
        !isValidCpf(String(formData.get("athlete_cpf") ?? "")) ||
        !isValidCpf(String(formData.get("guardian_cpf") ?? "")) ||
        !isValidCpf(String(formData.get("term_acceptor_cpf") ?? ""))
      ) {
        return "Informe CPFs válidos para atleta, responsável e aceite do termo.";
      }
    }

    if (project === "circuito-futuro-11") {
      const receipt = formData.get("payment_receipt");
      if (!(receipt instanceof File) || receipt.size === 0) return "Envie o comprovante de pagamento da inscrição.";
      if (
        !isValidCpf(String(formData.get("athlete_cpf") ?? "")) ||
        !isValidCpf(String(formData.get("guardian_cpf") ?? "")) ||
        !isValidCpf(String(formData.get("term_acceptor_cpf") ?? ""))
      ) {
        return "Informe CPFs válidos para atleta, responsável e aceite do termo.";
      }
    }

    if (project === "11-regional") {
      if (!isValidCpf(String(formData.get("cpf") ?? "")) || !isValidCpf(String(formData.get("term_acceptor_cpf") ?? ""))) {
        return "Informe CPF válido para atleta e aceite do termo.";
      }
      if (String(formData.get("within_itatiba_radius") ?? "") !== "sim") {
        return "Para avançar, confirme residência em Itatiba ou em raio de até 40 km.";
      }
    }

    return "";
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    formData.set("project_type", config.projectType);
    formData.set("project_interest", config.label);

    const validationError = validateFormData(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao enviar formulário.");
      }

      router.push("/obrigado");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao enviar formulário.");
    } finally {
      setLoading(false);
    }
  }

  function renderGroupedFields() {
    if (!groups) {
      return <div className="form-grid">{projectFields.map(renderField)}</div>;
    }

    return groups.map((group) => (
      <section className="form-section" key={group.title}>
        <div className="form-section-head">
          <span className="eyebrow">{group.eyebrow}</span>
          <h3>{group.title}</h3>
          <p>{group.text}</p>
        </div>
        <div className="form-grid">{group.fields.map(findField).filter(Boolean).map((field) => renderField(field as Field))}</div>
      </section>
    ));
  }

  return (
    <form className="lead-form" onSubmit={onSubmit}>
      <input type="hidden" name="project_interest" value={config.label} />
      <input type="hidden" name="project_type" value={config.projectType} />

      {renderGroupedFields()}

      {project === "onze-futuro" ? (
        <section className="photo-upload-box">
          <div>
            <Upload size={20} />
            <strong>Fotos obrigatórias do atleta</strong>
            <p>Envie exatamente 5 fotos. Elas serão usadas para perfil, análise, assessoria de imagem e postagens do projeto.</p>
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
      ) : null}

      {project === "circuito-futuro-11" ? (
        <section className="photo-upload-box">
          <div>
            <Upload size={20} />
            <strong>Comprovante de pagamento</strong>
            <p>Inscrição: R$ 50,00 por etapa ou R$ 150,00 para as 4 etapas.</p>
          </div>
          <input
            type="file"
            name="payment_receipt"
            accept="image/*,.pdf"
            required
            onChange={(event) => setReceiptName(event.currentTarget.files?.[0]?.name ?? "")}
          />
          <span>{receiptName || "Nenhum comprovante selecionado"}</span>
        </section>
      ) : null}

      {term ? (
        <section className="terms-box">
          <div className="terms-heading">
            <ShieldCheck size={22} />
            <div>
              <strong>{term.title}</strong>
              <p>Leia e aceite para finalizar o envio.</p>
            </div>
          </div>
          <ol>
            {term.clauses.map((clause) => (
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
            <span>Li, compreendi e aceito integralmente o termo acima.</span>
          </label>
        </section>
      ) : null}

      <label className="accept">
        <input type="checkbox" name="accepted_contact" required />
        <span>Aceito receber contato da equipe 11RUN sobre este envio.</span>
      </label>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button primary submit-button" type="submit" disabled={loading}>
        {loading ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
        {project === "circuito-futuro-11" ? "Enviar inscrição" : "Enviar formulário"}
      </button>
    </form>
  );
}
