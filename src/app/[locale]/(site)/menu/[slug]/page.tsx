"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { PizzaIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PizzaCustomizer } from "@/components/site/pizza-customizer";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/page-loader";
import { useCatalog } from "@/hooks/use-catalog";
import { useHydrated } from "@/store/ui-store";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const hydrated = useHydrated();
  const { products } = useCatalog();
  const t = useTranslations("product");
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    if (!hydrated) return <PageLoader />;
    return (
      <EmptyState
        icon={PizzaIcon}
        title={t("notFound")}
        description={t("notFoundBody")}
        action={<Button asChild className="h-11 rounded-full px-6"><Link href="/menu">{t("backToMenu")}</Link></Button>}
        className="min-h-[60vh]"
      />
    );
  }

  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.available)
    .slice(0, 4);

  return (
    <>
      <PizzaCustomizer key={product.id} product={product} />
      {related.length > 0 && (
        <section className="bg-cream-200/60 py-16" aria-labelledby="related-heading">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 id="related-heading" className="font-display text-3xl font-semibold">{t("related")}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
