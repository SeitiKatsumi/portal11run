import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { MetricCard } from "./MetricCard";
import { Reveal } from "./Reveal";

export function HeroSection({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  primaryCtaSlot,
  secondaryCta,
  metrics,
  imageSrc,
  imageAlt
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  primaryCta?: { label: string; href: string };
  primaryCtaSlot?: ReactNode;
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
          <h1>{title}</h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p>{subtitle}</p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="hero-actions">
            {primaryCtaSlot ?? null}
            {!primaryCtaSlot && primaryCta ? (
              <Link className="button primary" href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight size={18} />
              </Link>
            ) : null}
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
