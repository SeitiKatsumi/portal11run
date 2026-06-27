import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./IconBadge";
import { Reveal } from "./Reveal";

export function SectionTitle({
  eyebrow,
  title,
  text,
  icon
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: string;
  icon?: LucideIcon;
}) {
  return (
    <Reveal>
      <div className="section-title">
        {icon ? <IconBadge icon={icon} label={eyebrow} /> : null}
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
    </Reveal>
  );
}
