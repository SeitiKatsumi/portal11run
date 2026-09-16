import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FeatureBanner } from "@/components/FeatureBanner";
import { LeadForm } from "@/components/LeadForm";
import { formProjects, type FormProjectSlug } from "@/lib/content";

type PageProps = {
  params: Promise<{ project: string }>;
};

function resolveProjectSlug(project: string): FormProjectSlug | null {
  if (project === "11-master") return "11-regional";
  if (project in formProjects) return project as FormProjectSlug;
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { project } = await params;
  const resolvedProject = resolveProjectSlug(project);
  const config = resolvedProject ? formProjects[resolvedProject] : null;
  if (!config) return {};

  return {
    title: `${config.title} - 11RUN`,
    description: `Formulário de interesse para ${config.label} no ecossistema 11RUN.`
  };
}

export default async function Page({ params }: PageProps) {
  const { project } = await params;
  const resolvedProject = resolveProjectSlug(project);
  const config = resolvedProject ? formProjects[resolvedProject] : null;

  if (!resolvedProject || !config) {
    notFound();
  }

  const isCross = resolvedProject === "circuito-cross-country-ivcl-11run";
  const formImage = isCross ? "/assets/cross-country-atletas.webp" : "/assets/11run-reference.jpg";

  return (
    <>
      <section className="form-hero">
        <div className="form-intro">
          <Link href="/" className="back-link">
            <ArrowLeft size={18} />
            Portal 11RUN
          </Link>
          <span className="eyebrow">cadastro</span>
          <h1>{config.title}</h1>
          <p>
            {isCross ? "Inscrições gratuitas até 12 de novembro de 2026. Primeira edição · 15 de novembro de 2026 · IVCL, Campinas. Inscrição para atletas de 9 a 17 anos em 2026, com autorização do responsável legal." : "Envie suas informações para a equipe 11RUN. Entraremos em contato sobre os próximos passos do seu cadastro."}
          </p>
        </div>
        <img src={formImage} alt={`Cadastro ${config.label}`} />
      </section>

      <FeatureBanner
        eyebrow={config.label}
        title={`Cadastro ${config.label}`}
        text="Uma entrada organizada para registrar interesse, contexto esportivo e próximos passos dentro do ecossistema 11RUN."
      />

      <section className="form-page">
        <div className="form-side-note">
          <span className="eyebrow">participação</span>
          <p>
            Preencha os dados com atenção para que a equipe consiga avaliar o perfil, o momento esportivo e a melhor
            frente de entrada no ecossistema 11RUN.
          </p>
        </div>
        <LeadForm project={resolvedProject} />
      </section>
    </>
  );
}
