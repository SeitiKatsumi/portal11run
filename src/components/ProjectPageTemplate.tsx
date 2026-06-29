import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { CTASection } from "./CTASection";
import { FeatureBanner } from "./FeatureBanner";
import { FeatureCard } from "./FeatureCard";
import { HeroSection } from "./HeroSection";
import { IconBadge } from "./IconBadge";
import { ProjectFormModal } from "./ProjectFormModal";
import { Reveal } from "./Reveal";
import { SectionTitle } from "./SectionTitle";
import { Timeline } from "./Timeline";
import { sportIcons, type ProjectPage } from "@/lib/content";
import { listRankings } from "@/lib/rankings";

export function createProjectMetadata(project: ProjectPage): Metadata {
  return {
    title: project.metadata.title,
    description: project.metadata.description
  };
}

export function ProjectPageTemplate({ project }: { project: ProjectPage }) {
  const pageMetrics = (project.metrics ?? []).map((item) => {
    const [value, ...labelParts] = item.split(" ");
    return { value, label: labelParts.join(" ") || item };
  });
  const isApp = project.key === "app-11run";
  const renderModalButton = (className = "button primary") =>
    !isApp ? <ProjectFormModal project={project.key} label={project.cta} className={className} /> : null;

  return (
    <>
      {project.banner ? (
        <FeatureBanner
          eyebrow={project.banner.eyebrow}
          title={project.banner.title}
          text={project.banner.text}
          imageSrc={project.imageSrc}
          imageAlt={project.imageAlt}
          cta={isApp ? { label: project.cta, href: project.formHref } : undefined}
          ctaSlot={renderModalButton("button primary feature-banner-cta")}
        />
      ) : null}

      <HeroSection
        eyebrow={project.eyebrow}
        title={project.title}
        subtitle={project.subtitle}
        primaryCta={isApp ? { label: project.cta, href: project.formHref } : undefined}
        primaryCtaSlot={renderModalButton()}
        secondaryCta={{ label: "Voltar ao portal", href: "/" }}
        metrics={pageMetrics}
        imageSrc={project.imageSrc}
        imageAlt={project.imageAlt}
      />

      <section className="section split">
        <SectionTitle eyebrow="visão institucional" title="Estrutura real para evolução esportiva." />
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
        <SectionTitle eyebrow="benefícios e critérios" title="O que esta frente entrega." />
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
          <SectionTitle eyebrow="calendário" title="Etapas planejadas para o circuito." />
          <Timeline items={project.timeline} />
        </section>
      ) : null}

      {project.key === "circuito-futuro-11" ? <CircuitoDetails /> : null}

      {project.comparison ? (
        <section className="section">
          <SectionTitle eyebrow="rotas internacionais" title="EUA e Japão como caminhos possíveis." />
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
        text="Preencha o formulário específico para esta frente e a equipe 11RUN poderá entrar em contato com os próximos passos."
        actions={[
          isApp
            ? { label: project.cta, href: project.formHref }
            : { label: project.key === "circuito-futuro-11" ? "Inscreva-se" : "Abrir formulário", modalProject: project.key },
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

function CircuitoDetails() {
  const rankings = listRankings();
  const ageEvents = [
    { age: "10 anos", event: "800m" },
    { age: "11 anos", event: "1000m" },
    { age: "12 anos", event: "1500m" },
    { age: "13 anos", event: "2000m" }
  ];

  return (
    <>
      <section className="section">
        <SectionTitle
          eyebrow="ranking e faixas etárias"
          title="Cada idade tem sua prova. Cada tempo constrói ranking."
          text="A categoria considera sempre a idade que o atleta completa no ano da competição. Cada prova terá limite inicial de 20 atletas."
        />
        <div className="feature-grid compact">
          {ageEvents.map((item) => (
            <article className="feature-card" key={item.age}>
              <span className="eyebrow">{item.age}</span>
              <h3>{item.event}</h3>
              <p>Prova oficial da faixa etria no Circuito Futuro 11.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section split">
        <SectionTitle
          eyebrow="regulamento técnico"
          title="Meio-fundo e fundo com regra clara desde a base."
          text="O circuito usa como referência as regras oficiais do atletismo para provas de meio-fundo e fundo, inicialmente nas distâncias de 800m e 1500m, com adaptações por idade, segurança e logística."
        />
        <div className="editorial-block">
          <p>As inscrições dependem de autorização do responsável, comprovante de pagamento e aceite do regulamento.</p>
          <p>O valor é de R$ 50,00 por etapa ou R$ 150,00 para as 4 etapas. A organização poderá ajustar baterias, horários e ordem de largada conforme número de atletas e condições de pista.</p>
          <p>Resultados válidos entram no ranking por idade e prova, considerando nome do atleta, tempo, data e local.</p>
        </div>
      </section>

      <section className="section">
        <SectionTitle eyebrow="ranking publicado" title="Resultados gerenciados pelo painel administrativo." />
        <div className="public-ranking">
          {rankings.length === 0 ? <p>Ranking ainda sem resultados publicados.</p> : null}
          {rankings.map((item) => (
            <article key={item.id}>
              <span>{item.age_group}</span>
              <strong>{item.athlete_name}</strong>
              <em>{item.time}</em>
              <small>
                {item.date}  {item.location}
              </small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
