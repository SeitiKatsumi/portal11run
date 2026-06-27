import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { formProjects, type FormProjectSlug } from "@/lib/content";

type PageProps = {
  params: Promise<{ project: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { project } = await params;
  const config = formProjects[project as FormProjectSlug];
  if (!config) return {};

  return {
    title: `${config.title} - 11RUN`,
    description: `Formulário de interesse para ${config.label} no ecossistema 11RUN.`
  };
}

export default async function Page({ params }: PageProps) {
  const { project } = await params;
  const config = formProjects[project as FormProjectSlug];

  if (!config) {
    notFound();
  }

  const formImage = project === "onzerun" || project === "bolsas" ? "/assets/11run.png" : "/assets/equipe.png";

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
