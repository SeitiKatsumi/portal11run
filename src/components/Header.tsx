"use client";

import Link from "next/link";
import { BarChart3, ChevronDown, ChevronRight, Flag, Globe2, HandHeart, Home, Medal, Menu, Trophy, UserRound, X } from "lucide-react";
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
  "/apoie-o-projeto": HandHeart
};

export function Header() {
  const [open, setOpen] = useState(false);
  const [memberLoggedIn, setMemberLoggedIn] = useState(false);
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

  return (
    <header className="site-header">
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

      <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? (
        <div className="mobile-nav">
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
