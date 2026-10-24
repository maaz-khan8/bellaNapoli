import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { PHOTOS } from "@/lib/images";

export default async function CustomerAuthLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("auth.layout");

  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col bg-cream-100 px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between gap-2">
          <Logo />
          <div className="flex items-center gap-1">
            <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-white hover:text-foreground">
              <ArrowLeft className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">{t("back")}</span>
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </main>
        <p className="text-center text-xs text-muted-foreground">{t("note")}</p>
      </div>
      <div className="relative hidden overflow-hidden bg-charcoal-950 lg:block">
        <Image src={PHOTOS.cheesePull} alt="" fill priority sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-linear-to-t from-charcoal-950 via-charcoal-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <div className="flex gap-1" role="img" aria-label={t("stars")}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-5 fill-gold-400 text-gold-400" aria-hidden="true" />)}
          </div>
          <blockquote className="mt-4 max-w-lg font-display text-3xl leading-snug">“{t("quote")}”</blockquote>
          <p className="mt-4 text-sm text-white/70">{t("quoteBy")}</p>
        </div>
      </div>
    </div>
  );
}
