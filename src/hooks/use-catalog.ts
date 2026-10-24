"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDataStore } from "@/store/data-store";

/** Customer-visible catalogue: enabled categories in manager-defined order, and their products. */
export function useCatalog() {
  const categories = useDataStore((s) => s.categories);
  const products = useDataStore((s) => s.products);

  return useMemo(() => {
    const visibleCategories = [...categories].filter((c) => c.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
    const visibleIds = new Set(visibleCategories.map((c) => c.id));
    const visibleProducts = products.filter((p) => visibleIds.has(p.categoryId));
    return { categories: visibleCategories, products: visibleProducts };
  }, [categories, products]);
}

/** Whether customers can place orders right now, and why not if they can't. */
export function useOrderingStatus() {
  const restaurant = useDataStore((s) => s.restaurant);
  const t = useTranslations("ordering");
  if (!restaurant.platformActive || restaurant.approvalStatus === "suspended") {
    return { canOrder: false, reason: t("unavailable", { name: restaurant.name }) };
  }
  if (!restaurant.acceptingOrders) {
    return { canOrder: false, reason: t("paused") };
  }
  return { canOrder: true, reason: "" };
}
