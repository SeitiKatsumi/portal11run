"use client";

import { useEffect, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { LeadForm } from "./LeadForm";

export function OnzeFuturoModal({ label = "Cadastrar atleta" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button className="button primary" type="button" onClick={() => setOpen(true)}>
        {label}
        <ArrowRight size={18} />
      </button>

      {open ? (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <section
            className="registration-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onze-futuro-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Fechar cadastro">
              <X size={22} />
            </button>
            <div className="modal-intro">
              <span className="eyebrow">Cadastro Onze Futuro</span>
              <h2 id="onze-futuro-modal-title">Dados completos do atleta</h2>
              <p>
                O cadastro reúne dados do atleta, responsáveis, treinador, termo de aceite e fotos obrigatórias para
                análise do projeto.
              </p>
            </div>
            <LeadForm project="onze-futuro" />
          </section>
        </div>
      ) : null}
    </>
  );
}
