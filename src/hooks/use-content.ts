"use client";

import { useMemo } from "react";
import { useMessages } from "next-intl";
import type { Category, Crust, OrderItem, Product, Promotion, Restaurant, Review } from "@/lib/types";
import { ADDONS, CATEGORIES, CRUSTS, PRODUCTS, PROMOTIONS, TOPPINGS } from "@/lib/mock/catalog";
import { RESTAURANT_DEFAULTS } from "@/lib/config/restaurant";

type Text = { name?: string; description?: string };
interface ContentMessages {
  products?: Record<string, Text>;
  categories?: Record<string, Text>;
  crusts?: Record<string, Text>;
  toppings?: Record<string, string>;
  addons?: Record<string, string>;
  sizes?: Record<string, string>;
  promotions?: Record<string, { title?: string; description?: string }>;
  reviews?: Record<string, { quote?: string }>;
  restaurant?: { tagline?: string; description?: string };
}

const SEED = {
  products: new Map(PRODUCTS.map((p) => [p.id, p])),
  categories: new Map(CATEGORIES.map((c) => [c.id, c])),
  crusts: new Map(CRUSTS.map((c) => [c.id, c])),
  toppings: new Map(TOPPINGS.map((t) => [t.id, t.name])),
  addons: new Map(ADDONS.map((a) => [a.id, a.name])),
  promotions: new Map(PROMOTIONS.map((p) => [p.id, p])),
  reviews: new Map(RESTAURANT_DEFAULTS.reviews.map((r) => [r.id, r])),
};
// Orders store option names as text, so map English names back to ids
const BY_NAME = {
  crust: new Map(CRUSTS.map((c) => [c.name, c.id])),
  topping: new Map(TOPPINGS.map((t) => [t.name, t.id])),
  addon: new Map(ADDONS.map((a) => [a.name, a.id])),
};

/** Use the translation only while the stored value is still the original seed text. */
function pick(translated: string | undefined, current: string, seed: string | undefined) {
  return translated && current === seed ? translated : current;
}

/**
 * Localizes mock catalogue content (dishes, categories, options, promos, reviews).
 * In production these would come per-locale from the API; here translations live in
 * messages/<locale>.json under "content", and manager edits always win.
 */
export function useContent() {
  const c = (useMessages() as { content?: ContentMessages }).content;

  return useMemo(() => {
    const sizeLabel = (label: string) => c?.sizes?.[label] ?? label;
    const toppingName = (id: string, current: string) => pick(c?.toppings?.[id], current, SEED.toppings.get(id));
    const addonName = (id: string, current: string) => pick(c?.addons?.[id], current, SEED.addons.get(id));

    return {
      productName: (p: Pick<Product, "id" | "name">) => pick(c?.products?.[p.id]?.name, p.name, SEED.products.get(p.id)?.name),
      productDescription: (p: Pick<Product, "id" | "description">) =>
        pick(c?.products?.[p.id]?.description, p.description, SEED.products.get(p.id)?.description),
      categoryName: (cat: Pick<Category, "id" | "name">) => pick(c?.categories?.[cat.id]?.name, cat.name, SEED.categories.get(cat.id)?.name),
      categoryDescription: (cat: Pick<Category, "id" | "description">) =>
        pick(c?.categories?.[cat.id]?.description, cat.description, SEED.categories.get(cat.id)?.description),
      crustName: (cr: Pick<Crust, "id" | "name">) => pick(c?.crusts?.[cr.id]?.name, cr.name, SEED.crusts.get(cr.id)?.name),
      crustDescription: (cr: Pick<Crust, "id" | "description">) =>
        pick(c?.crusts?.[cr.id]?.description, cr.description, SEED.crusts.get(cr.id)?.description),
      toppingName,
      addonName,
      sizeLabel,
      /** "Large 14\"" → "Groß 14\"" */
      sizeText: (text: string) => {
        const [label, ...rest] = text.split(" ");
        return [sizeLabel(label!), ...rest].join(" ");
      },
      promoTitle: (p: Pick<Promotion, "id" | "title">) => pick(c?.promotions?.[p.id]?.title, p.title, SEED.promotions.get(p.id)?.title),
      promoDescription: (p: Pick<Promotion, "id" | "description">) =>
        pick(c?.promotions?.[p.id]?.description, p.description, SEED.promotions.get(p.id)?.description),
      reviewQuote: (r: Pick<Review, "id" | "quote">) => pick(c?.reviews?.[r.id]?.quote, r.quote, SEED.reviews.get(r.id)?.quote),
      tagline: (r: Pick<Restaurant, "tagline">) => pick(c?.restaurant?.tagline, r.tagline, RESTAURANT_DEFAULTS.tagline),
      restaurantDescription: (r: Pick<Restaurant, "description">) =>
        pick(c?.restaurant?.description, r.description, RESTAURANT_DEFAULTS.description),
      /** Translate the option lines of a stored order item. */
      orderItemDetails: (item: OrderItem) => {
        const crustId = item.crust ? BY_NAME.crust.get(item.crust) : undefined;
        return [
          item.size ? (item.size.includes(" ") ? item.size.split(" ").map((w, i) => (i === 0 ? sizeLabel(w) : w)).join(" ") : sizeLabel(item.size)) : undefined,
          item.crust ? (crustId ? pick(c?.crusts?.[crustId]?.name, item.crust, item.crust) : item.crust) : undefined,
          ...item.toppings.map((n) => `+ ${BY_NAME.topping.has(n) ? toppingName(BY_NAME.topping.get(n)!, n) : n}`),
          ...item.addons.map((n) => `+ ${BY_NAME.addon.has(n) ? addonName(BY_NAME.addon.get(n)!, n) : n}`),
        ].filter(Boolean) as string[];
      },
      orderItemName: (item: Pick<OrderItem, "productId" | "name">) =>
        pick(c?.products?.[item.productId]?.name, item.name, SEED.products.get(item.productId)?.name),
    };
  }, [c]);
}
