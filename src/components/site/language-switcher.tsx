"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPathname, usePathname } from "@/i18n/navigation";
import { LOCALE_LABELS, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className, align = "end" }: { className?: string; align?: "start" | "end" }) {
  const locale = useLocale();
  const t = useTranslations("language");
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  const change = (next: string) => {
    if (next === locale) return;
    setPending(true);
    // Full navigation on purpose: switching language swaps <html lang>, metadata and every string,
    // and a client-side switch through the locale redirect leaves stale router caches behind.
    // Cart and sessions persist in localStorage, so nothing is lost.
    const href = getPathname({ href: pathname, locale: next as Locale });
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full reload is intentional (see above)
    window.location.assign(`${href}${window.location.search}${window.location.hash}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm sm:px-3 font-semibold text-charcoal-700 ring-1 ring-border transition hover:bg-white hover:text-foreground data-[state=open]:bg-white",
            className,
          )}
          aria-label={t("label", { language: LOCALE_LABELS[locale].native })}
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Globe className="hidden size-4 text-primary sm:block" aria-hidden="true" />}
          <span>{LOCALE_LABELS[locale].short}</span>
          <ChevronDown className="hidden size-3.5 opacity-60 sm:block" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("choose")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={locale} onValueChange={change}>
          {routing.locales.map((l) => (
            <DropdownMenuRadioItem key={l} value={l} lang={l} className="h-10 cursor-pointer gap-3">
              <span className="flex w-7 justify-center rounded-md bg-muted py-0.5 text-[11px] font-bold text-muted-foreground">
                {LOCALE_LABELS[l].short}
              </span>
              <span className="flex-1 font-medium">{LOCALE_LABELS[l].native}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
