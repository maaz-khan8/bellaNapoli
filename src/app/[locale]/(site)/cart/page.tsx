"use client";

import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { AlertTriangle, ArrowLeft, ArrowRight, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoader } from "@/components/shared/page-loader";
import { CartLine } from "@/components/site/cart-line";
import { FreeDeliveryProgress, PromoCodeInput, TotalsList } from "@/components/site/cart-summary";
import { FulfillmentToggle } from "@/components/site/fulfillment-toggle";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/ui-store";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { useSession } from "@/hooks/use-session";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const hydrated = useHydrated();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const fulfillment = useCartStore((s) => s.fulfillment);
  const setFulfillment = useCartStore((s) => s.setFulfillment);
  const totals = useCartTotals();
  const session = useSession("customer");

  if (!hydrated) return <PageLoader label="Loading your cart" />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything yet. Our ovens are fired up and ready."
        action={<Button asChild className="h-12 rounded-full px-7"><Link href="/menu">Browse the menu</Link></Button>}
        className="min-h-[60vh]"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Your cart</h1>
          <p className="mt-2 text-muted-foreground">{totals.itemCount} item{totals.itemCount === 1 ? "" : "s"} · ready when you are</p>
        </div>
        <Button variant="ghost" className="text-muted-foreground" onClick={clear}>Clear cart</Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_24rem]">
        <section aria-label="Cart items" className="rounded-3xl bg-card px-5 shadow-sm ring-1 ring-border sm:px-7">
          <ul className="divide-y">
            <AnimatePresence initial={false}>
              {items.map((item) => <CartLine key={item.id} item={item} />)}
            </AnimatePresence>
          </ul>
          <div className="border-t py-5">
            <Link href="/menu" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              <ArrowLeft className="size-4" aria-hidden="true" /> Continue shopping
            </Link>
          </div>
        </section>

        <aside aria-label="Order summary" className="h-fit space-y-5 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <FulfillmentToggle value={fulfillment} onChange={setFulfillment} />
          <FreeDeliveryProgress totals={totals} />
          <PromoCodeInput />
          <TotalsList totals={totals} />
          {totals.belowMinimum > 0 && (
            <p role="alert" className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Delivery orders need a minimum of {formatCurrency(totals.subtotal + totals.belowMinimum)}. Add {formatCurrency(totals.belowMinimum)} more or switch to pickup.
            </p>
          )}
          <Button asChild className="h-13 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/25">
            <Link href="/checkout">Proceed to checkout <ArrowRight /></Link>
          </Button>
          {!session && (
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden="true" /> You&apos;ll sign in before placing your order — your cart is saved.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
