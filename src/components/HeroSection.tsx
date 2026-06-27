import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { Reveal } from "./Reveal";

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  metrics,
  imageSrc,
  imageAlt
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  metrics?: { value: string; label: string }[];
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <section className="hero-section">
      <div className="hero-copy">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <Reveal>
          {title === "11RUN" ? (
            <h1 className="hero-logo-heading" aria-label="11RUN">
              <img src="/assets/logos/11run-white.png" alt="" aria-hidden="true" />
            </h1>
          ) : (
            <h1>{title}</h1>
          )}
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
          <img src={imageSrc ?? "/assets/11run.png"} alt={imageAlt ?? "Corredora em movimento 11RUN"} />
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
