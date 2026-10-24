"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useContent } from "@/hooks/use-content";
import { useFormat } from "@/hooks/use-format";
import { motion } from "motion/react";
import { Plus, SlidersHorizontal, Star, TrendingUp } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductTagBadge } from "@/components/site/product-tags";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { startingPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority = false, className }: { product: Product; priority?: boolean; className?: string }) {
  const { quickAdd } = useAddToCart();
  const t = useTranslations("product");
  const content = useContent();
  const f = useFormat();
  const name = content.productName(product);
  const href = `/menu/${product.slug}`;
  const from = startingPrice(product);
  const isPizza = product.kind === "pizza";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/70 transition-shadow duration-300 hover:shadow-[0_24px_50px_-20px_rgb(214_58_38/0.35)]",
        className,
      )}
    >
      <Link href={href} className="relative block aspect-4/3 overflow-hidden bg-muted" tabIndex={-1} aria-hidden="true">
        <Image
          src={product.image}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn(
            "object-cover transition-transform duration-700 ease-out group-hover:scale-110",
            !product.available && "grayscale",
          )}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.bestSeller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
              <TrendingUp className="size-3" aria-hidden="true" /> {t("bestseller")}
            </span>
          )}
          {product.tags.filter((t) => t !== "veg").slice(0, 2).map((t) => <ProductTagBadge key={t} tag={t} />)}
        </div>
        <span className="glass absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-charcoal-900">
          <Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden="true" />
          {product.reviewCount > 0 ? <span aria-label={t("rated", { rating: f.decimal(product.rating) })}>{f.decimal(product.rating)}</span> : t("new")}
        </span>
        {!product.available && (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900/40">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-charcoal-900">{t("soldOut")}</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl leading-tight font-semibold">
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
              {name}
            </Link>
          </h3>
          {product.tags.includes("veg") && <ProductTagBadge tag="veg" className="mt-0.5 shrink-0" />}
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{content.productDescription(product)}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <p className="leading-none">
            {isPizza && <span className="block text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{t("from")}</span>}
            <span className="tabular text-xl font-bold">{f.currency(from)}</span>
          </p>
          <div className="relative z-10 flex gap-2">
            {isPizza && (
              <Link
                href={href}
                className="inline-flex size-11 items-center justify-center rounded-full bg-muted text-foreground ring-1 ring-border transition hover:bg-charcoal-900 hover:text-white"
                aria-label={t("customize", { name })}
              >
                <SlidersHorizontal className="size-4.5" />
              </Link>
            )}
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              disabled={!product.available}
              onClick={() => quickAdd(product)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-tomato-600 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              aria-label={product.available ? (isPizza ? t("quickAddPizza", { name }) : t("quickAdd", { name })) : t("soldOutAria", { name })}
            >
              <Plus className="size-4" aria-hidden="true" /> {t("add")}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
