"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, PanelLeft, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { adminNavigationGroups, adminNavigationItems } from "@/lib/admin-navigation";
import styles from "./AdminNav.module.css";

export function AdminNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeItem = useMemo(
    () => adminNavigationItems.find((item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))),
    [pathname]
  );

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className={styles.navigation}>
      <button className={styles.toggle} type="button" aria-controls="admin-sidebar" aria-expanded={open} onClick={() => setOpen(true)}>
        <span className={styles.toggleLabel}>
          <span className={styles.toggleIcon}><Menu size={18} /></span>
          <span><strong>Menu administrativo</strong><small>{activeItem?.label ?? "Visão geral"}</small></span>
        </span>
        <PanelLeft size={19} />
      </button>

      <button className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`} type="button" aria-label="Fechar menu administrativo" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`} id="admin-sidebar" aria-label="Navegação administrativa">
        <div className={styles.header}>
          <span className={styles.mark}><PanelLeft size={20} /></span>
          <span className={styles.headerText}><strong>Painel 11RUN</strong><span>Central administrativa</span></span>
          <button className={styles.close} type="button" aria-label="Fechar menu administrativo" onClick={() => setOpen(false)}><X size={19} /></button>
        </div>

        <nav className={styles.nav} aria-label="Menu do painel administrativo">
          {adminNavigationGroups.map((group) => (
            <div className={styles.group} key={group.label}>
              <span className={styles.groupLabel}>{group.label}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link className={`${styles.link} ${active ? styles.linkActive : ""}`} href={item.href} key={item.href} aria-current={active ? "page" : undefined} title={item.description}>
                    <span className={styles.linkIcon}><Icon size={17} strokeWidth={1.75} /></span>
                    <span className={styles.linkText}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <Link className={styles.siteLink} href="/"><span>Voltar ao portal</span><ExternalLink size={15} /></Link>
          <span className={styles.security}><ShieldCheck size={14} /> Área protegida da equipe 11RUN</span>
        </div>
      </aside>
    </div>
  );
}
