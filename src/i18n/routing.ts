import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en", "tr"],
  defaultLocale: "de",
  // German lives at the root (/menu); others are prefixed (/en/menu, /tr/menu)
  localePrefix: "as-needed",
  // Always start in German unless the visitor picks another language
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<Locale, { native: string; short: string }> = {
  de: { native: "Deutsch", short: "DE" },
  en: { native: "English", short: "EN" },
  tr: { native: "Türkçe", short: "TR" },
};

/** Build a locale-aware URL for code that uses Next's plain router (shared with the dashboards). */
export function localizePath(path: string, locale: string) {
  if (locale === routing.defaultLocale) return path;
  return `/${locale}${path === "/" ? "" : path}`;
}
