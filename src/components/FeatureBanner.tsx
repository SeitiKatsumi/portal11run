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
  videoPoster,
  imageAlt = "Corredora em movimento 11RUN",
  cta,
  ctaSlot,
  mediaOnly = false,
  videoControls = false,
  videoAutoPlay = true
}: {
  eyebrow?: string;
  title?: string;
  text?: string;
  imageSrc?: string;
  videoSrc?: string;
  videoPoster?: string;
  imageAlt?: string;
  cta?: {
    label: string;
    href: string;
  };
  ctaSlot?: ReactNode;
  mediaOnly?: boolean;
  videoControls?: boolean;
  videoAutoPlay?: boolean;
}) {
  const hasContent = !mediaOnly && (eyebrow || title || text || ctaSlot || cta);

  return (
    <Reveal>
      <section className={`feature-banner${mediaOnly ? " media-only" : ""}`} aria-label={title ?? imageAlt}>
        {videoSrc ? (
          <video
            autoPlay={videoAutoPlay}
            muted={videoAutoPlay}
            loop={videoAutoPlay}
            playsInline
            preload={videoAutoPlay ? "auto" : "metadata"}
            poster={videoPoster}
            controls={videoControls}
            aria-label={imageAlt}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <img src={imageSrc} alt={imageAlt} />
        )}
        {hasContent ? (
          <div>
            {eyebrow ? <span>{eyebrow}</span> : null}
            {title ? <h2>{title}</h2> : null}
            {text ? <p>{text}</p> : null}
            {ctaSlot ?? null}
            {!ctaSlot && cta ? (
              <Link className="button primary feature-banner-cta" href={cta.href}>
                {cta.label}
                <ArrowRight size={18} />
              </Link>
            ) : null}
          </div>
        ) : null}
      </section>
    </Reveal>
  );
}
