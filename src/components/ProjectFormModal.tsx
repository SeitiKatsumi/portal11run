"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, X } from "lucide-react";
import { formProjects, type FormProjectSlug } from "@/lib/content";
import { LeadForm } from "./LeadForm";

type ProjectFormModalProps = {
  project: FormProjectSlug;
  label?: string;
  className?: string;
  title?: string;
  text?: string;
};

const modalCopy: Record<FormProjectSlug, { label: string; title: string; text: string }> = {
  "app-11run": {
    label: "Acessar App 11Run",
    title: "App 11Run",
    text: "O cadastro do app fica na plataforma oficial 11RUN."
  },
  "onze-futuro": {
    label: "Cadastrar atleta",
    title: "Cadastro Onze Futuro",
    text: "Preencha dados do cadastrante, atleta, responsÃ¡veis, treinador, PIX, termo de aceite e as 5 fotos obrigatÃ³rias."
  },
  "11-regional": {
    label: "Inscrever atleta master",
    title: "InscriÃ§Ã£o 11 Master",
    text: "Informe dados do atleta master, documentos, endereÃ§o, redes sociais, provas, resultados e confirmaÃ§Ã£o de raio de 40 km de Itatiba."
  },
  "circuito-futuro-11": {
    label: "Inscreva-se",
    title: "InscriÃ§Ã£o Circuito Futuro 11",
    text: "Informe dados do responsÃ¡vel, atleta, prova, plano de inscriÃ§Ã£o, comprovante de pagamento e aceite do termo de autorizaÃ§Ã£o."
  },
  bolsas: {
    label: "Cadastrar interesse",
    title: "Cadastro Bolsas e Oportunidades",
    text: "Informe o perfil do atleta e os dados necessÃ¡rios para avaliaÃ§Ã£o inicial da rota internacional."
  }
};

export function ProjectFormModal({ project, label, className = "button primary", title, text }: ProjectFormModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const copy = modalCopy[project];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", open);
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  const modal = open ? (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title ?? copy.title}>
      <div className="registration-modal">
        <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Fechar formulÃ¡rio">
          <X size={20} />
        </button>
        <div className="modal-intro">
          <span className="eyebrow">{formProjects[project].label}</span>
          <h2>{title ?? copy.title}</h2>
          <p>{text ?? copy.text}</p>
        </div>
        <LeadForm project={project} />
      </div>
    </div>
  ) : null;

  return (
    <>
      <button className={className} type="button" onClick={() => setOpen(true)}>
        {label ?? copy.label}
        <ArrowRight size={18} />
      </button>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
