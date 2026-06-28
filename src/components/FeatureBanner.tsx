import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function FeatureBanner({
  eyebrow,
  title,
  text,
  imageSrc = "/assets/11run-reference.jpg",
  videoSrc,
  imageAlt = "Corredora em movimento 11RUN",
  cta,
  ctaSlot
}: {
  eyebrow: string;
  title: string;
  text: string;
  imageSrc?: string;
  videoSrc?: string;
  imageAlt?: string;
  cta?: {
    label: string;
    href: string;
  };
  ctaSlot?: ReactNode;
}) {
  return (
    <Reveal>
      <section className="feature-banner" aria-label={title}>
        {videoSrc ? (
          <video autoPlay muted loop playsInline preload="auto" poster={imageSrc} aria-label={imageAlt}>
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img src={imageSrc} alt={imageAlt} />
        )}
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
          {ctaSlot ?? null}
          {!ctaSlot && cta ? (
            <Link className="button primary feature-banner-cta" href={cta.href}>
              {cta.label}
              <ArrowRight size={18} />
            </Link>
          ) : null}
        </div>
      </section>
    </Reveal>
  );
}
