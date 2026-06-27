"use client";

import Link from "next/link";
import { BarChart3, Flag, Globe2, Home, Medal, Menu, Trophy, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/content";

const navIcons: Record<string, LucideIcon> = {
  "/": Home,
  "/app-11run": BarChart3,
  "/onze-futuro": Medal,
  "/11-regional": Trophy,
  "/circuito-futuro-11": Flag,
  "/bolsas": Globe2
};

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="11RUN Home">
        <img src="/assets/logos/onzerun-menu.png" alt="11RUN" />
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
        </div>
      ) : null}
    </header>
  );
}
