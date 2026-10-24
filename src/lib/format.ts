export interface Formatter {
  currency: (n: number) => string;
  compactCurrency: (n: number) => string;
  number: (n: number) => string;
  compact: (n: number) => string;
  /** One decimal, e.g. ratings: 4,9 / 4.9 */
  decimal: (n: number) => string;
  date: (iso: string | number | Date, opts?: Intl.DateTimeFormatOptions) => string;
  time: (iso: string | number | Date) => string;
  dateTime: (iso: string | number | Date) => string;
  timeAgo: (iso: string | number | Date, now?: number) => string;
}

/** Locale-bound formatters. The customer site uses these via useFormat(); staff portals use the en-US exports below. */
export function createFormatter(tag: string): Formatter {
  const currency = new Intl.NumberFormat(tag, { style: "currency", currency: "USD" });
  const compactCurrency = new Intl.NumberFormat(tag, { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 });
  const number = new Intl.NumberFormat(tag);
  const compact = new Intl.NumberFormat(tag, { notation: "compact", maximumFractionDigits: 1 });
  const decimal = new Intl.NumberFormat(tag, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const relative = new Intl.RelativeTimeFormat(tag, { numeric: "auto", style: "short" });
  const date = (iso: string | number | Date, opts?: Intl.DateTimeFormatOptions) =>
    new Date(iso).toLocaleDateString(tag, opts ?? { month: "short", day: "numeric", year: "numeric" });
  const time = (iso: string | number | Date) => new Date(iso).toLocaleTimeString(tag, { hour: "numeric", minute: "2-digit" });
  return {
    currency: (n) => currency.format(n),
    compactCurrency: (n) => (Math.abs(n) >= 10000 ? compactCurrency.format(n) : currency.format(n)),
    number: (n) => number.format(n),
    compact: (n) => compact.format(n),
    decimal: (n) => decimal.format(n),
    date,
    time,
    dateTime: (iso) => `${date(iso, { month: "short", day: "numeric" })}, ${time(iso)}`,
    timeAgo: (iso, now = Date.now()) => {
      const min = Math.round(Math.max(0, now - new Date(iso).getTime()) / 60000);
      if (min < 1) return relative.format(0, "minute");
      if (min < 60) return relative.format(-min, "minute");
      const h = Math.round(min / 60);
      if (h < 24) return relative.format(-h, "hour");
      const d = Math.round(h / 24);
      if (d < 30) return relative.format(-d, "day");
      return date(iso);
    },
  };
}

const en = createFormatter("en-US");

export const formatCurrency = en.currency;
export const formatCompactCurrency = en.compactCurrency;
export const formatNumber = en.number;
export const formatPercent = (n: number, digits = 1) => `${n.toFixed(digits)}%`;
export const formatDate = en.date;
export const formatTime = en.time;
export const formatDateTime = en.dateTime;

export function timeAgo(iso: string | number | Date, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d > 1 ? "s" : ""} ago`;
  return formatDate(iso);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
