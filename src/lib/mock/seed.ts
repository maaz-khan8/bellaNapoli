import type {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEvent,
  Product,
  Promotion,
  Restaurant,
} from "@/lib/types";
import { ADDONS, CRUSTS, PRODUCTS, PROMOTIONS, TOPPINGS } from "@/lib/mock/catalog";
import { RESTAURANT_DEFAULTS } from "@/lib/config/restaurant";
import { computeTotals, configuredUnitPrice, round2 } from "@/lib/pricing";

export const DEMO_CUSTOMER_ID = "cus_demo";
const MIN = 60_000;
const DAY = 86_400_000;
const HISTORY_DAYS = 90;

/** Small deterministic PRNG so the demo data looks the same on every reset. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const FIRST = ["Olivia", "Liam", "Ava", "Noah", "Isabella", "Lucas", "Mia", "Ethan", "Amara", "Mateo", "Chloe", "Leo", "Zara", "Owen", "Hannah", "Kenji", "Grace", "Omar", "Ruby", "Diego", "Nadia", "Felix", "Leila", "Samuel", "Ines", "Theo", "Maya", "Arjun", "Clara"];
const LAST = ["Bennett", "Okafor", "Moretti", "Chen", "Alvarez", "Novak", "Haddad", "Kim", "Russo", "Patel", "Fischer", "Dubois", "Santos", "Park", "Rossi", "Nguyen", "Walsh", "Costa", "Ibrahim", "Larsen", "Romero", "Tanaka", "Murphy", "Greco", "Singh", "Bauer", "Silva", "Kowalski", "Ricci"];
const STREETS = ["Spring Street", "Prince Street", "Elizabeth Street", "Grand Street", "Broome Street", "Kenmare Street", "Lafayette Street", "Bowery", "Mott Street", "Hester Street", "Canal Street", "Houston Street"];

export function createSeedCustomers(now: number): Customer[] {
  const rand = mulberry32(7);
  const customers: Customer[] = [
    {
      id: DEMO_CUSTOMER_ID,
      name: "Sophia Romano",
      email: "customer@demo.com",
      phone: "(212) 555-0199",
      joinedAt: new Date(startOfDay(now) - 140 * DAY).toISOString(),
      status: "active",
      addresses: [
        { id: "addr_demo_home", label: "Home", line1: "88 Prince Street, Apt 4B", city: "New York, NY", postalCode: "10012", notes: "Buzzer 4B — leave with doorman if out", isDefault: true },
        { id: "addr_demo_work", label: "Work", line1: "450 Lafayette Street, Floor 6", city: "New York, NY", postalCode: "10003", notes: "Ask reception for Sophia", isDefault: false },
      ],
    },
  ];
  for (let i = 0; i < FIRST.length; i++) {
    const first = FIRST[i]!;
    const last = LAST[i]!;
    const daysAgo = Math.floor(rand() * 320) + 2;
    customers.push({
      id: `cus_${String(i + 1).padStart(3, "0")}`,
      name: `${first} ${last}`,
      email: `${first}.${last}@example.com`.toLowerCase(),
      phone: `(212) 555-${String(1000 + Math.floor(rand() * 8999)).slice(0, 4)}`,
      joinedAt: new Date(startOfDay(now) - daysAgo * DAY + Math.floor(rand() * 12 + 9) * 60 * MIN).toISOString(),
      status: i === 11 || i === 23 ? "inactive" : "active",
      addresses: [
        {
          id: `addr_${i + 1}`,
          label: rand() > 0.3 ? "Home" : "Work",
          line1: `${Math.floor(rand() * 400) + 10} ${STREETS[Math.floor(rand() * STREETS.length)]}`,
          city: "New York, NY",
          postalCode: `100${String(Math.floor(rand() * 40) + 10)}`,
          isDefault: true,
        },
      ],
    });
  }
  return customers;
}

function pick<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)]!;
}

function weightedPick<T>(rand: () => number, list: T[], weight: (t: T) => number): T {
  const total = list.reduce((s, t) => s + weight(t), 0);
  let r = rand() * total;
  for (const t of list) {
    r -= weight(t);
    if (r <= 0) return t;
  }
  return list[list.length - 1]!;
}

function buildItem(rand: () => number, product: Product): OrderItem {
  const quantity = rand() < 0.82 ? 1 : 2;
  if (product.kind !== "pizza") {
    const unitPrice = product.price;
    return { productId: product.id, name: product.name, image: product.image, toppings: [], addons: [], unitPrice, quantity, lineTotal: round2(unitPrice * quantity) };
  }
  const sizeRoll = rand();
  const size = product.sizes[sizeRoll < 0.15 ? 0 : sizeRoll < 0.55 ? 1 : sizeRoll < 0.9 ? 2 : 3]!;
  const crust = rand() < 0.6 ? CRUSTS[0]! : pick(rand, CRUSTS);
  const toppings = rand() < 0.35
    ? TOPPINGS.filter((t) => product.toppingIds.includes(t.id)).filter(() => rand() < 0.12).slice(0, 2)
    : [];
  const addons = rand() < 0.25 ? [pick(rand, ADDONS.filter((a) => product.addonIds.includes(a.id)))] : [];
  const unitPrice = configuredUnitPrice(product, {
    size: { id: size.id, name: size.label, price: size.price },
    crust: { id: crust.id, name: crust.name, price: crust.price },
    toppings: toppings.map((t) => ({ id: t.id, name: t.name, price: t.price })),
    addons: addons.map((a) => ({ id: a.id, name: a.name, price: a.price })),
  });
  return {
    productId: product.id,
    name: product.name,
    image: product.image,
    size: `${size.label} ${size.inches}"`,
    crust: crust.name,
    toppings: toppings.map((t) => t.name),
    addons: addons.map((a) => a.name),
    unitPrice,
    quantity,
    lineTotal: round2(unitPrice * quantity),
  };
}

function historyFor(status: OrderStatus, createdAt: number, rand: () => number): OrderStatusEvent[] {
  const at = (mins: number) => new Date(createdAt + mins * MIN).toISOString();
  const events: OrderStatusEvent[] = [{ status: "pending", at: at(0) }];
  if (status === "rejected") {
    events.push({ status: "rejected", at: at(3), note: pick(rand, ["Kitchen at full capacity", "Address outside delivery zone", "Item unavailable"]) });
    return events;
  }
  if (status === "cancelled") {
    events.push({ status: "cancelled", at: at(4), note: "Cancelled by customer" });
    return events;
  }
  const flow: [OrderStatus, number][] = [["accepted", 2], ["preparing", 6], ["ready", 19], ["completed", 38]];
  for (const [s, mins] of flow) {
    events.push({ status: s, at: at(mins + Math.floor(rand() * 4)) });
    if (s === status) break;
  }
  return events;
}

interface DraftOrder {
  createdAt: number;
  customer: Customer;
  status: OrderStatus;
}

export function createSeedOrders(
  now: number,
  customers: Customer[],
  products: Product[] = PRODUCTS,
  promotions: Promotion[] = PROMOTIONS,
  restaurant: Restaurant = RESTAURANT_DEFAULTS,
): Order[] {
  const rand = mulberry32(42);
  const today = startOfDay(now);
  const weekdayBase = [10, 7, 7, 8, 9, 13, 14]; // Sun..Sat
  const hours = [11, 12, 12, 13, 13, 14, 15, 16, 17, 18, 18, 19, 19, 19, 20, 20, 21, 22];
  const others = customers.filter((c) => c.id !== DEMO_CUSTOMER_ID);
  const demo = customers.find((c) => c.id === DEMO_CUSTOMER_ID)!;
  const demoDays = new Set([62, 41, 23, 11, 4]);
  const drafts: DraftOrder[] = [];

  for (let d = HISTORY_DAYS; d >= 1; d--) {
    const dayStart = today - d * DAY;
    const trend = 0.78 + (0.32 * (HISTORY_DAYS - d)) / HISTORY_DAYS; // steady growth story
    const count = Math.max(3, Math.round(weekdayBase[new Date(dayStart).getDay()]! * trend * (0.8 + rand() * 0.4)));
    for (let i = 0; i < count; i++) {
      const createdAt = dayStart + pick(rand, hours) * 60 * MIN + Math.floor(rand() * 60) * MIN;
      const eligible = others.filter((c) => new Date(c.joinedAt).getTime() <= createdAt);
      const roll = rand();
      drafts.push({
        createdAt,
        customer: pick(rand, eligible.length ? eligible : others),
        status: roll < 0.035 ? "cancelled" : roll < 0.06 ? "rejected" : "completed",
      });
    }
    if (demoDays.has(d)) drafts.push({ createdAt: dayStart + 19 * 60 * MIN + 20 * MIN, customer: demo, status: "completed" });
  }

  // Today: a lively, in-progress service the manager can act on immediately
  const todayPlan: [number, OrderStatus][] = [
    [240, "completed"], [205, "completed"], [180, "completed"], [150, "completed"], [128, "cancelled"],
    [110, "completed"], [92, "completed"], [70, "completed"], [52, "completed"], [36, "ready"],
    [27, "preparing"], [18, "accepted"], [9, "pending"], [4, "pending"],
  ];
  for (const [minsAgo, status] of todayPlan) {
    const createdAt = now - minsAgo * MIN;
    if (createdAt < today) continue;
    drafts.push({ createdAt, customer: pick(rand, others.filter((c) => c.status === "active")), status });
  }

  drafts.sort((a, b) => a.createdAt - b.createdAt);
  const pizzas = products.filter((p) => p.kind === "pizza");

  return drafts.map((draft, index): Order => {
    const lines = 1 + Math.floor(rand() * 3);
    const chosen = new Map<string, OrderItem>();
    chosen.set("main", buildItem(rand, weightedPick(rand, pizzas, (p) => p.popularity)));
    for (let l = 1; l < lines; l++) {
      const product = weightedPick(rand, products, (p) => p.popularity);
      if (!chosen.has(product.id)) chosen.set(product.id, buildItem(rand, product));
    }
    const items = [...chosen.values()];
    const fulfillment = rand() < 0.64 ? "delivery" : "pickup";
    const promoRoll = rand();
    const promoCode = promoRoll < 0.06 ? "WELCOME10" : promoRoll < 0.1 ? "PIZZA20" : promoRoll < 0.12 ? "FREEDEL" : undefined;
    const totals = computeTotals({ items, promoCode, fulfillment, restaurant, promotions });
    const address = draft.customer.addresses.find((a) => a.isDefault) ?? draft.customer.addresses[0];
    const number = 10001 + index;

    return {
      id: `ord_${number}`,
      number: `BN-${number}`,
      customerId: draft.customer.id,
      customer: { name: draft.customer.name, email: draft.customer.email, phone: draft.customer.phone },
      fulfillment,
      address: fulfillment === "delivery" && address ? `${address.line1}, ${address.city} ${address.postalCode}` : undefined,
      instructions: fulfillment === "delivery" && rand() < 0.25 ? "Please ring the bell twice" : undefined,
      paymentMethod: "cod",
      promoCode: totals.promo ? promoCode : undefined,
      items,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      discount: totals.discount,
      total: totals.total,
      status: draft.status,
      history: historyFor(draft.status, draft.createdAt, rand),
      createdAt: new Date(draft.createdAt).toISOString(),
      estimatedMinutes: fulfillment === "delivery" ? restaurant.delivery.estimatedMinutes : restaurant.pickup.estimatedMinutes,
      placedInDemo: false,
    };
  });
}
