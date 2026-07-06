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
    options: ["atleta", "pai/mÃ£e/responsÃ¡vel", "treinador", "projeto", "escola", "universidade", "parceiro"]
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
      "O Onze Futuro Ã© um projeto privado de desenvolvimento esportivo, formaÃ§Ã£o de base, acompanhamento e oportunidade, sem promessa de resultado, patrocÃ­nio, bolsa ou permanÃªncia automÃ¡tica.",
      "A participaÃ§Ã£o exige que o atleta tenha treinador formado, com CREF ativo, responsÃ¡vel pela conduÃ§Ã£o tÃ©cnica cotidiana dos treinos.",
      "Toda responsabilidade por acidentes, lesÃµes, intercorrÃªncias ou danos antes, durante ou depois de treinos, competiÃ§Ãµes, deslocamentos e atividades Ã© integralmente dos pais ou responsÃ¡veis legais e dos profissionais que acompanham o atleta.",
      "A 11RUN pode apoiar indicando profissionais, caminhos, contatos e boas prÃ¡ticas, mas nÃ£o assume a execuÃ§Ã£o diÃ¡ria dos treinamentos.",
      "A ajuda de custo, quando concedida, serÃ¡ paga todo dia 15 de cada mÃªs, podendo variar conforme critÃ©rios internos, disponibilidade financeira e patrocinadores.",
      "Valores de ajuda de custo, modelos de materiais, uniformes, equipamentos e periodicidade de recebimento podem variar conforme disponibilidade, patrocinadores, fornecedores e critÃ©rios internos do projeto.",
      "Atletas Onze Futuro terÃ£o inscriÃ§Ãµes gratuitas para todas as provas do Circuito 11, respeitando calendÃ¡rio, vagas disponÃ­veis, regras tÃ©cnicas e critÃ©rios de participaÃ§Ã£o.",
      "Uma agÃªncia de publicidade poderÃ¡ assessorar o processo de imagem, comunicaÃ§Ã£o, perfil, postagens e posicionamento dos atletas dentro do projeto.",
      "Cada recebimento de ajuda, uniforme, material, inscriÃ§Ã£o ou benefÃ­cio deverÃ¡ ser confirmado no painel do site pelo responsÃ¡vel interno do projeto.",
      "O calendÃ¡rio de circuitos e provas Ã© uma referÃªncia de desenvolvimento, sem obrigatoriedade de participaÃ§Ã£o. Atletas que nÃ£o participarem podem ficar fora do ranking, da certificaÃ§Ã£o de tempos e de indicaÃ§Ãµes a patrocinadores especiais.",
      "Podem existir patrocÃ­nios adicionais conforme desempenho, comportamento, assiduidade, evoluÃ§Ã£o, visibilidade e interesse de parceiros, sem qualquer obrigaÃ§Ã£o de concessÃ£o.",
      "As imagens enviadas poderÃ£o ser usadas pela 11RUN e por sua assessoria de comunicaÃ§Ã£o para perfil, anÃ¡lise, divulgaÃ§Ã£o institucional e postagens relacionadas ao projeto."
    ]
  },
  "circuito-futuro-11": {
    title: "Termo de autorizaÃ§Ã£o e regulamento do Circuito Futuro 11",
    clauses: [
      "O responsÃ¡vel legal autoriza a participaÃ§Ã£o do atleta no Circuito Futuro 11, em provas de meio-fundo e fundo organizadas pela 11RUN.",
      "As provas seguem, por enquanto, referÃªncia tÃ©cnica das regras oficiais do atletismo para 800 m e 1500 m, adaptadas Ã s faixas etÃ¡rias do projeto.",
      "As faixas do circuito consideram sempre a idade que o atleta completa no ano da competiÃ§Ã£o.",
      "As provas por idade sÃ£o: 10 anos - 800 m, 11 anos - 1000 m, 12 anos - 1500 m e 13 anos - 2000 m.",
      "Cada prova terÃ¡ limite de 20 atletas por bateria/prova, podendo haver organizaÃ§Ã£o por ordem de inscriÃ§Ã£o, categoria ou critÃ©rio tÃ©cnico.",
      "O valor de inscriÃ§Ã£o Ã© de R$ 50,00 por etapa ou R$ 150,00 para as 4 etapas, com necessidade de envio de comprovante de pagamento.",
      "A participaÃ§Ã£o no ranking depende de inscriÃ§Ã£o confirmada, presenÃ§a na etapa, resultado vÃ¡lido e conferÃªncia da organizaÃ§Ã£o.",
      "Toda responsabilidade por condiÃ§Ãµes de saÃºde, deslocamento, autorizaÃ§Ã£o familiar e acompanhamento do atleta Ã© dos pais ou responsÃ¡veis legais.",
      "A organizaÃ§Ã£o pode ajustar horÃ¡rios, baterias, regulamento, locais e calendÃ¡rio para preservar seguranÃ§a, logÃ­stica e qualidade tÃ©cnica."
    ]
  },
  "11-regional": {
    title: "Termo de inscriÃ§Ã£o 11 Master",
    clauses: [
      "O 11 Master Ã© uma iniciativa privada da 11RUN para atletas master com histÃ³rico, disciplina e potencial competitivo real.",
      "O atleta declara que mora em Itatiba ou em raio aproximado de atÃ© 40 km da cidade, condiÃ§Ã£o necessÃ¡ria para avaliaÃ§Ã£o inicial do projeto.",
      "A inscriÃ§Ã£o nÃ£o garante aceite automÃ¡tico, vaga, patrocÃ­nio ou suporte financeiro. A equipe 11RUN farÃ¡ anÃ¡lise tÃ©cnica, territorial e competitiva.",
      "O atleta declara estar apto para treinos e competiÃ§Ãµes, assumindo responsabilidade por sua condiÃ§Ã£o de saÃºde e acompanhamento profissional quando necessÃ¡rio.",
      "Os dados informados poderÃ£o ser usados para contato, anÃ¡lise tÃ©cnica, organizaÃ§Ã£o do pipeline e acompanhamento administrativo do projeto."
    ]
  }
};

