"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navItems } from "@/lib/content";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="11RUN Home">
        <img src="/assets/logos/11run-white.png" alt="11RUN" />
      </Link>

      <nav className="desktop-nav" aria-label="Navegação principal">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="header-cta" href="/cadastro/onzerun">
        Participar
      </Link>

      <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open ? (
        <div className="mobile-nav">
          <Link href="/" onClick={() => setOpen(false)}>
            Portal 11RUN
          </Link>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/cadastro/onzerun" onClick={() => setOpen(false)}>
            Participar
          </Link>
        </div>
      ) : null}
    </header>
  );
}
