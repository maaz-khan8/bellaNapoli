import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  Addon,
  Address,
  ApprovalStatus,
  CartItem,
  Category,
  Crust,
  Customer,
  FulfillmentType,
  Order,
  OrderStatus,
  PlatformSettings,
  Product,
  Promotion,
  Restaurant,
  Topping,
} from "@/lib/types";
import { PLATFORM_DEFAULTS, RESTAURANT_DEFAULTS } from "@/lib/config/restaurant";
import { ADDONS, CATEGORIES, CRUSTS, PRODUCTS, PROMOTIONS, TOPPINGS } from "@/lib/mock/catalog";
import { createSeedCustomers, createSeedOrders } from "@/lib/mock/seed";
import { computeTotals, lineTotal } from "@/lib/pricing";

export const DATA_STORAGE_KEY = "bella-napoli:data";

interface SeedData {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  toppings: Topping[];
  addons: Addon[];
  crusts: Crust[];
  promotions: Promotion[];
  customers: Customer[];
  orders: Order[];
  platform: PlatformSettings;
  /** When the seed timeline was generated; used to keep demo data "current" */
  seededAt: number;
}

export interface NewOrderInput {
  customerId: string;
  customer: Order["customer"];
  fulfillment: FulfillmentType;
  address?: string;
  instructions?: string;
  promoCode?: string;
  items: CartItem[];
}

interface DataActions {
  // Restaurant
  updateRestaurant: (patch: Partial<Restaurant>) => void;
  setAcceptingOrders: (accepting: boolean) => void;
  setPlatformActive: (active: boolean) => void;
  setApprovalStatus: (status: ApprovalStatus) => void;
  // Menu
  saveProduct: (product: Product) => void;
  patchProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  patchCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => { ok: boolean; reason?: string };
  moveCategory: (id: string, direction: -1 | 1) => void;
  saveTopping: (topping: Topping) => void;
  deleteTopping: (id: string) => void;
  saveAddon: (addon: Addon) => void;
  deleteAddon: (id: string) => void;
  // Orders
  createOrder: (input: NewOrderInput) => Order;
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => void;
  // Customers
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, patch: Partial<Omit<Customer, "id">>) => void;
  saveAddress: (customerId: string, address: Address) => void;
  deleteAddress: (customerId: string, addressId: string) => void;
  // Platform
  updatePlatform: (patch: Partial<PlatformSettings>) => void;
  // Demo
  resetDemo: () => void;
  reanchor: (now: number) => void;
}

export type DataState = SeedData & DataActions;

function createSeed(now = Date.now()): SeedData {
  const customers = createSeedCustomers(now);
  return {
    restaurant: RESTAURANT_DEFAULTS,
    categories: CATEGORIES,
    products: PRODUCTS,
    toppings: TOPPINGS,
    addons: ADDONS,
    crusts: CRUSTS,
    promotions: PROMOTIONS,
    customers,
    orders: createSeedOrders(now, customers),
    platform: PLATFORM_DEFAULTS,
    seededAt: now,
  };
}

