import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./Reveal";

export function FeatureBanner({
  eyebrow,
  title,
  text,
  imageSrc = "/assets/11run.png",
  imageAlt = "Corredora em movimento 11RUN",
  cta
}: {
  eyebrow: string;
  title: string;
  text: string;
  imageSrc?: string;
  imageAlt?: string;
  cta?: {
    label: string;
    href: string;
  };
}) {
  return (
    <Reveal>
      <section className="feature-banner" aria-label={title}>
        <img src={imageSrc} alt={imageAlt} />
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
          {cta ? (
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
