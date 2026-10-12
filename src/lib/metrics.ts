import type { Commission, Customer, Order, OrderStatus } from "@/lib/types";
import { round2 } from "@/lib/pricing";

const DAY = 86_400_000;

/**
 * Revenue rules (shared by every dashboard):
 * - An order counts toward sales unless it was rejected or cancelled.
 * - Gross sales = sum of order totals (food − discount + delivery fees).
 * - Platform commission = gross × commission rate; restaurant earnings = gross − commission.
 */
export const isRevenueOrder = (o: Order) => o.status !== "rejected" && o.status !== "cancelled";

export function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export type RangeKey = "today" | "7d" | "30d" | "90d" | "all";

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export function rangeBounds(range: RangeKey, now = Date.now()): { from: number; to: number } {
  const today = startOfDay(now);
  const to = now + DAY; // include orders placed "now"
  switch (range) {
    case "today":
      return { from: today, to };
    case "7d":
      return { from: today - 6 * DAY, to };
    case "30d":
      return { from: today - 29 * DAY, to };
    case "90d":
      return { from: today - 89 * DAY, to };
    default:
      return { from: 0, to };
  }
}

/** The equally long window immediately before the given range — for trend deltas */
export function previousBounds(range: RangeKey, now = Date.now()) {
  const { from, to } = rangeBounds(range, now);
  if (range === "all") return null;
  const len = Math.min(to, now) - from;
  return { from: from - len, to: from };
}

export function inRange(orders: Order[], from: number, to: number) {
  return orders.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= from && t < to;
  });
}

export function ordersInRange(orders: Order[], range: RangeKey, now = Date.now()) {
  const { from, to } = rangeBounds(range, now);
  return inRange(orders, from, to);
}

export interface OrderSummary {
  revenue: number;
  orders: number;
  revenueOrders: number;
  pending: number;
  active: number;
  completed: number;
  cancelled: number;
  rejected: number;
  averageOrderValue: number;
  itemsSold: number;
}

export function summarize(orders: Order[]): OrderSummary {
  const revenueOrders = orders.filter(isRevenueOrder);
  const revenue = round2(revenueOrders.reduce((s, o) => s + o.total, 0));
  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;
  return {
    revenue,
    orders: orders.length,
    revenueOrders: revenueOrders.length,
    pending: count("pending"),
    active: orders.filter((o) => ["accepted", "preparing", "ready"].includes(o.status)).length,
    completed: count("completed"),
    cancelled: count("cancelled"),
    rejected: count("rejected"),
    averageOrderValue: revenueOrders.length ? round2(revenue / revenueOrders.length) : 0,
    itemsSold: revenueOrders.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0),
  };
}

export function percentChange(current: number, previous: number): number | null {
  if (!previous) return current ? null : 0;
  return ((current - previous) / previous) * 100;
}

export type Granularity = "day" | "week" | "month";

export interface SeriesPoint {
  key: string;
  label: string;
  start: number;
  revenue: number;
  orders: number;
  commission: number;
  earnings: number;
}

function bucketStart(ts: number, g: Granularity) {
  const d = new Date(startOfDay(ts));
  if (g === "week") d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  if (g === "month") d.setDate(1);
  return d.getTime();
}

function nextBucket(ts: number, g: Granularity) {
  const d = new Date(ts);
  if (g === "day") d.setDate(d.getDate() + 1);
  if (g === "week") d.setDate(d.getDate() + 7);
  if (g === "month") d.setMonth(d.getMonth() + 1);
  return d.getTime();
}

