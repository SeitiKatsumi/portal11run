import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { IconBadge } from "./IconBadge";

export function ProjectCard({
  title,
  text,
  href,
  cta,
  icon
}: {
  title: string;
  text: string;
  href: string;
  cta: string;
  icon: LucideIcon;
}) {
  return (
    <article className="project-card">
      <IconBadge icon={icon} label={title} />
      <h3>{title}</h3>
      <p>{text}</p>
      <Link href={href}>
        {cta}
        <ArrowUpRight size={17} />
      </Link>
    </article>
  );
}
