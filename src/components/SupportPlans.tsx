"use client";

import { ArrowRight, BadgeCheck, Star } from "lucide-react";
import { supportPlans } from "@/lib/support-options";

export function SupportPlans() {
  function selectPlan(planLabel: string) {
    window.dispatchEvent(new CustomEvent("support-plan-select", { detail: planLabel }));
    document.getElementById("support-form-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="support-plans" aria-labelledby="support-plans-title">
      <div className="support-plans-head">
        <span className="eyebrow">Planos para apoiadores</span>
        <h2 id="support-plans-title">Escolha como participar da construção da 11RUN.</h2>
        <p>
          Apoiar a 11RUN é fortalecer uma estrutura esportiva com prestação de contas, calendário, comunidade e visão de
          futuro. Os planos abaixo são referenciais para associados, marcas e patrocinadores.
        </p>
      </div>

      <div className="support-plan-grid" role="list">
        {supportPlans.map((plan) => {
          const planLabel = `${plan.name} — ${plan.price}${plan.period}`;

          return (
            <article className={`support-plan-card${plan.highlighted ? " featured" : ""}`} key={plan.id} role="listitem">
              {plan.highlighted ? (
                <div className="support-plan-badge">
                  <Star size={15} />
                  Maior impacto
                </div>
              ) : null}

              <div className="support-plan-top">
                <span>Plano</span>
                <h3>{plan.name}</h3>
                <strong>
                  {plan.price}
                  <small>{plan.period}</small>
                </strong>
              </div>

              <p>{plan.description}</p>

              <div className="support-plan-ideal">
                <span>Ideal para</span>
                <p>{plan.idealFor}</p>
              </div>

              <ul>
                {plan.benefits.map((benefit) => (
                  <li key={benefit}>
                    <BadgeCheck size={16} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <button className="button primary" type="button" onClick={() => selectPlan(planLabel)}>
                Quero este plano
                <ArrowRight size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
