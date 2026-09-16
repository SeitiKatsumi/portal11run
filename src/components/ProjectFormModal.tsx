"use client";

import { useEffect, useRef, useState } from "react";
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
  "circuito-cross-country-ivcl-11run": {
    label: "Inscrever atleta", title: "Sua primeira largada no Cross",
    text: "15 de novembro de 2026 · IVCL, Campinas. Preencha os dados e aguarde a confirmação da organização."
  },
  "app-11run": {
    label: "Acessar App 11Run",
    title: "App 11Run",
    text: "O cadastro do app fica na plataforma oficial 11RUN."
  },
  "onze-futuro": {
    label: "Cadastrar atleta",
    title: "Cadastro Onze Futuro",
    text: "Preencha dados do cadastrante, atleta, responsáveis, treinador, PIX, termo de aceite e as 5 fotos obrigatórias."
  },
  "11-regional": {
    label: "Inscrever atleta master",
    title: "Inscrição 11 Master",
    text: "Informe dados do atleta master, documentos, endereço, redes sociais, provas, resultados e confirmação de raio de 40 km de Itatiba."
  },
  "circuito-futuro-11": {
    label: "Pré-inscreva-se",
    title: "Pré-inscrição Circuito Futuro 11 · 2027",
    text: "Informe os dados do responsável e do atleta, escolha a categoria de 2027 e aceite o termo de autorização para registrar a pré-inscrição."
  },
  bolsas: {
    label: "Cadastrar interesse",
    title: "Cadastro Bolsas e Oportunidades",
    text: "Informe o perfil do atleta e os dados necessários para avaliação inicial da rota internacional."
  }
};

export function ProjectFormModal({ project, label, className = "button primary", title, text }: ProjectFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const copy = modalCopy[project];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add("modal-open");
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalRef.current?.querySelector<HTMLElement>("button")?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const elements = modalRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, a[href]');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("modal-open");
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus();
    };
  }, [open]);

  const modal = open ? (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title ?? copy.title}>
      <div className="registration-modal" ref={modalRef}>
        <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Fechar formulário">
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
