import type { Metadata } from "next";
import { HandHeart, Network, ShieldCheck } from "lucide-react";
import { SupportForm } from "@/components/SupportForm";

export const metadata: Metadata = {
  title: "Apoie o projeto",
  description: "Cadastre interesse para apoiar, patrocinar ou atuar como profissional voluntário nos projetos 11RUN."
};

export default function SupportPage() {
  return (
    <div className="support-page">
      <section className="support-hero">
        <div>
          <span className="eyebrow">Apoie o projeto</span>
          <h1>Estrutura para transformar talento em continuidade.</h1>
          <p>
            A 11RUN conecta atletas, famílias, treinadores, patrocinadores e profissionais que querem construir uma
            base esportiva mais forte. Cadastre seu interesse para conversar com a equipe.
          </p>
        </div>
        <div className="support-hero-cards">
          <article>
            <HandHeart size={22} strokeWidth={1.6} />
            <strong>Profissionais voluntários</strong>
            <p>Apoio técnico, criativo, jurídico, médico, educacional ou operacional.</p>
          </article>
          <article>
            <Network size={22} strokeWidth={1.6} />
            <strong>Patrocínios por projeto</strong>
            <p>Escolha quais frentes deseja fortalecer: app, base, master, circuito ou bolsas.</p>
          </article>
          <article>
            <ShieldCheck size={22} strokeWidth={1.6} />
            <strong>Registro organizado</strong>
            <p>Cada contato entra no painel administrativo para acompanhamento da equipe.</p>
          </article>
        </div>
      </section>

      <section className="support-panel" aria-labelledby="support-form-title">
        <div className="support-panel-copy">
          <span className="eyebrow">Faça parte</span>
          <h2 id="support-form-title">Conte como você quer apoiar a 11RUN.</h2>
          <p>
            Selecione uma ou mais formas de apoio. Quando houver interesse em patrocínio, indique os projetos que fazem
            mais sentido para sua marca ou iniciativa.
          </p>
        </div>
        <SupportForm />
      </section>
    </div>
  );
}
