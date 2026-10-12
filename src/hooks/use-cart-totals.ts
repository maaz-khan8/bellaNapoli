"use client";

import { useMemo } from "react";
import { computeTotals } from "@/lib/pricing";
import { useCartStore } from "@/store/cart-store";
import { useDataStore } from "@/store/data-store";
import type { FulfillmentType } from "@/lib/types";

export function useCartTotals(fulfillmentOverride?: FulfillmentType) {
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const storedFulfillment = useCartStore((s) => s.fulfillment);
  const restaurant = useDataStore((s) => s.restaurant);
  const promotions = useDataStore((s) => s.promotions);
  const fulfillment = fulfillmentOverride ?? storedFulfillment;

  return useMemo(
    () => computeTotals({ items, promoCode, fulfillment, restaurant, promotions }),
    [items, promoCode, fulfillment, restaurant, promotions],
  );
}
