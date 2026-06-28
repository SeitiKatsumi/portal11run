import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProjectFormModal } from "./ProjectFormModal";
import type { FormProjectSlug } from "@/lib/content";

type CTAAction = {
  label: string;
  href?: string;
  modalProject?: FormProjectSlug;
  className?: string;
};

export function CTASection({
  title,
  text,
  actions
}: {
  title: string;
  text?: string;
  actions: CTAAction[];
}) {
  return (
    <section className="cta-section">
      <div>
        <span className="eyebrow">participar</span>
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
      <div className="cta-actions">
        {actions.map((action, index) => (
          action.modalProject ? (
            <ProjectFormModal
              key={`${action.modalProject}-${action.label}`}
              project={action.modalProject}
              label={action.label}
              className={action.className ?? (index === 0 ? "button primary" : "button ghost")}
            />
          ) : (
            <Link
              key={action.href ?? action.label}
              className={action.className ?? (index === 0 ? "button primary" : "button ghost")}
              href={action.href ?? "#"}
            >
              {action.label}
              <ArrowRight size={18} />
            </Link>
          )
        ))}
      </div>
    </section>
  );
}
