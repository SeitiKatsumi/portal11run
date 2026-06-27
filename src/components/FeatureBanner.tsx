import { Reveal } from "./Reveal";

export function FeatureBanner({
  eyebrow,
  title,
  text,
  imageSrc = "/assets/11run.png",
  imageAlt = "Corredora em movimento 11RUN"
}: {
  eyebrow: string;
  title: string;
  text: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <Reveal>
      <section className="feature-banner" aria-label={title}>
        <img src={imageSrc} alt={imageAlt} />
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      </section>
    </Reveal>
  );
}
