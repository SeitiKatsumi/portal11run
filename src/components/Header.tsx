"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, ChevronDown, ChevronRight, Flag, Gift, Globe2, HandHeart, HeartHandshake, Home, Medal, Menu, ShoppingBag, Trophy, UserRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { navItems } from "@/lib/content";

const navIcons: Record<string, LucideIcon> = {
  "/": Home,
  "/app-11run": BarChart3,
  "/onze-futuro": Medal,
  "/11-master": Trophy,
  "/11-regional": Trophy,
  "/circuito-futuro-11": Flag,
  "/projetos/circuito-virtual-11run": Globe2,
  "/bolsas": Globe2,
  "/apoie": HandHeart,
  "/apoie-o-projeto": ShoppingBag,
  "/apoie/patrocine": HeartHandshake,
  "/apoie/doacao": Gift,
  "/apoie/voluntariado": UserRound
};

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [open, setOpen] = useState(false);
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
  }, [pathname]);

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
              <div className="nav-dropdown" key={item.href}>
                <button type="button" className="nav-dropdown-trigger">
                  <span>{item.label}</span>
                  <ChevronDown size={14} strokeWidth={1.8} />
                </button>
                <div className="nav-dropdown-menu">
                  {item.children.map((child) => {
                    if (child.children?.length) {
                      return (
                        <div className="nav-submenu" key={child.label}>
                          <button type="button" className="nav-submenu-trigger" aria-haspopup="menu">
                            <span>{child.label}</span>
                            <ChevronRight size={15} strokeWidth={1.8} />
                          </button>
                          <div className="nav-nested-menu" role="menu" aria-label={child.label}>
                            {child.children.map((professional) => (
                              <Link key={professional.href} href={professional.href} role="menuitem">
                                <UserRound size={15} strokeWidth={1.7} />
                                <span>{professional.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    const ChildIcon = navIcons[child.href];
                    return (
                      <Link key={child.href} href={child.href}>
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
            <Link key={item.href} href={item.href}>
              {Icon ? <Icon size={15} strokeWidth={1.7} /> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
        <Link className="member-nav-link" href={accountHref}>
          <UserRound size={15} strokeWidth={1.7} />
          <span>{accountLabel}</span>
        </Link>
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
                        <details className="mobile-nav-subgroup" key={child.label}>
                          <summary>
                            <span>{child.label}</span>
                            <ChevronRight size={16} strokeWidth={1.8} />
                          </summary>
                          <div>
                            {child.children.map((professional) => (
                              <Link key={professional.href} href={professional.href} onClick={() => setOpen(false)}>
                                <UserRound size={16} strokeWidth={1.7} />
                                <span>{professional.label}</span>
                              </Link>
                            ))}
                          </div>
                        </details>
                      );
                    }
                    const ChildIcon = navIcons[child.href];
                    return (
                      <Link key={child.href} href={child.href} onClick={() => setOpen(false)}>
                        {ChildIcon ? <ChildIcon size={16} strokeWidth={1.7} /> : null}
                        <span>{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {Icon ? <Icon size={16} strokeWidth={1.7} /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link href={accountHref} onClick={() => setOpen(false)}>
            <UserRound size={16} strokeWidth={1.7} />
            <span>{accountLabel}</span>
          </Link>
        </div>
      ) : null}
    </header>
  );
}