const fieldGroups: Partial<Record<FormProjectSlug, { title: string; eyebrow: string; text: string; fields: string[] }[]>> = {
  "onze-futuro": [
    {
      eyebrow: "dados do cadastrante",
      title: "Quem estÃ¡ preenchendo",
      text: "IdentificaÃ§Ã£o da pessoa responsÃ¡vel por enviar o cadastro e receber o contato da equipe.",
      fields: ["name", "email", "phone", "city", "state", "profile_type", "message"]
    },
    {
      eyebrow: "dados do atleta",
      title: "Atleta e responsÃ¡veis",
      text: "InformaÃ§Ãµes pessoais, familiares, medidas e conta PIX do responsÃ¡vel.",
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
      eyebrow: "treinador e histÃ³rico",
      title: "Contexto esportivo",
      text: "Dados do treinador, escola, modalidades, marcas e histÃ³rico competitivo.",
      fields: ["coach_name", "coach_phone", "coach_cref", "school", "sports", "best_marks", "competitions", "social_link"]
    }
  ],
  "circuito-futuro-11": [
    {
      eyebrow: "dados do responsÃ¡vel",
      title: "ResponsÃ¡vel legal",
      text: "Dados de contato e documentos de quem autoriza a participaÃ§Ã£o do atleta.",
      fields: ["name", "email", "phone", "city", "state", "guardian_name", "guardian_cpf", "guardian_rg", "guardian_email", "guardian_phone"]
    },
    {
      eyebrow: "dados do atleta",
      title: "Atleta e inscriÃ§Ã£o",
      text: "Dados do atleta, prova pretendida, equipe e plano de pagamento.",
      fields: ["athlete_name", "athlete_cpf", "athlete_rg", "birth_date", "race_event", "payment_plan", "team", "social_link", "message"]
    }
  ],
  "11-regional": [
    {
      eyebrow: "dados do atleta master",
      title: "Perfil competitivo",
      text: "Dados do atleta, documentos, endereÃ§o, redes sociais, provas e resultados para anÃ¡lise do projeto.",
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
      help: "A categoria considera a idade que o atleta completa no ano da competiÃ§Ã£o."
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
        return "Informe CPFs vÃ¡lidos para atleta, responsÃ¡vel e aceite do termo.";
      }
    }

    if (project === "circuito-futuro-11") {
      const receipt = formData.get("payment_receipt");
      if (!(receipt instanceof File) || receipt.size === 0) return "Envie o comprovante de pagamento da inscriÃ§Ã£o.";
      if (
        !isValidCpf(String(formData.get("athlete_cpf") ?? "")) ||
        !isValidCpf(String(formData.get("guardian_cpf") ?? "")) ||
        !isValidCpf(String(formData.get("term_acceptor_cpf") ?? ""))
      ) {
        return "Informe CPFs vÃ¡lidos para atleta, responsÃ¡vel e aceite do termo.";
      }
    }

    if (project === "11-regional") {
      if (!isValidCpf(String(formData.get("cpf") ?? "")) || !isValidCpf(String(formData.get("term_acceptor_cpf") ?? ""))) {
        return "Informe CPF vÃ¡lido para atleta e aceite do termo.";
      }
      if (String(formData.get("within_itatiba_radius") ?? "") !== "sim") {
        return "Para avanÃ§ar, confirme residÃªncia em Itatiba ou em raio de atÃ© 40 km.";
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
        throw new Error(result.error ?? "Erro ao enviar formulÃ¡rio.");
      }

      router.push("/obrigado");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao enviar formulÃ¡rio.");
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
            <strong>Fotos obrigatÃ³rias do atleta</strong>
            <p>Envie exatamente 5 fotos. Elas serÃ£o usadas para perfil, anÃ¡lise, assessoria de imagem e postagens do projeto.</p>
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
            <p>InscriÃ§Ã£o: R$ 50,00 por etapa ou R$ 150,00 para as 4 etapas.</p>
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
        {project === "circuito-futuro-11" ? "Enviar inscriÃ§Ã£o" : "Enviar formulÃ¡rio"}
      </button>
    </form>
  );
}
