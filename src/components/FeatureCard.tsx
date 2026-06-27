import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./IconBadge";

export function FeatureCard({ title, text, icon: Icon }: { title: string; text?: string; icon: LucideIcon }) {
  return (
    <article className="feature-card">
      <IconBadge icon={Icon} label="" />
      <h3>{title}</h3>
      {text ? <p>{text}</p> : null}
    </article>
  );
}
