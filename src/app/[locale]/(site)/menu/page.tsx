import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MenuBrowser } from "@/components/site/menu-browser";
import { PageLoader } from "@/components/shared/page-loader";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
  return { title: t("menuTitle") };
}

export default function MenuPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MenuBrowser />
    </Suspense>
  );
}
