"use client";

import { useTranslations } from "next-intl";
import { Pizza } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function LocaleNotFound() {
  const t = useTranslations("notFound");
  return (
    <main id="main" className="flex min-h-svh flex-1 flex-col items-center justify-center bg-cream-100 px-6 text-center">
      <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Pizza className="size-10" aria-hidden="true" />
      </span>
      <p className="mt-8 text-sm font-bold tracking-[0.2em] text-primary uppercase">404</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-4 max-w-md text-muted-foreground">{t("body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-12 rounded-full px-6"><Link href="/">{t("home")}</Link></Button>
        <Button asChild variant="outline" className="h-12 rounded-full px-6"><Link href="/menu">{t("menu")}</Link></Button>
      </div>
    </main>
  );
}
