"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { BadgePercent, Bike, Check, X } from "lucide-react";
import type { CartTotals } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useDataStore } from "@/store/data-store";
import { formatCurrency } from "@/lib/format";

export function FreeDeliveryProgress({ totals }: { totals: CartTotals }) {
  const threshold = useDataStore((s) => s.restaurant.delivery.freeDeliveryOver);
  const fulfillment = useCartStore((s) => s.fulfillment);
  if (fulfillment !== "delivery" || totals.subtotal === 0) return null;
  const progress = Math.min(100, (totals.subtotal / threshold) * 100);
  const done = totals.toFreeDelivery <= 0;
  return (
    <div className="rounded-xl bg-basil-50 p-3 text-sm text-basil-700">
      <p className="flex items-center gap-2 font-medium">
        <Bike className="size-4" aria-hidden="true" />
        {done ? "You've unlocked free delivery!" : <>Add <strong>{formatCurrency(totals.toFreeDelivery)}</strong> for free delivery</>}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-basil-100" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free delivery">
        <motion.div className="h-full rounded-full bg-basil-500" initial={false} animate={{ width: `${progress}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>
    </div>
  );
}

export function PromoCodeInput() {
  const promoCode = useCartStore((s) => s.promoCode);
  const setPromoCode = useCartStore((s) => s.setPromoCode);
  const [value, setValue] = useState("");

  if (promoCode) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-dashed border-basil-500/40 bg-basil-50 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-2 font-semibold text-basil-700">
          <Check className="size-4" aria-hidden="true" /> {promoCode}
        </span>
        <button type="button" onClick={() => setPromoCode(undefined)} className="inline-flex size-8 items-center justify-center rounded-lg text-basil-700 hover:bg-basil-100" aria-label="Remove promo code">
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) setPromoCode(value);
        setValue("");
      }}
    >
      <label htmlFor="promo" className="sr-only">Promo code</label>
      <div className="relative flex-1">
        <BadgePercent className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input id="promo" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Promo code (try WELCOME10)" className="h-11 rounded-xl pl-9 uppercase placeholder:normal-case" />
      </div>
      <Button type="submit" variant="outline" className="h-11 rounded-xl px-4">Apply</Button>
    </form>
  );
}

export function TotalsList({ totals }: { totals: CartTotals }) {
  const fulfillment = useCartStore((s) => s.fulfillment);
  return (
    <dl className="space-y-2.5 text-sm">
      <div className="flex justify-between">
        <dt className="text-muted-foreground">Subtotal ({totals.itemCount} item{totals.itemCount === 1 ? "" : "s"})</dt>
        <dd className="tabular font-medium">{formatCurrency(totals.subtotal)}</dd>
      </div>
      {totals.promoError && (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{totals.promoError}</p>
      )}
      {totals.discount > 0 && (
        <div className="flex justify-between text-basil-600">
          <dt>Discount ({totals.promo?.code})</dt>
          <dd className="tabular font-medium">−{formatCurrency(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt className="text-muted-foreground">{fulfillment === "delivery" ? "Delivery fee" : "Pickup"}</dt>
        <dd className="tabular font-medium">{totals.deliveryFee > 0 ? formatCurrency(totals.deliveryFee) : <span className="text-basil-600">Free</span>}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t pt-3">
        <dt className="text-base font-semibold">Total</dt>
        <dd className="tabular text-2xl font-bold tracking-tight">
          <motion.span key={totals.total} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }}>{formatCurrency(totals.total)}</motion.span>
        </dd>
      </div>
    </dl>
  );
}
