"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { useFormat } from "@/hooks/use-format";
import { AnimatePresence, motion } from "motion/react";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { useUIStore } from "@/store/ui-store";

// Product pages have their own fixed purchase bar in the same spot
const HIDDEN_ON = ["/cart", "/checkout", "/order-confirmation", "/menu/"];

/** Sticky bottom cart access for phones. */
export function MobileCartBar() {
  const pathname = usePathname();
  const totals = useCartTotals();
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const t = useTranslations("cart");
  const f = useFormat();
  const visible = totals.itemCount > 0 && !HIDDEN_ON.some((p) => pathname.startsWith(p));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="flex h-14 w-full items-center gap-3 rounded-2xl bg-charcoal-900 px-4 text-white shadow-2xl shadow-black/30"
          >
            <span className="relative flex size-9 items-center justify-center rounded-xl bg-primary">
              <ShoppingBag className="size-5" aria-hidden="true" />
              <span className="tabular absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-primary">
                {totals.itemCount}
              </span>
            </span>
            <span className="flex-1 text-left text-sm font-semibold">{t("viewOrder")}</span>
            <span className="tabular font-bold">{f.currency(totals.total)}</span>
            <ChevronRight className="size-5 opacity-60" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
