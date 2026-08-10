"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  buildAutomaticTranslationUrl,
  buildOriginalPortalUrl,
  detectSiteLanguage,
  SITE_LANGUAGES,
  type SiteLanguage,
} from "@/lib/site-translation";
import styles from "./LanguageSwitcher.module.css";

type LanguageSwitcherProps = {
  mobile?: boolean;
};

export function LanguageSwitcher({ mobile = false }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<SiteLanguage>("pt");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrent(detectSiteLanguage(window.location.href));
  }, []);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const chooseLanguage = (language: SiteLanguage) => {
    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://11run.com.br";
    const originalUrl = buildOriginalPortalUrl(window.location.href, siteOrigin);
    const destination = language === "pt"
      ? originalUrl
      : buildAutomaticTranslationUrl(originalUrl, language);
    setOpen(false);
    window.location.assign(destination);
  };

  const currentOption = SITE_LANGUAGES.find((language) => language.code === current) ?? SITE_LANGUAGES[0];

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${mobile ? styles.mobile : ""} notranslate`}
      translate="no"
    >
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Traduzir site. Idioma atual: ${currentOption.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Languages strokeWidth={1.7} />
        <span className={styles.current}>{currentOption.short}</span>
        <ChevronDown strokeWidth={1.7} />
      </button>

      {open ? (
        <div className={styles.menu} role="menu" aria-label="Selecionar idioma">
          <span className={styles.heading}>Traduzir todo o portal</span>
          {SITE_LANGUAGES.map((language) => (
            <button
              key={language.code}
              type="button"
              role="menuitemradio"
              aria-checked={current === language.code}
              className={styles.option}
              onClick={() => chooseLanguage(language.code)}
            >
              <span className={styles.mark} aria-hidden="true">{language.mark}</span>
              <span className={styles.label}>{language.label}</span>
              {current === language.code ? <Check className={styles.check} strokeWidth={2} /> : <span />}
            </button>
          ))}
          <small className={styles.note}>Tradução automática pelo Google. O conteúdo original permanece em Português.</small>
        </div>
      ) : null}
    </div>
  );
}
