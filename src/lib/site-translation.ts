export type SiteLanguage = "pt" | "en" | "es" | "ja";

export const SITE_LANGUAGES: ReadonlyArray<{
  code: SiteLanguage;
  short: string;
  label: string;
  mark: string;
}> = [
  { code: "pt", short: "PT", label: "Português", mark: "PT" },
  { code: "en", short: "EN", label: "English", mark: "A" },
  { code: "es", short: "ES", label: "Español", mark: "Ñ" },
  { code: "ja", short: "JP", label: "日本語", mark: "あ" },
];

const translatorParams = ["_x_tr_sl", "_x_tr_tl", "_x_tr_hl", "sl", "tl", "hl", "u"];

export function detectSiteLanguage(currentHref: string): SiteLanguage {
  const current = new URL(currentHref);
  const requested = current.searchParams.get("_x_tr_tl") ?? current.searchParams.get("tl");
  return requested === "en" || requested === "es" || requested === "ja" ? requested : "pt";
}

export function buildOriginalPortalUrl(currentHref: string, siteOrigin: string): string {
  const current = new URL(currentHref);
  const configuredOrigin = new URL(siteOrigin);
  const translatedSource = current.hostname === "translate.google.com" ? current.searchParams.get("u") : null;
  const source = translatedSource ? new URL(translatedSource) : current;
  const original = new URL(source.pathname, configuredOrigin);

  source.searchParams.forEach((value, key) => {
    if (!translatorParams.includes(key)) original.searchParams.append(key, value);
  });
  original.hash = source.hash;
  return original.toString();
}

export function buildAutomaticTranslationUrl(originalUrl: string, target: Exclude<SiteLanguage, "pt">): string {
  const translation = new URL("https://translate.google.com/translate");
  translation.searchParams.set("sl", "pt");
  translation.searchParams.set("tl", target);
  translation.searchParams.set("u", originalUrl);
  return translation.toString();
}
