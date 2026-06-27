import Link from "next/link";
import { ArrowRight, Flag, Globe2, Trophy, Users } from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { FeatureBanner } from "@/components/FeatureBanner";
import { FeatureCard } from "@/components/FeatureCard";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { ecosystemCards, metrics } from "@/lib/content";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero-inner">
          <Reveal>
            <div className="home-hero-copy">
              <h1>Uma estrutura para revelar, formar e levar corredores mais longe.</h1>
              <p>
                A 11RUN organiza base, circuito, projetos regionais e caminhos internacionais em uma plataforma viva para
                atletas, famílias, treinadores e parceiros.
              </p>
              <div className="hero-actions">
                <Link className="button primary" href="#projetos">
                  Conhecer os projetos
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="home-hero-visual">
              <img src="/assets/11run.png" alt="Corredora em movimento 11RUN" />
            </div>
          </Reveal>
        </div>

        <div className="home-hero-metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="home-metric">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </section>

      <FeatureBanner
        eyebrow="ecossistema 11RUN"
        title="Mais cedo no movimento. Mais futuro no fundismo."
        text="Uma plataforma viva para conectar formação, performance, circuito e oportunidades em um mesmo caminho."
      />

      <section className="photo-hero photo-hero-wide">
        <div>
          <span className="eyebrow">comunidade</span>
          <h2>Atletas, famílias e treinadores dentro da mesma estrutura.</h2>
        </div>
        <img src="/assets/11run.png" alt="Corredora em movimento 11RUN" />
      </section>

      <section className="home-statement">
        <span>11RUN</span>
        <h2>
          Mais que um portal. Uma arquitetura de desenvolvimento para atletas, famílias, treinadores e projetos que
          querem chegar mais longe.
        </h2>
      </section>

      <section className="section home-projects" id="projetos">
        <SectionTitle
          eyebrow="frentes do ecossistema"
          title="Cinco frentes, uma mesma esteira de evolução."
          text="Cada iniciativa funciona como uma trilha independente, mas todas alimentam o mesmo sistema de formação, performance e oportunidade."
        />
        <div className="project-lanes">
          {ecosystemCards.map((project, index) => (
            <Reveal key={project.href} delay={index * 0.04}>
              <Link className="project-lane" href={project.href}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <project.icon size={28} strokeWidth={1.4} />
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                </div>
                <ArrowRight size={18} />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="photo-hero photo-hero-split">
        <img src="/assets/11run.png" alt="Corredora em movimento 11RUN" />
        <div>
          <span className="eyebrow">performance</span>
          <h2>Da rotina de treino ao próximo salto competitivo.</h2>
          <p>Uma operação pensada para organizar acompanhamento, calendário, orientação e oportunidade.</p>
        </div>
      </section>

      <section className="section split home-system">
        <SectionTitle
          eyebrow="o sistema"
          title="Da descoberta do talento ao contexto que sustenta a performance."
          text="A 11RUN conecta tecnologia, base, circuito, projetos regionais e oportunidades internacionais em uma experiência única."
        />
        <Reveal>
          <div className="system-panel">
            <div>
              <span>01</span>
              <strong>Identificar</strong>
              <p>Mapear atletas, famílias, projetos e marcas competitivas.</p>
            </div>
            <div>
              <span>02</span>
              <strong>Desenvolver</strong>
              <p>Transformar rotina, calendário e orientação em continuidade.</p>
            </div>
            <div>
              <span>03</span>
              <strong>Conectar</strong>
              <p>Aproximar desempenho de bolsas, universidades e oportunidades reais.</p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="photo-hero photo-hero-wide">
        <div>
          <span className="eyebrow">Onze Futuro</span>
          <h2>O caminho começa no Onze Futuro e ganha escala com continuidade.</h2>
        </div>
        <img src="/assets/11run.png" alt="Corredora em movimento 11RUN" />
      </section>

      <section className="section">
        <SectionTitle eyebrow="impacto" title="Uma operação para levar a pista local ao mapa global." />
        <div className="feature-grid compact">
          <FeatureCard title="Alto rendimento" icon={Trophy} />
          <FeatureCard title="Onze Futuro" icon={Users} />
          <FeatureCard title="Circuito Futuro 11" icon={Flag} />
          <FeatureCard title="Oportunidade internacional" icon={Globe2} />
        </div>
      </section>

      <CTASection
        title="Escolha uma frente da 11RUN e faça parte do movimento."
        actions={[
          { label: "Cadastrar no Onze Futuro", href: "/cadastro/onze-futuro" },
          { label: "Cadastrar no App 11Run", href: "/cadastro/app-11run" },
          { label: "Conhecer oportunidades", href: "/bolsas" }
        ]}
      />
    </>
  );
}
