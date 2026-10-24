"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimatePresence } from "motion/react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { CartLine } from "@/components/site/cart-line";
import { FreeDeliveryProgress, TotalsList } from "@/components/site/cart-summary";
import { useCartStore } from "@/store/cart-store";
import { useUIStore } from "@/store/ui-store";
import { useCartTotals } from "@/hooks/use-cart-totals";

export function CartDrawer() {
  const open = useUIStore((s) => s.cartOpen);
  const setOpen = useUIStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const totals = useCartTotals();
  const close = () => setOpen(false);
  const t = useTranslations("cart");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full gap-0 bg-cream-50 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 font-display text-2xl font-semibold">
            <ShoppingBag className="size-5 text-primary" aria-hidden="true" /> {t("drawerTitle")}
          </SheetTitle>
          <SheetDescription>{totals.itemCount ? t("drawerCount", { count: totals.itemCount }) : t("drawerEmpty")}</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={t("emptyTitle")}
            description={t("emptyDrawer")}
            action={<Button asChild className="h-11 rounded-full px-6" onClick={close}><Link href="/menu">{t("browseMenu")}</Link></Button>}
            className="flex-1"
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <ul className="divide-y">
                <AnimatePresence initial={false}>
                  {items.map((item) => <CartLine key={item.id} item={item} size="sm" />)}
                </AnimatePresence>
              </ul>
            </div>
            <div className="space-y-4 border-t bg-background px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <FreeDeliveryProgress totals={totals} />
              <TotalsList totals={totals} />
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="h-12 rounded-full" onClick={close}>
                  <Link href="/cart">{t("viewCart")}</Link>
                </Button>
                <Button asChild className="h-12 rounded-full font-semibold" onClick={close}>
                  <Link href="/checkout">{t("checkout")} <ArrowRight /></Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
