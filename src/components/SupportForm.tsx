"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { supportInterestTypes, supportPartnershipGoals, supportPlanOptions, supportProjects } from "@/lib/support-options";

type SubmitState = "idle" | "loading" | "success" | "error";

export function SupportForm() {
  const [interestTypes, setInterestTypes] = useState<string[]>([]);
  const [sponsoredProjects, setSponsoredProjects] = useState<string[]>([]);
  const [interestPlan, setInterestPlan] = useState("");
  const [partnershipGoal, setPartnershipGoal] = useState("");
  const [namingInterest, setNamingInterest] = useState(false);
  const [athleteAdoptionCount, setAthleteAdoptionCount] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const wantsToSponsor = interestTypes.includes("Quero Patrocinar o projeto");
  const isSponsorPlan = interestPlan.includes("Patrocinador") || interestPlan.includes("Personalizado");
  const needsStrategicFields =
    interestPlan.includes("Diamante") ||
    interestPlan.includes("Personalizado") ||
    partnershipGoal.includes("Naming") ||
    partnershipGoal.includes("Adoção");

  function toggleValue(value: string, list: string[], setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  useEffect(() => {
    function handlePlanSelect(event: Event) {
      const customEvent = event as CustomEvent<string>;
      if (supportPlanOptions.includes(customEvent.detail)) {
        setInterestPlan(customEvent.detail);
        if (customEvent.detail.includes("Patrocinador") || customEvent.detail.includes("Personalizado")) {
          setInterestTypes((current) =>
            current.includes("Quero Patrocinar o projeto") ? current : [...current, "Quero Patrocinar o projeto"]
          );
        }
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
    const typedMessage = String(form.get("message") ?? "").trim();
    const strategicDetails = [
      partnershipGoal ? `Objetivo da parceria: ${partnershipGoal}` : "",
      namingInterest ? "Tem interesse em naming de projeto, etapa ou frente esportiva." : "",
      athleteAdoptionCount ? `Interesse em adotar/custear atletas: ${athleteAdoptionCount}` : ""
    ].filter(Boolean);

    const payload = {
      name: String(form.get("name") ?? ""),
      whatsapp: String(form.get("whatsapp") ?? ""),
      email: String(form.get("email") ?? ""),
      interestPlan,
      interestTypes,
      sponsoredProjects: wantsToSponsor ? sponsoredProjects : [],
      message: [typedMessage, strategicDetails.length ? `Detalhes estratégicos:\n${strategicDetails.join("\n")}` : ""]
        .filter(Boolean)
        .join("\n\n")
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
    setPartnershipGoal("");
    setNamingInterest(false);
    setAthleteAdoptionCount("");
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
        <select
          name="interest_plan"
          required
          value={interestPlan}
          onChange={(event) => {
            const nextPlan = event.target.value;
            setInterestPlan(nextPlan);
            if (nextPlan.includes("Patrocinador") || nextPlan.includes("Personalizado")) {
              setInterestTypes((current) =>
                current.includes("Quero Patrocinar o projeto") ? current : [...current, "Quero Patrocinar o projeto"]
              );
            }
          }}
        >
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

      {isSponsorPlan ? (
        <div className="support-strategy-grid">
          <label>
            <span>Objetivo principal</span>
            <select value={partnershipGoal} onChange={(event) => setPartnershipGoal(event.target.value)}>
              <option value="">Selecione o objetivo</option>
              {supportPartnershipGoals.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Atletas a adotar</span>
            <input
              value={athleteAdoptionCount}
              onChange={(event) => setAthleteAdoptionCount(event.target.value)}
              placeholder="Ex.: 1 atleta, 3 atletas ou a definir"
            />
          </label>
          <label className="support-inline-check">
            <input type="checkbox" checked={namingInterest} onChange={(event) => setNamingInterest(event.target.checked)} />
            <span>Tenho interesse em naming</span>
          </label>
        </div>
      ) : null}

      {needsStrategicFields ? (
        <div className="support-strategy-note">
          <strong>Parceria estratégica</strong>
          <p>
            Para planos Diamante ou Personalizados, a equipe comercial pode estruturar contrapartidas, naming, adoção de
            atletas, mídia, ativações e prestação de contas conforme o objetivo da marca.
          </p>
        </div>
      ) : null}

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
