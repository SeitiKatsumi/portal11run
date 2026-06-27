import Link from "next/link";
import { navItems } from "@/lib/content";

export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <img src="/assets/logos/11run-branding-alt.png" alt="11RUN" className="footer-logo" />
        <p>Ecossistema de desenvolvimento esportivo, alto rendimento e oportunidades para corredores.</p>
      </div>
      <div>
        <strong>Links</strong>
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </div>
      <div>
        <strong>Contato</strong>
        <span>E-mail, Instagram e WhatsApp em breve.</span>
        <span>11RUN Brazil</span>
      </div>
    </footer>
  );
}
