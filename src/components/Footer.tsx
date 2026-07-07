import Link from "next/link";
import { navItems } from "@/lib/content";

const sponsors = [
  {
    name: "Elevenmind",
    tier: "Patrocinador Master",
    logo: "/assets/logos/elevenmind-pb.png"
  }
];

export function Footer() {
  const footerLinks = navItems.flatMap((item) => ("children" in item && item.children ? item.children : [item]));

  return (
    <footer className="site-footer">
      <section className="footer-sponsors" aria-labelledby="footer-sponsors-title">
        <div className="footer-sponsors-copy">
          <span className="eyebrow">Patrocinadores</span>
          <h2 id="footer-sponsors-title">Uma operação para levar a pista local ao mapa global.</h2>
        </div>
        <div className="footer-sponsors-grid" role="list">
          {sponsors.map((sponsor) => (
            <article className="footer-sponsor-card" key={sponsor.name} role="listitem">
              <span>{sponsor.tier}</span>
              <img src={sponsor.logo} alt={sponsor.name} />
            </article>
          ))}
        </div>
      </section>

      <div>
        <img src="/assets/logos/onzerun-menu.png" alt="11RUN" className="footer-logo" />
        <p>Ecossistema de desenvolvimento esportivo, alto rendimento e oportunidades para corredores.</p>
      </div>
      <div>
        <strong>Links</strong>
        {footerLinks.map((item) => (
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
