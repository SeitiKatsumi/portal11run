import Link from "next/link";
import { navItems } from "@/lib/content";
import type { NavItem } from "@/lib/content";
import { listSponsors } from "@/lib/sponsors";
import { sponsorCategories } from "@/lib/sponsor-categories";
import { PRIMARY_EMAIL, PRIMARY_EMAIL_HREF } from "@/lib/site-contact";

const footerSponsorCategories = sponsorCategories;

type FooterSponsorCategory = (typeof footerSponsorCategories)[number];

type FooterNavGroup = {
  title: string;
  links: NavItem[];
};

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

function flattenNavLeaves(item: NavItem): NavItem[] {
  return item.children?.length
    ? item.children.flatMap(flattenNavLeaves)
    : item.href.startsWith("/")
      ? [item]
      : [];
}

function uniqueLinks(items: NavItem[]): NavItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.href)) return false;
    seen.add(item.href);
    return true;
  });
}

function getFooterNavGroups(): FooterNavGroup[] {
  const byLabel = (label: string) => navItems.find((item) => item.label === label);
  const references = byLabel("Referências")?.children ?? [];
  const referenceGroup = (label: string) => references.find((item) => item.label === label);
  const group = (title: string, item?: NavItem): FooterNavGroup => ({
    title,
    links: item ? uniqueLinks(flattenNavLeaves(item)) : []
  });

  return [
    group("Projetos", byLabel("Projetos")),
    group("Institucional", byLabel("Institucional")),
    group("Apoie o Projeto", byLabel("Apoie o Projeto")),
    group("Rankings", referenceGroup("Rankings")),
    group("Resultados", referenceGroup("Resultados")),
    group("Calculadoras", referenceGroup("Calculadoras")),
    group("Reflexões", referenceGroup("Reflexões")),
    {
      title: "Acesso e legal",
      links: [
        { label: "Home", href: "/" },
        { label: "Meu Painel", href: "/meu-painel" },
        { label: "Política de Privacidade", href: "/politica-de-privacidade" },
        { label: "Termos de Uso", href: "/termos-de-uso" },
        { label: "Diretrizes aos Atletas", href: "/institucional/diretrizes-aos-atletas" }
      ]
    }
  ].filter((item) => item.links.length > 0);
}

export function Footer() {
  const footerNavGroups = getFooterNavGroups();
  const sponsors = getFooterSponsors();
  const sponsorGroups = footerSponsorCategories
    .map((category) => ({
      title: category,
      sponsors: sponsors.filter((sponsor) => sponsor.category === category)
    }))
    .filter((group) => group.sponsors.length > 0);

  return (
    <footer className="site-footer">
      <section className="footer-sponsors" aria-label="Patrocinadores e parceiros">
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

      <div className="footer-main">
        <div className="footer-brand-block">
          <img src="/assets/logos/onzerun-menu.png" alt="11RUN" className="footer-logo" />
          <p>Ecossistema de desenvolvimento esportivo, alto rendimento e oportunidades para corredores.</p>
          <span>11RUN Brasil</span>
          <a className="footer-primary-email" href={PRIMARY_EMAIL_HREF}>{PRIMARY_EMAIL}</a>
        </div>

        <nav className="footer-nav-grid" aria-label="Navegação do rodapé">
          {footerNavGroups.map((group) => (
            <section className="footer-nav-column" key={group.title}>
              <strong>{group.title}</strong>
              {group.links.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </section>
          ))}
        </nav>
      </div>

      <div className="footer-elevenmind">
        <span>Projeto idealizado, realizado e mantido pela</span>
        <a href="https://elevenmind.com.br/" target="_blank" rel="noopener noreferrer">
          Elevenmind
        </a>
      </div>
    </footer>
  );
}
