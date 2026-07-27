"use client";

import { ArrowRight } from "lucide-react";
import type { MouseEvent } from "react";

export function MemberProfileUpdateLink() {
  function openProfilePanel(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const panel = document.getElementById("informacoes-cadastro");
    if (!(panel instanceof HTMLDetailsElement)) return;
    panel.open = true;
    window.history.replaceState(null, "", "#informacoes-cadastro");
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <a className="member-medical-alert-cta" href="#informacoes-cadastro" onClick={openProfilePanel}>
      Atualizar perfil
      <ArrowRight size={16} />
    </a>
  );
}
