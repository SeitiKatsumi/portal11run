"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  ChevronRight,
  Lightbulb,
  ListChecks,
  X,
  type LucideIcon
} from "lucide-react";
import styles from "./HomeReferenceCategories.module.css";

export type HomeReferenceCategory = {
  label: string;
  description: string;
  children: { label: string; href: string }[];
};

const categoryIcons: Record<string, LucideIcon> = {
  Rankings: BarChart3,
  Resultados: ListChecks,
  Calculadoras: Calculator,
  Reflexões: Lightbulb
};

export default function HomeReferenceCategories({ categories }: { categories: HomeReferenceCategory[] }) {
  const [active, setActive] = useState<HomeReferenceCategory | null>(null);
  const [mounted, setMounted] = useState(false);
  const dialogId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [active]);

  return (
    <>
      <nav className={styles.grid} aria-label="Categorias de referências 11RUN">
        {categories.map((category, index) => {
          const Icon = categoryIcons[category.label] || Lightbulb;
          const isActive = active?.label === category.label;
          return (
            <button
              className={styles.card}
              type="button"
              key={category.label}
              aria-expanded={isActive}
              aria-controls={isActive ? dialogId : undefined}
              onClick={() => setActive(category)}
              style={{ animationDelay: `${260 + index * 55}ms` }}
            >
              <span className={styles.icon}><Icon size={22} strokeWidth={1.55} /></span>
              <span className={styles.text}>
                <strong>{category.label}</strong>
                <small>{category.description}</small>
              </span>
              <ChevronRight className={styles.chevron} size={18} aria-hidden="true" />
            </button>
          );
        })}
      </nav>

      {mounted && active ? createPortal(
        <div className={styles.overlay} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setActive(null);
        }}>
          <section
            className={styles.dialog}
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
          >
            <header className={styles.dialogHeader}>
              <span className={styles.dialogIcon} aria-hidden="true">
                {(() => { const Icon = categoryIcons[active.label] || Lightbulb; return <Icon />; })()}
              </span>
              <div>
                <small>Escolha uma opção</small>
                <h2 id={`${dialogId}-title`}>{active.label}</h2>
              </div>
              <button ref={closeButtonRef} className={styles.close} type="button" onClick={() => setActive(null)} aria-label="Fechar opções">
                <X aria-hidden="true" />
              </button>
            </header>

            <nav className={styles.options} aria-label={`Opções de ${active.label}`}>
              {active.children.map((item, index) => (
                <Link href={item.href} key={item.href} onClick={() => setActive(null)}>
                  <span className={styles.optionNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{item.label}</strong>
                  <ArrowUpRight aria-hidden="true" />
                </Link>
              ))}
            </nav>
          </section>
        </div>,
        document.body
      ) : null}
    </>
  );
}
