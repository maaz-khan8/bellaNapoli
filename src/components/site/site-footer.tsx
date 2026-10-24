"use client";

import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { ChefHat, Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import { ResetDemoButton } from "@/components/shared/reset-demo-button";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { useDataStore } from "@/store/data-store";
import { useCatalog } from "@/hooks/use-catalog";
import { useContent } from "@/hooks/use-content";

export function SiteFooter() {
  const restaurant = useDataStore((s) => s.restaurant);
  const { categories } = useCatalog();
  const content = useContent();
  const t = useTranslations("footer");

  return (
    <footer className="relative overflow-hidden bg-charcoal-950 text-charcoal-200">
      <div className="pointer-events-none absolute -top-40 right-0 size-[30rem] rounded-full bg-tomato-500/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 md:pb-10 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-charcoal-300">{t("about", { tagline: content.tagline(restaurant) })}</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">{t("menu")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}><Link href={`/menu?category=${c.slug}`} className="hover:text-white">{content.categoryName(c)}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">{t("account")}</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/login" className="hover:text-white">{t("signIn")}</Link></li>
              <li><Link href="/register" className="hover:text-white">{t("createAccount")}</Link></li>
              <li><Link href="/account/orders" className="hover:text-white">{t("trackOrder")}</Link></li>
              <li><Link href="/cart" className="hover:text-white">{t("cart")}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">{t("visit")}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />{restaurant.address}, {restaurant.city}</li>
              <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />{restaurant.phone}</li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />{restaurant.email}</li>
              <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />{t("openDaily")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs text-charcoal-400">
            {t("copyright", { from: restaurant.foundedYear, name: restaurant.name })}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher align="end" className="h-9 text-charcoal-200 ring-white/10 hover:bg-white/5 hover:text-white data-[state=open]:bg-white/10" />
            <NextLink href="/manager/login" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-charcoal-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white">
              <ChefHat className="size-3.5" aria-hidden="true" /> {t("managerPortal")}
            </NextLink>
            <NextLink href="/super-admin/login" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-charcoal-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> {t("superAdmin")}
            </NextLink>
            <ResetDemoButton variant="ghost" className="h-9 text-xs text-charcoal-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white" />
          </div>
        </div>
      </div>
    </footer>
  );
}
