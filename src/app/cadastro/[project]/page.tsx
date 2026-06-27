import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { FeatureBanner } from "@/components/FeatureBanner";
import { LeadForm } from "@/components/LeadForm";
import { formProjects, type FormProjectSlug } from "@/lib/content";

type PageProps = {
  params: Promise<{ project: string }>;
};

const legacyFormSlugs: Record<string, FormProjectSlug> = {
  onzerun: "app-11run",
  "base-mundial": "onze-futuro",
  "master-regional": "11-regional",
  "circuito-infantil": "circuito-futuro-11"
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { project } = await params;
  const slug = legacyFormSlugs[project] ?? (project as FormProjectSlug);
  const config = formProjects[slug];
  if (!config) return {};

  return {
    title: `${config.title} - 11RUN`,
    description: `Formulário de interesse para ${config.label} no ecossistema 11RUN.`
  };
}

export default async function Page({ params }: PageProps) {
  const { project } = await params;
  const legacyTarget = legacyFormSlugs[project];
  if (legacyTarget) {
    redirect(`/cadastro/${legacyTarget}`);
  }

  const config = formProjects[project as FormProjectSlug];

  if (!config) {
    notFound();
  }

  const formImage = "/assets/11run.png";

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
            Envie suas informações para a equipe 11RUN. Os dados ficam registrados localmente e podem ser integrados a
            CRM, banco SQL ou automações futuras.
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
        <LeadForm project={project as FormProjectSlug} />
      </section>
    </>
  );
}
