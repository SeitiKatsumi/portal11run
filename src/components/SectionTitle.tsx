import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionTitle({
  eyebrow,
  title,
  text
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: string;
}) {
  return (
    <Reveal>
      <div className="section-title">
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
    </Reveal>
  );
}
