import Link from "next/link";
import { navItems } from "@/lib/content";
import { listSponsors, sponsorCategories } from "@/lib/sponsors";

export function Footer() {
  const footerLinks = navItems.flatMap((item) => ("children" in item && item.children ? item.children : [item]));
  const sponsors = listSponsors();
  const sponsorGroups = sponsorCategories
    .map((category) => ({
      title: category,
      sponsors: sponsors.filter((sponsor) => sponsor.category === category)
    }))
    .filter((group) => group.sponsors.length > 0);

  return (
    <footer className="site-footer">
      <section className="footer-sponsors" aria-labelledby="footer-sponsors-title">
        <div className="footer-sponsors-copy">
          <span className="eyebrow">Patrocinadores</span>
          <h2 id="footer-sponsors-title">Uma operação para levar a pista local ao mapa global.</h2>
        </div>
        <div className="footer-sponsor-groups">
          {sponsorGroups.map((group) => (
            <section className="footer-sponsor-group" key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              <div className="footer-sponsors-grid" role="list">
                {group.sponsors.map((sponsor) => (
                  <article className="footer-sponsor-card" key={sponsor.name} role="listitem">
                    <img src={sponsor.logo_url ?? "/assets/logos/onzerun-menu.png"} alt={sponsor.name} />
                  </article>
                ))}
              </div>
            </section>
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
