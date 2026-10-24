import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LoginForm } from "@/components/auth/login-form";
import { PageLoader } from "@/components/shared/page-loader";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "meta" });
  return { title: t("signInTitle") };
}

export default async function CustomerLoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("auth.loginPage");
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 mb-8 text-muted-foreground">{t("subtitle")}</p>
      <Suspense fallback={<PageLoader className="min-h-60" />}>
        <LoginForm role="customer" forgotHref="/forgot-password" />
      </Suspense>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("new")}{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">{t("create")}</Link>
      </p>
    </>
  );
}
