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
    description: `Formulario de interesse para ${config.label} no ecossistema 11RUN.`
  };
}

export default async function Page({ params }: PageProps) {
  const { project } = await params;
  const config = formProjects[project as FormProjectSlug];

  if (!config) {
    notFound();
  }

  return (
    <section className="form-page">
      <div className="form-intro">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          Portal 11RUN
        </Link>
        <span className="eyebrow">cadastro</span>
        <h1>{config.title}</h1>
        <p>
          Envie suas informacoes para a equipe 11RUN. Os dados ficam registrados localmente e podem ser integrados a CRM,
          banco SQL ou automacoes futuras.
        </p>
      </div>
      <LeadForm project={project as FormProjectSlug} />
    </section>
  );
}