const shiftIso = (iso: string, ms: number) => new Date(new Date(iso).getTime() + ms).toISOString();
const REANCHOR_AFTER = 6 * 60 * 60 * 1000;

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      ...createSeed(),

      updateRestaurant: (patch) => set((s) => ({ restaurant: { ...s.restaurant, ...patch } })),
      setAcceptingOrders: (acceptingOrders) => set((s) => ({ restaurant: { ...s.restaurant, acceptingOrders } })),
      setPlatformActive: (platformActive) => set((s) => ({ restaurant: { ...s.restaurant, platformActive } })),
      setApprovalStatus: (approvalStatus) => set((s) => ({ restaurant: { ...s.restaurant, approvalStatus } })),

      saveProduct: (product) =>
        set((s) => {
          const exists = s.products.some((p) => p.id === product.id);
          return {
            products: exists ? s.products.map((p) => (p.id === product.id ? product : p)) : [product, ...s.products],
          };
        }),
      patchProduct: (id, patch) =>
        set((s) => ({ products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      saveCategory: (category) =>
        set((s) => {
          const exists = s.categories.some((c) => c.id === category.id);
          return {
            categories: exists
              ? s.categories.map((c) => (c.id === category.id ? category : c))
              : [...s.categories, { ...category, sortOrder: s.categories.length + 1 }],
          };
        }),
      patchCategory: (id, patch) =>
        set((s) => ({ categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCategory: (id) => {
        const count = get().products.filter((p) => p.categoryId === id).length;
        if (count > 0) {
          return { ok: false, reason: `Move or delete its ${count} product${count > 1 ? "s" : ""} first.` };
        }
        set((s) => ({
          categories: s.categories
            .filter((c) => c.id !== id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c, i) => ({ ...c, sortOrder: i + 1 })),
        }));
        return { ok: true };
      },
      moveCategory: (id, direction) =>
        set((s) => {
          const sorted = [...s.categories].sort((a, b) => a.sortOrder - b.sortOrder);
          const index = sorted.findIndex((c) => c.id === id);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= sorted.length) return {};
          [sorted[index], sorted[target]] = [sorted[target]!, sorted[index]!];
          return { categories: sorted.map((c, i) => ({ ...c, sortOrder: i + 1 })) };
        }),

      saveTopping: (topping) =>
        set((s) => ({
          toppings: s.toppings.some((t) => t.id === topping.id)
            ? s.toppings.map((t) => (t.id === topping.id ? topping : t))
            : [...s.toppings, topping],
        })),
      deleteTopping: (id) =>
        set((s) => ({
          toppings: s.toppings.filter((t) => t.id !== id),
          products: s.products.map((p) => ({ ...p, toppingIds: p.toppingIds.filter((t) => t !== id) })),
        })),
      saveAddon: (addon) =>
        set((s) => ({
          addons: s.addons.some((a) => a.id === addon.id)
            ? s.addons.map((a) => (a.id === addon.id ? addon : a))
            : [...s.addons, addon],
        })),
      deleteAddon: (id) =>
        set((s) => ({
          addons: s.addons.filter((a) => a.id !== id),
          products: s.products.map((p) => ({ ...p, addonIds: p.addonIds.filter((a) => a !== id) })),
        })),

      createOrder: (input) => {
        const { restaurant, promotions, orders } = get();
        const totals = computeTotals({
          items: input.items,
          promoCode: input.promoCode,
          fulfillment: input.fulfillment,
          restaurant,
          promotions,
        });
        const nextNumber = orders.reduce((max, o) => Math.max(max, Number(o.number.replace(/\D/g, ""))), 10000) + 1;
        const now = new Date().toISOString();
        const order: Order = {
          id: `ord_${nextNumber}`,
          number: `BN-${nextNumber}`,
          customerId: input.customerId,
          customer: input.customer,
          fulfillment: input.fulfillment,
          address: input.fulfillment === "delivery" ? input.address : undefined,
          instructions: input.instructions || undefined,
          paymentMethod: "cod",
          promoCode: totals.promo?.code,
          items: input.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image,
            size: i.size?.name,
            crust: i.crust?.name,
            toppings: i.toppings.map((t) => t.name),
            addons: i.addons.map((a) => a.name),
            notes: i.notes,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            lineTotal: lineTotal(i),
          })),
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          discount: totals.discount,
          total: totals.total,
          status: "pending",
          history: [{ status: "pending", at: now }],
          createdAt: now,
          estimatedMinutes:
            input.fulfillment === "delivery" ? restaurant.delivery.estimatedMinutes : restaurant.pickup.estimatedMinutes,
          placedInDemo: true,
        };
        set({ orders: [...orders, order] });
        return order;
      },

      updateOrderStatus: (id, status, note) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id && o.status !== status
              ? { ...o, status, history: [...o.history, { status, at: new Date().toISOString(), note }] }
              : o,
          ),
        })),

      addCustomer: (customer) => set((s) => ({ customers: [...s.customers, customer] })),
      updateCustomer: (id, patch) =>
        set((s) => ({ customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      saveAddress: (customerId, address) =>
        set((s) => ({
          customers: s.customers.map((c) => {
            if (c.id !== customerId) return c;
            const exists = c.addresses.some((a) => a.id === address.id);
            let addresses = exists
              ? c.addresses.map((a) => (a.id === address.id ? address : a))
              : [...c.addresses, address];
            if (address.isDefault) addresses = addresses.map((a) => ({ ...a, isDefault: a.id === address.id }));
            if (!addresses.some((a) => a.isDefault)) addresses[0] = { ...addresses[0]!, isDefault: true };
            return { ...c, addresses };
          }),
        })),
      deleteAddress: (customerId, addressId) =>
        set((s) => ({
          customers: s.customers.map((c) => {
            if (c.id !== customerId) return c;
            const addresses = c.addresses.filter((a) => a.id !== addressId);
            if (addresses.length && !addresses.some((a) => a.isDefault)) addresses[0] = { ...addresses[0]!, isDefault: true };
            return { ...c, addresses };
          }),
        })),

      updatePlatform: (patch) => set((s) => ({ platform: { ...s.platform, ...patch } })),

      resetDemo: () => set(createSeed()),

      /** Shift the seeded timeline forward so a demo opened days later still shows "today" activity. */
      reanchor: (now) => {
        const { seededAt, orders, customers } = get();
        const delta = now - seededAt;
        if (delta < REANCHOR_AFTER) {
          set({ seededAt }); // persists the seed so other tabs share the same data
          return;
        }
        set({
          seededAt: now,
          orders: orders.map((o) => ({
            ...o,
            createdAt: shiftIso(o.createdAt, delta),
            history: o.history.map((h) => ({ ...h, at: shiftIso(h.at, delta) })),
          })),
          customers: customers.map((c) => ({ ...c, joinedAt: shiftIso(c.joinedAt, delta) })),
        });
      },
    }),
    {
      name: DATA_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
