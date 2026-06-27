import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { Reveal } from "./Reveal";

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  metrics
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  metrics?: { value: string; label: string }[];
}) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <Reveal>
          <h1>{title}</h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p>{subtitle}</p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="hero-actions">
            <Link className="button primary" href={primaryCta.href}>
              {primaryCta.label}
              <ArrowRight size={18} />
            </Link>
            {secondaryCta ? (
              <Link className="button ghost" href={secondaryCta.href}>
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </Reveal>
      </div>

      <Reveal delay={0.12}>
        <div className="hero-visual">
          <img src="/assets/11run.png" alt="Atleta 11RUN em movimento" />
          <div className="floating-card top">
            <Sparkles size={18} />
            <span>IA + dados + performance</span>
          </div>
          <div className="floating-card bottom">
            <span>Base, pista e oportunidade global</span>
          </div>
        </div>
      </Reveal>

      {metrics ? (
        <div className="hero-metrics">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} value={metric.value} label={metric.label} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
