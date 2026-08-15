"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Apple, BarChart3, ChevronDown, ChevronRight, Compass, Flag, Gift, Globe2, GraduationCap, HandHeart, HeartHandshake, Home, Medal, Menu, MessageSquareQuote, Orbit, Palette, Route, ShieldCheck, ShoppingBag, Trophy, UserRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/content";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navIcons: Record<string, LucideIcon> = {
  "/": Home,
  "/app-11run": BarChart3,
  "/onze-futuro": Medal,
  "/11-master": Trophy,
  "/11-regional": Trophy,
  "/circuito-futuro-11": Flag,
  "/projetos/circuito-virtual-11run": Globe2,
  "/bolsas": Globe2,
  "/referencias/ranking-brasil": Globe2,
  "/referencias/ranking-japao": Globe2,
  "/referencias/ranking-noruega": Globe2,
  "/referencias/ranking-eua": Globe2,
  "/referencias/ranking-quenia": Globe2,
  "/referencias/ranking-uganda": Globe2,
  "/referencias/ranking-mundial": Globe2,
  "/referencias/calculadoras/chance-olimpica": Orbit,
  "/apoie": HandHeart,
  "/apoie-o-projeto": ShoppingBag,
  "/apoie/patrocine": HeartHandshake,
  "/apoie-o-projeto/solucoes-de-marketing": BarChart3,
  "/apoie/doacao": Gift,
  "/apoie/voluntariado": UserRound,
  "/institucional/missao-visao-valores": Compass,
  "/institucional/branding": Palette,
  "/institucional/diretrizes-aos-atletas": ShieldCheck,
  "/referencias/reflexoes/alimentacao-e-suplementacao": Apple,
  "/institucional/opiniao/mesma-idade-desenvolvimentos-diferentes": MessageSquareQuote,
  "/referencias/analises/formacao-integral-do-atleta": GraduationCap,
  "/referencias/analises/modulacao-neurorespiratoria-fundismo": MessageSquareQuote,
  "/referencias/analises/o-fundo-comeca-na-infancia": Route,
  "/politica-de-privacidade": ShieldCheck
};

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null);
  const [desktopSubmenu, setDesktopSubmenu] = useState<string | null>(null);
  const [memberLoggedIn, setMemberLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [homeHeader, setHomeHeader] = useState({ opacity: 74, blur: 18 });
  const accountHref = memberLoggedIn ? "/meu-painel" : "/login";
  const accountLabel = memberLoggedIn ? "Meu Painel" : "Login";

  useEffect(() => {
    let mounted = true;
    fetch("/api/members/session")
      .then((response) => response.json())
      .then((result) => {
        if (mounted) setMemberLoggedIn(Boolean(result.loggedIn));
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    fetch("/api/home")
      .then((response) => response.json())
      .then((result) => {
        if (result.settings) {
          setHomeHeader({
            opacity: Number(result.settings.header_opacity) || 74,
            blur: Number(result.settings.header_blur) || 18
          });
        }
      })
      .catch(() => undefined);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-menu-open");
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.classList.remove("mobile-menu-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setDesktopMenu(null);
    setDesktopSubmenu(null);
  }, [pathname]);

  const isActiveHref = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <header
      className={`site-header ${isHome ? "home-site-header" : ""} ${scrolled ? "home-site-header-scrolled" : ""}`}
      style={isHome ? {
        backgroundColor: scrolled
          ? `rgb(18 19 18 / ${Math.max(72, Math.min(88, homeHeader.opacity)) / 100})`
          : "rgb(18 19 18 / 0.08)",
        backdropFilter: `blur(${scrolled ? homeHeader.blur : Math.min(6, homeHeader.blur)}px)`
      } : undefined}
    >
      <Link href="/" className="brand" aria-label="11RUN Home">
        <img src="/assets/logos/onzerun-menu.png" alt="11RUN" />
      </Link>

      <nav className="desktop-nav" aria-label="Navegacao principal">
        {navItems.map((item) => {
          const Icon = navIcons[item.href];
          if ("children" in item && item.children?.length) {
            return (
              <div
                className={`nav-dropdown ${desktopMenu === item.label ? "is-open" : ""}`}
                key={item.href}
                onMouseEnter={() => setDesktopMenu(item.label)}
                onMouseLeave={() => {
                  setDesktopMenu(null);
                  setDesktopSubmenu(null);
                }}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDesktopMenu(null);
                    setDesktopSubmenu(null);
                  }
                }}
              >
                <button
                  type="button"
                  className="nav-dropdown-trigger"
                  aria-haspopup="menu"
                  aria-expanded={desktopMenu === item.label}
                  onClick={() => setDesktopMenu((current) => current === item.label ? null : item.label)}
                >
                  <span>{item.label}</span>
                  <ChevronDown size={14} strokeWidth={1.8} />
                </button>
                <div className="nav-dropdown-menu" role="menu" aria-label={item.label}>
                  {item.children.map((child) => {
                    if (child.children?.length) {
                      return (
                        <div
                          className={`nav-submenu ${desktopSubmenu === child.label ? "is-open" : ""}`}
                          key={child.label}
                          onMouseEnter={() => setDesktopSubmenu(child.label)}
                          onMouseLeave={() => setDesktopSubmenu(null)}
                        >
                          <button
                            type="button"
                            className="nav-submenu-trigger"
                            aria-haspopup="menu"
                            aria-expanded={desktopSubmenu === child.label}
                            onClick={() => setDesktopSubmenu((current) => current === child.label ? null : child.label)}
                          >
                            <span>{child.label}</span>
                            <ChevronRight size={15} strokeWidth={1.8} />
                          </button>
                          <div className="nav-nested-menu" role="menu" aria-label={child.label}>
                            {child.children.map((professional) => {
                              const NestedIcon = navIcons[professional.href] ?? UserRound;
                              return (
                                <Link
                                  key={professional.href}
                                  href={professional.href}
                                  role="menuitem"
                                  aria-current={isActiveHref(professional.href) ? "page" : undefined}
                                >
                                  <NestedIcon size={15} strokeWidth={1.7} />
                                  <span>{professional.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    const ChildIcon = navIcons[child.href];
                    return (
                      <Link key={child.href} href={child.href} role="menuitem" aria-current={isActiveHref(child.href) ? "page" : undefined}>
                        {ChildIcon ? <ChildIcon size={15} strokeWidth={1.7} /> : null}
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} aria-current={isActiveHref(item.href) ? "page" : undefined}>
              {Icon ? <Icon size={15} strokeWidth={1.7} /> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link className="member-nav-link" href={accountHref} aria-current={isActiveHref(accountHref) ? "page" : undefined}>
          <UserRound size={15} strokeWidth={1.7} />
          <span>{accountLabel}</span>
        </Link>
        <LanguageSwitcher />
      </nav>

      <button
        className="menu-button"
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? (
        <div className="mobile-nav" id="mobile-navigation">
          {navItems.map((item) => {
            const Icon = navIcons[item.href];
            if ("children" in item && item.children?.length) {
              return (
                <div className="mobile-nav-group" key={item.href}>
                  <strong>{item.label}</strong>
                  {item.children.map((child) => {
                    if (child.children?.length) {
                      return (
                        <details
                          className="mobile-nav-subgroup"
                          key={child.label}
                          open={child.children.some((nested) => isActiveHref(nested.href)) || undefined}
                        >
                          <summary>
                            <span>{child.label}</span>
                            <ChevronRight size={16} strokeWidth={1.8} />
                          </summary>
                          <div>
                            {child.children.map((professional) => {
                              const NestedIcon = navIcons[professional.href] ?? UserRound;
                              return (
                                <Link
                                  key={professional.href}
                                  href={professional.href}
                                  onClick={() => setOpen(false)}
                                  aria-current={isActiveHref(professional.href) ? "page" : undefined}
                                >
                                  <NestedIcon size={16} strokeWidth={1.7} />
                                  <span>{professional.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </details>
                      );
                    }
                    const ChildIcon = navIcons[child.href];
                    return (
                      <Link key={child.href} href={child.href} onClick={() => setOpen(false)} aria-current={isActiveHref(child.href) ? "page" : undefined}>
                        {ChildIcon ? <ChildIcon size={16} strokeWidth={1.7} /> : null}
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={isActiveHref(item.href) ? "page" : undefined}>
                {Icon ? <Icon size={16} strokeWidth={1.7} /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link href={accountHref} onClick={() => setOpen(false)} aria-current={isActiveHref(accountHref) ? "page" : undefined}>
            <UserRound size={16} strokeWidth={1.7} />
            <span>{accountLabel}</span>
          </Link>
          <LanguageSwitcher mobile />
        </div>
      ) : null}
    </header>
  );
}
