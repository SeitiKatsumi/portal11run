import Link from "next/link";
import { navItems } from "@/lib/content";

const sponsorGroups = [
  {
    title: "Realização",
    sponsors: [
      {
        name: "Elevenmind",
        logo: "/assets/logos/elevenmind-pb.png"
      },
      {
        name: "Instituto Vanderlei Cordeiro de Lima",
        logo: "/assets/logos/instituto-vanderlei-cordeiro.png"
      }
    ]
  },
  {
    title: "Patrocinador Master",
    sponsors: [
      {
        name: "BNI",
        logo: "/assets/logos/bni.png"
      }
    ]
  },
  {
    title: "Apoiadores",
    sponsors: [
      {
        name: "Bahia Esportes",
        logo: "/assets/logos/bahia-esportes.png"
      },
      {
        name: "Porto Seguro",
        logo: "/assets/logos/porto-seguro.webp"
      },
      {
        name: "U2E",
        logo: "/assets/logos/u2e.png"
      },
      {
        name: "LQF Farmacêutica",
        logo: "/assets/logos/lqf-logo.png"
      },
      {
        name: "BUILT",
        logo: "/assets/logos/built-horizontal.png"
      },
      {
        name: "Flebo",
        logo: "/assets/logos/flebo.png"
      },
      {
        name: "RM Corretora",
        logo: "/assets/logos/rm-corretora.png"
      }
    ]
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
        <div className="footer-sponsor-groups">
          {sponsorGroups.map((group) => (
            <section className="footer-sponsor-group" key={group.title} aria-label={group.title}>
              <h3>{group.title}</h3>
              <div className="footer-sponsors-grid" role="list">
                {group.sponsors.map((sponsor) => (
                  <article className="footer-sponsor-card" key={sponsor.name} role="listitem">
                    <img src={sponsor.logo} alt={sponsor.name} />
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
