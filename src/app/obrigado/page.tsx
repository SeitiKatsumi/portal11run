import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FeatureBanner } from "@/components/FeatureBanner";

export const metadata: Metadata = {
  title: "Cadastro recebido - 11RUN",
  description: "Confirmação de cadastro recebido pela equipe 11RUN."
};

export default function ObrigadoPage() {
  return (
    <>
      <section className="thanks-page">
        <div>
          <CheckCircle2 size={54} />
          <span className="eyebrow">cadastro recebido</span>
          <h1>Cadastro recebido com sucesso.</h1>
          <p>
            A equipe 11RUN recebeu suas informações e poderá entrar em contato para os próximos passos. Enquanto isso,
            continue acompanhando os projetos e oportunidades do ecossistema 11RUN.
          </p>
          <div className="hero-actions">
            <Link href="/" className="button primary">
              Voltar para o portal
              <ArrowRight size={18} />
            </Link>
            <Link href="/#projetos" className="button ghost">
              Conhecer outros projetos
            </Link>
          </div>
        </div>
        <img src="/assets/11run-reference.jpg" alt="Corredora em movimento 11RUN" />
      </section>

      <FeatureBanner
        eyebrow="11RUN"
        title="Cada cadastro abre uma nova possibilidade de caminho."
        text="Os próximos passos dependem de avaliação, contexto e alinhamento com a frente mais adequada do ecossistema."
      />
    </>
  );
}
