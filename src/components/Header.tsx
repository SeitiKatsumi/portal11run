"use client";

import Link from "next/link";
import { BarChart3, Flag, Globe2, Home, Medal, Menu, Trophy, UserRound, X } from "lucide-react";
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
  "/bolsas": Globe2
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
