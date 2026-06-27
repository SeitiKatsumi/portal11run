import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { CTASection } from "./CTASection";
import { FeatureCard } from "./FeatureCard";
import { HeroSection } from "./HeroSection";
import { IconBadge } from "./IconBadge";
import { Reveal } from "./Reveal";
import { SectionTitle } from "./SectionTitle";
import { Timeline } from "./Timeline";
import { sportIcons, type ProjectPage } from "@/lib/content";

export function createProjectMetadata(project: ProjectPage): Metadata {
  return {
    title: project.metadata.title,
    description: project.metadata.description
  };
}

export function ProjectPageTemplate({ project }: { project: ProjectPage }) {
  const pageMetrics = project.metrics?.map((item) => {
    const [value, ...labelParts] = item.split(" ");
    return { value, label: labelParts.join(" ") || item };
  });

  return (
    <>
      <HeroSection
        eyebrow={project.eyebrow}
        title={project.title}
        subtitle={project.subtitle}
        primaryCta={{ label: project.cta, href: project.formHref }}
        secondaryCta={{ label: "Voltar ao portal", href: "/" }}
        metrics={pageMetrics}
      />

      <section className="section split">
        <SectionTitle eyebrow="visao institucional" title="Estrutura real para evolucao esportiva." />
        <Reveal>
          <div className="editorial-block">
            {project.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>
      </section>

      {project.highlight ? (
        <section className="highlight-band">
          <IconBadge icon={project.icon} label={project.title} />
          <div>
            <h2>{project.highlight.title}</h2>
            <p>{project.highlight.text}</p>
          </div>
        </section>
      ) : null}

      <section className="section">
        <SectionTitle eyebrow="beneficios e criterios" title="O que esta frente entrega." />
        <div className="feature-grid">
          {project.features.map((feature, index) => (
            <Reveal key={feature} delay={index * 0.03}>
              <FeatureCard title={feature} icon={sportIcons[index % sportIcons.length]} />
            </Reveal>
          ))}
        </div>
      </section>

      {project.timeline ? (
        <section className="section split">
          <SectionTitle eyebrow="calendario" title="Etapas planejadas para o circuito." />
          <Timeline items={project.timeline} />
        </section>
      ) : null}

      {project.comparison ? (
        <section className="section">
          <SectionTitle eyebrow="rotas internacionais" title="EUA e Japao como caminhos possiveis." />
          <div className="comparison-grid">
            {project.comparison.map((item) => (
              <article key={item.title} className="comparison-card">
                <CheckCircle2 size={22} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {project.notice ? <aside className="notice-block">{project.notice}</aside> : null}

      <CTASection
        title={project.cta}
        text="Preencha o formulario especifico para esta frente e a equipe 11RUN podera entrar em contato com os proximos passos."
        actions={[
          { label: "Abrir cadastro", href: project.formHref },
          { label: "Voltar ao portal", href: "/" }
        ]}
      />

      <div className="back-link-wrap">
        <Link href="/" className="back-link">
          <ArrowLeft size={18} />
          Voltar ao portal principal
          <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
