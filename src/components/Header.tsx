"use client";

import Link from "next/link";
import { BarChart3, Flag, Globe2, Home, Medal, Menu, Trophy, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/content";

const navIcons: Record<string, LucideIcon> = {
  "/": Home,
  "/onzerun": BarChart3,
  "/base-mundial": Medal,
  "/master-regional": Trophy,
  "/caminho-de-um-campeao": Flag,
  "/bolsas-e-oportunidades": Globe2
};

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="11RUN Home">
        <img src="/assets/logos/11run-branding.png" alt="11RUN" />
      </Link>

      <nav className="desktop-nav" aria-label="Navegação principal">
        {navItems.map((item) => {
          const Icon = navIcons[item.href];
          return (
            <Link key={item.href} href={item.href}>
              {Icon ? <Icon size={15} strokeWidth={1.7} /> : null}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <Link className="header-cta" href="/cadastro/onzerun">
        Participar
      </Link>

      <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? (
        <div className="mobile-nav">
          {navItems.map((item) => {
            const Icon = navIcons[item.href];
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {Icon ? <Icon size={16} strokeWidth={1.7} /> : null}
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Link href="/cadastro/onzerun" onClick={() => setOpen(false)}>
            Participar
          </Link>
        </div>
      ) : null}
    </header>
  );
}
