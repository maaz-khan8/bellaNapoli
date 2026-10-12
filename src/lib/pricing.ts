import type {
  CartItem,
  CartTotals,
  FulfillmentType,
  Product,
  Promotion,
  Restaurant,
  SelectedOption,
} from "@/lib/types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** Lowest price a customer can pay for a product ("from $x"). */
export function startingPrice(product: Product): number {
  if (product.kind === "pizza" && product.sizes.length > 0) {
    return Math.min(...product.sizes.map((s) => s.price));
  }
  return product.price;
}

/** Unit price of a configured product. Used by the customizer, cart and seed orders. */
export function configuredUnitPrice(
  product: Pick<Product, "price">,
  options: {
    size?: SelectedOption;
    crust?: SelectedOption;
    toppings?: SelectedOption[];
    addons?: SelectedOption[];
  },
): number {
  const base = options.size?.price ?? product.price;
  const crust = options.crust?.price ?? 0;
  const toppings = (options.toppings ?? []).reduce((sum, t) => sum + t.price, 0);
  const addons = (options.addons ?? []).reduce((sum, a) => sum + a.price, 0);
  return round2(base + crust + toppings + addons);
}

export function lineTotal(item: Pick<CartItem, "unitPrice" | "quantity">): number {
  return round2(item.unitPrice * item.quantity);
}

export function findPromotion(code: string | undefined, promotions: Promotion[]): Promotion | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase();
  return promotions.find((p) => p.code === normalized);
}

/** Validate a promo code against the current subtotal. */
export function evaluatePromo(
  code: string | undefined,
  promotions: Promotion[],
  subtotal: number,
): { promo?: Promotion; error?: string } {
  if (!code) return {};
  const promo = findPromotion(code, promotions);
  if (!promo || !promo.active) return { error: "This promo code isn't valid." };
  if (subtotal < promo.minSubtotal) {
    return { error: `Add ${formatMoney(promo.minSubtotal - subtotal)} more to use ${promo.code}.` };
  }
  return { promo };
}

function formatMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

/**
 * The single totals calculation used by the cart drawer, cart page, checkout,
 * order creation and seed data — so every screen agrees on the numbers.
 */
export function computeTotals(params: {
  items: Pick<CartItem, "unitPrice" | "quantity">[];
  promoCode?: string;
  fulfillment: FulfillmentType;
  restaurant: Pick<Restaurant, "delivery">;
  promotions: Promotion[];
}): CartTotals {
  const { items, promoCode, fulfillment, restaurant, promotions } = params;
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = round2(items.reduce((sum, i) => sum + lineTotal(i), 0));
  const { promo, error } = evaluatePromo(promoCode, promotions, subtotal);

  let discount = 0;
  if (promo?.type === "percent") discount = round2((subtotal * promo.value) / 100);
  if (promo?.type === "fixed") discount = Math.min(promo.value, subtotal);

  const { fee, freeDeliveryOver, minOrder } = restaurant.delivery;
  const isDelivery = fulfillment === "delivery";
  const qualifiesFree = subtotal >= freeDeliveryOver || promo?.type === "free_delivery";
  const deliveryFee = isDelivery && subtotal > 0 && !qualifiesFree ? fee : 0;

  return {
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    total: round2(Math.max(0, subtotal - discount + deliveryFee)),
    promo,
    promoError: error,
    belowMinimum: isDelivery && subtotal < minOrder ? round2(minOrder - subtotal) : 0,
    toFreeDelivery:
      isDelivery && !qualifiesFree && subtotal > 0 ? round2(freeDeliveryOver - subtotal) : 0,
  };
}
