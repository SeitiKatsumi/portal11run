import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection({
  title,
  text,
  actions
}: {
  title: string;
  text?: string;
  actions: { label: string; href: string }[];
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
          <Link key={action.href} className={index === 0 ? "button primary" : "button ghost"} href={action.href}>
            {action.label}
            <ArrowRight size={18} />
          </Link>
        ))}
      </div>
    </section>
  );
}
