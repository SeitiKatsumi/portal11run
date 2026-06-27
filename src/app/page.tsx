import Link from "next/link";
import { ArrowRight, Bot, Flag, Globe2, Medal, Trophy, Users } from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { FeatureCard } from "@/components/FeatureCard";
import { HeroSection } from "@/components/HeroSection";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Reveal";
import { SectionTitle } from "@/components/SectionTitle";
import { ecosystemCards, metrics } from "@/lib/content";

export default function Home() {
  return (
    <>
      <HeroSection
        eyebrow="portal oficial 11RUN"
        title="11RUN"
        subtitle="Um ecossistema para formar, desenvolver e conectar corredores ao futuro. Da base infantil ao alto rendimento. Da pista a universidade. Da inteligencia artificial a oportunidade internacional."
        primaryCta={{ label: "Conhecer os projetos", href: "#projetos" }}
        secondaryCta={{ label: "Participar da 11RUN", href: "/cadastro/onzerun" }}
        metrics={metrics}
      />

      <section className="section split">
        <SectionTitle
          eyebrow="o que e"
          title="Uma nova cultura de desenvolvimento no atletismo brasileiro."
          text="A 11RUN conecta tecnologia, formacao de base, alto rendimento, oportunidades internacionais e projetos competitivos reais."
        />
        <Reveal>
          <div className="editorial-block">
            <p>
              Mais do que organizar treinos, provas ou iniciativas isoladas, a 11RUN atua como um ecossistema: identifica
              talentos, estrutura caminhos, aproxima atletas de oportunidades e usa dados para transformar potencial em
              direcao.
            </p>
            <div className="mini-feature-row">
              <FeatureCard title="Tecnologia" icon={Bot} text="IA, dados e leitura de performance." />
              <FeatureCard title="Formacao" icon={Users} text="Base infantil e cultura esportiva." />
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section" id="projetos">
        <SectionTitle
          eyebrow="frentes do ecossistema"
          title="Cinco caminhos conectados pela mesma ambicao."
          text="Cada frente tem uma pagina propria, criterios claros e um cadastro especifico."
        />
        <div className="project-grid">
          {ecosystemCards.map((project, index) => (
            <Reveal key={project.href} delay={index * 0.04}>
              <ProjectCard {...project} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="manifesto">
        <Reveal>
          <span className="eyebrow">manifesto</span>
          <h2>
            O talento brasileiro nao precisa apenas ser descoberto.
            <br />
            Precisa ser construido.
          </h2>
          <p>
            O Brasil tem talento. Mas talento sem estrutura, calendario, orientacao, dados e oportunidade muitas vezes se
            perde antes de amadurecer. A 11RUN existe para antecipar caminhos, criar cultura esportiva e oferecer direcao.
          </p>
        </Reveal>
      </section>

      <section className="section">
        <SectionTitle eyebrow="impacto" title="Da pista local ao mapa global." />
        <div className="feature-grid compact">
          <FeatureCard title="Alto rendimento" icon={Trophy} />
          <FeatureCard title="Base mundial" icon={Medal} />
          <FeatureCard title="Circuito infantil" icon={Flag} />
          <FeatureCard title="Oportunidade internacional" icon={Globe2} />
        </div>
      </section>

      <CTASection
        title="Escolha uma frente da 11RUN e faca parte do movimento."
        actions={[
          { label: "Cadastrar atleta", href: "/cadastro/base-mundial" },
          { label: "Cadastrar projeto", href: "/cadastro/onzerun" },
          { label: "Conhecer oportunidades", href: "/bolsas-e-oportunidades" }
        ]}
      />

      <div className="portal-shortcut">
        <Link href="/cadastro/onzerun">
          Participar agora
          <ArrowRight size={18} />
        </Link>
      </div>
    </>
  );
}