function bucketLabel(ts: number, g: Granularity) {
  const d = new Date(ts);
  if (g === "month") return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Time series with empty buckets filled, so charts never skip days. */
export function salesSeries(
  orders: Order[],
  g: Granularity,
  from: number,
  to: number,
  commissionRate = 0,
): SeriesPoint[] {
  const firstOrder = orders.length ? Math.min(...orders.map((o) => new Date(o.createdAt).getTime())) : to;
  const start = bucketStart(Math.max(from, from === 0 ? firstOrder : from), g);
  const end = Math.min(to, Date.now());
  const buckets = new Map<number, SeriesPoint>();
  for (let t = start; t <= end; t = nextBucket(t, g)) {
    buckets.set(t, { key: String(t), label: bucketLabel(t, g), start: t, revenue: 0, orders: 0, commission: 0, earnings: 0 });
  }
  for (const o of orders) {
    if (!isRevenueOrder(o)) continue;
    const b = buckets.get(bucketStart(new Date(o.createdAt).getTime(), g));
    if (!b) continue;
    b.revenue += o.total;
    b.orders += 1;
  }
  return [...buckets.values()].map((b) => {
    const revenue = round2(b.revenue);
    const commission = round2((revenue * commissionRate) / 100);
    return { ...b, revenue, commission, earnings: round2(revenue - commission) };
  });
}

export interface ProductSales {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  revenue: number;
}

export function bestSellers(orders: Order[], limit = 5): ProductSales[] {
  const map = new Map<string, ProductSales>();
  for (const o of orders) {
    if (!isRevenueOrder(o)) continue;
    for (const i of o.items) {
      const row = map.get(i.productId) ?? { productId: i.productId, name: i.name, image: i.image, quantity: 0, revenue: 0 };
      row.quantity += i.quantity;
      row.revenue = round2(row.revenue + i.lineTotal);
      map.set(i.productId, row);
    }
  }
  return [...map.values()].sort((a, b) => b.quantity - a.quantity).slice(0, limit);
}

export function ordersByHour(orders: Order[]) {
  const hours = Array.from({ length: 14 }, (_, i) => ({
    hour: i + 10,
    label: `${((i + 10 + 11) % 12) + 1}${i + 10 < 12 ? "a" : "p"}`,
    orders: 0,
  }));
  for (const o of orders) {
    const h = new Date(o.createdAt).getHours();
    const slot = hours.find((x) => x.hour === h);
    if (slot) slot.orders += 1;
  }
  return hours;
}

export function fulfillmentSplit(orders: Order[]) {
  const rev = orders.filter(isRevenueOrder);
  const delivery = rev.filter((o) => o.fulfillment === "delivery");
  return [
    { name: "Delivery", value: delivery.length, revenue: round2(delivery.reduce((s, o) => s + o.total, 0)) },
    { name: "Pickup", value: rev.length - delivery.length, revenue: round2(rev.filter((o) => o.fulfillment === "pickup").reduce((s, o) => s + o.total, 0)) },
  ];
}

export function statusBreakdown(orders: Order[]) {
  const statuses: OrderStatus[] = ["pending", "accepted", "preparing", "ready", "completed", "rejected", "cancelled"];
  return statuses.map((status) => ({ status, count: orders.filter((o) => o.status === status).length }));
}

export function commissionSummary(orders: Order[], rate: number): Commission {
  const rev = orders.filter(isRevenueOrder);
  const gross = round2(rev.reduce((s, o) => s + o.total, 0));
  const commission = round2((gross * rate) / 100);
  return { rate, gross, commission, earnings: round2(gross - commission), orders: rev.length };
}

export interface CustomerStats {
  customer: Customer;
  orders: number;
  spent: number;
  lastOrderAt?: string;
}

export function customerStats(customers: Customer[], orders: Order[]): CustomerStats[] {
  const byCustomer = new Map<string, Order[]>();
  for (const o of orders) {
    const list = byCustomer.get(o.customerId) ?? [];
    list.push(o);
    byCustomer.set(o.customerId, list);
  }
  return customers.map((customer) => {
    const list = byCustomer.get(customer.id) ?? [];
    const rev = list.filter(isRevenueOrder);
    return {
      customer,
      orders: list.length,
      spent: round2(rev.reduce((s, o) => s + o.total, 0)),
      lastOrderAt: list.length ? list[list.length - 1]!.createdAt : undefined,
    };
  });
}

export function newCustomersSeries(customers: Customer[], g: Granularity, from: number, to: number) {
  const series = salesSeries([], g, from === 0 ? Math.min(...customers.map((c) => new Date(c.joinedAt).getTime())) : from, to);
  const counts = new Map(series.map((p) => [p.start, 0]));
  for (const c of customers) {
    const t = bucketStart(new Date(c.joinedAt).getTime(), g);
    if (counts.has(t)) counts.set(t, counts.get(t)! + 1);
  }
  return series.map((p) => ({ label: p.label, start: p.start, customers: counts.get(p.start) ?? 0 }));
}

/** Customers with at least one order in the window */
export function activeCustomerCount(orders: Order[]) {
  return new Set(orders.map((o) => o.customerId)).size;
}

export function granularityFor(range: RangeKey): Granularity {
  if (range === "today" || range === "7d" || range === "30d") return "day";
  if (range === "90d") return "week";
  return "month";
}
