"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supportInterestTypes, supportPlanOptions, supportProjects } from "@/lib/support-options";

type SubmitState = "idle" | "loading" | "success" | "error";

export function SupportForm() {
  const [interestTypes, setInterestTypes] = useState<string[]>([]);
  const [sponsoredProjects, setSponsoredProjects] = useState<string[]>([]);
  const [interestPlan, setInterestPlan] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const wantsToSponsor = interestTypes.includes("Quero Patrocinar o projeto");

  function toggleValue(value: string, list: string[], setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  useEffect(() => {
    function handlePlanSelect(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (supportPlanOptions.includes(customEvent.detail as (typeof supportPlanOptions)[number])) {
        setInterestPlan(customEvent.detail);
      }
    }

    window.addEventListener("support-plan-select", handlePlanSelect);
    return () => window.removeEventListener("support-plan-select", handlePlanSelect);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      email: String(form.get("email") ?? ""),
      interestPlan,
      interestTypes,
      sponsoredProjects: wantsToSponsor ? sponsoredProjects : [],
      message: String(form.get("message") ?? "")
    };

    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json()) as { ok?: boolean; error?: string };

    if (!response.ok || !result.ok) {
      setState("error");
      setMessage(result.error ?? "Não foi possível enviar agora.");
      return;
    }

    event.currentTarget.reset();
    setInterestTypes([]);
    setSponsoredProjects([]);
    setInterestPlan("");
    setState("success");
    setMessage("Obrigado pelo interesse em apoiar a 11RUN. Nossa equipe comercial entrará em contato em breve para dar continuidade à contratação do plano escolhido.");
  }

  return (
    <form className="support-form" onSubmit={handleSubmit}>
      <div className="support-form-grid">
        <label>
          <span>Nome</span>
          <input name="name" required placeholder="Seu nome completo" />
        </label>
        <label>
          <span>WhatsApp</span>
          <input name="whatsapp" required placeholder="(00) 00000-0000" />
        </label>
        <label>
          <span>E-mail</span>
          <input name="email" required type="email" placeholder="voce@email.com" />
        </label>
      </div>

      <label className="support-plan-select">
        <span>Plano de interesse</span>
        <select name="interest_plan" required value={interestPlan} onChange={(event) => setInterestPlan(event.target.value)}>
          <option value="">Selecione um plano</option>
          {supportPlanOptions.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="support-options">
        <legend>Como você quer apoiar?</legend>
        {supportInterestTypes.map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              checked={interestTypes.includes(type)}
              onChange={() => toggleValue(type, interestTypes, setInterestTypes)}
            />
            <span>{type}</span>
          </label>
        ))}
      </fieldset>

      {wantsToSponsor ? (
        <fieldset className="support-options sponsor-projects">
          <legend>Quais projetos quer patrocinar?</legend>
          {supportProjects.map((project) => (
            <label key={project}>
              <input
                type="checkbox"
                checked={sponsoredProjects.includes(project)}
                onChange={() => toggleValue(project, sponsoredProjects, setSponsoredProjects)}
              />
              <span>{project}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      <label className="support-message">
        <span>Mensagem</span>
        <textarea name="message" placeholder="Conte como você pode apoiar, quais marcas representa ou qual tipo de parceria imagina." />
      </label>

      <div className="support-submit">
        <button className="button primary" type="submit" disabled={state === "loading"}>
          {state === "loading" ? "Enviando..." : "Enviar interesse"}
          {state === "success" ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
        </button>
        {message ? <p className={state === "error" ? "form-error" : "form-status"}>{message}</p> : null}
      </div>
    </form>
  );
}
