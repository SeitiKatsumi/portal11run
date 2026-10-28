"use client";

import {
  BarChart3,
  ChevronDown,
  CircleHelp,
  ClipboardPenLine,
  Gift,
  Medal,
  ScrollText,
  TrendingUp
} from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./CircuitSectionDisclosure.module.css";

const icons = {
  leaders: Medal,
  ranking: BarChart3,
  evolution: TrendingUp,
  awards: Gift,
  registration: ClipboardPenLine,
  rules: ScrollText,
  faq: CircleHelp
} as const;

type CircuitSectionDisclosureProps = {
  id: string;
  index: string;
  icon: keyof typeof icons;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  children: ReactNode;
};

const disclosureSelector = "details[data-circuit-disclosure='true']";

export function CircuitSectionDisclosure({
  id,
  index,
  icon,
  eyebrow,
  title,
  description,
  meta,
  children
}: CircuitSectionDisclosureProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const Icon = icons[icon];

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) return;

    const openFromHash = () => {
      if (window.location.hash !== `#${id}`) {
        details.open = false;
        return;
      }
      document.querySelectorAll<HTMLDetailsElement>(disclosureSelector).forEach((item) => {
        item.open = item === details;
      });
      window.requestAnimationFrame(() => details.scrollIntoView({ block: "start", behavior: "smooth" }));
    };

    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, [id]);

  function handleToggle() {
    const details = detailsRef.current;
    if (!details?.open) return;
    document.querySelectorAll<HTMLDetailsElement>(disclosureSelector).forEach((item) => {
      if (item !== details) item.open = false;
    });
  }

  return (
    <details
      className={styles.disclosure}
      data-circuit-disclosure="true"
      id={id}
      onToggle={handleToggle}
      ref={detailsRef}
    >
      <summary className={styles.summary}>
        <span className={styles.index} aria-hidden="true">{index}</span>
        <span className={styles.icon} aria-hidden="true"><Icon size={20} /></span>
        <span className={styles.copy}>
          <small>{eyebrow}</small>
          <strong>{title}</strong>
          <span>{description}</span>
        </span>
        <span className={styles.meta}>{meta}</span>
        <span className={styles.toggle} aria-hidden="true"><ChevronDown size={20} /></span>
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
