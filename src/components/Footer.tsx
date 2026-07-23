import Link from "next/link";
import { navItems } from "@/lib/content";
import type { NavItem } from "@/lib/content";
import { listSponsors } from "@/lib/sponsors";
import { sponsorCategories } from "@/lib/sponsor-categories";

const footerSponsorCategories = sponsorCategories;

type FooterSponsorCategory = (typeof footerSponsorCategories)[number];

type FooterSponsor = {
  id: string;
  name: string;
  category: FooterSponsorCategory;
  logo_url: string | null;
};

const fallbackSponsors: FooterSponsor[] = [
  {
    id: "elevenmind",
    name: "Elevenmind",
    category: "Realização",
    logo_url: "/assets/logos/elevenmind-pb.png"
  },
  {
    id: "instituto-vanderlei-cordeiro",
    name: "Instituto Vanderlei Cordeiro de Lima",
    category: "Apoio",
    logo_url: "/assets/logos/instituto-vanderlei-cordeiro.png"
  },
  {
    id: "bni",
    name: "BNI",
    category: "Patrocinadores Master",
    logo_url: "/assets/logos/bni.png"
  },
  {
    id: "bahia-esportes",
    name: "Bahia Esportes",
    category: "Patrocinadores",
    logo_url: "/assets/logos/bahia-esportes.png"
  },
  {
    id: "porto-seguro",
    name: "Porto Seguro",
    category: "Patrocinadores",
    logo_url: "/assets/logos/porto-seguro.webp"
  },
  {
    id: "u2e",
    name: "U2E",
    category: "Patrocinadores",
    logo_url: "/assets/logos/u2e.png"
  },
  {
    id: "lqf",
    name: "LQF Farmacêutica",
    category: "Patrocinadores",
    logo_url: "/assets/logos/lqf-logo.png"
  },
  {
    id: "built",
    name: "BUILT",
    category: "Patrocinadores",
    logo_url: "/assets/logos/built-horizontal.png"
  },
  {
    id: "flebo",
    name: "Flebo",
    category: "Patrocinadores",
    logo_url: "/assets/logos/flebo.png"
  },
  {
    id: "rm-corretora",
    name: "RM Corretora",
    category: "Patrocinadores",
    logo_url: "/assets/logos/rm-corretora.png"
  }
];

function normalizeFooterCategory(category: string): FooterSponsorCategory {
  return footerSponsorCategories.includes(category as FooterSponsorCategory)
    ? (category as FooterSponsorCategory)
    : "Patrocinadores";
}

function getFooterSponsors(): FooterSponsor[] {
  try {
    return listSponsors().map((sponsor) => ({
      id: sponsor.id,
      name: sponsor.name,
      category: normalizeFooterCategory(sponsor.category),
      logo_url: sponsor.logo_url
    }));
  } catch (error) {
    console.error("Não foi possível carregar os patrocinadores do rodapé.", error);
    return fallbackSponsors;
  }
}

export function Footer() {
  const flattenLinks = (items: NavItem[]): NavItem[] =>
    items.flatMap((item) => (item.children?.length ? flattenLinks(item.children) : [item]));
  const footerLinks = flattenLinks(navItems).filter((item) => item.href.startsWith("/"));
  const sponsors = getFooterSponsors();
  const sponsorGroups = footerSponsorCategories
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
          <h2 id="footer-sponsors-title">Um ecossistema de amor ao fundismo</h2>
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
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>
      </div>
    </footer>
  );
}
