/**
 * Domain models for the Bella Napoli prototype.
 * These mirror the shapes a future Laravel API would return, so swapping the
 * mock repositories for real endpoints should not require UI changes.
 */

export type ID = string;
/** ISO-8601 timestamp */
export type ISODate = string;

export type Role = "customer" | "manager" | "admin";

export interface User {
  id: ID;
  email: string;
  name: string;
  role: Role;
  /** Set for customer users — links to the Customer record */
  customerId?: ID;
}

export interface Session extends User {
  signedInAt: ISODate;
  expiresAt: ISODate;
  remember: boolean;
}

export interface Address {
  id: ID;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  notes?: string;
  isDefault: boolean;
}

export type AccountStatus = "active" | "inactive";

export interface Customer {
  id: ID;
  name: string;
  email: string;
  phone: string;
  joinedAt: ISODate;
  status: AccountStatus;
  addresses: Address[];
}

export interface OpeningHours {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  open: string; // "11:00"
  close: string; // "23:00"
  closed: boolean;
}

export interface DeliverySettings {
  enabled: boolean;
  fee: number;
  freeDeliveryOver: number;
  minOrder: number;
  radiusKm: number;
  estimatedMinutes: number;
}

export interface PickupSettings {
  enabled: boolean;
  estimatedMinutes: number;
}

export type ApprovalStatus = "approved" | "pending" | "suspended";

export interface Review {
  id: ID;
  author: string;
  location: string;
  rating: number;
  quote: string;
  avatar: string;
}

export interface Restaurant {
  id: ID;
  name: string;
  tagline: string;
  description: string;
  /** Data-URL or remote URL; when empty the built-in brand mark is used */
  logo: string;
  coverImage: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  hours: OpeningHours[];
  delivery: DeliverySettings;
  pickup: PickupSettings;
  /** Restaurant-controlled: is the kitchen accepting online orders right now? */
  acceptingOrders: boolean;
  /** Platform-controlled (Super Admin) */
  platformActive: boolean;
  approvalStatus: ApprovalStatus;
  rating: number;
  reviewCount: number;
  foundedYear: number;
  reviews: Review[];
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  enabled: boolean;
}

export interface PizzaSize {
  id: ID;
  label: string;
  inches: number;
  price: number;
}

export interface Crust {
  id: ID;
  name: string;
  description: string;
  price: number;
}

export interface Topping {
  id: ID;
  name: string;
  price: number;
  veg: boolean;
  available: boolean;
}

export interface Addon {
  id: ID;
  name: string;
  price: number;
  available: boolean;
}

export type ProductKind = "pizza" | "item";
export type ProductTag = "veg" | "spicy" | "new" | "chef";

export interface Product {
  id: ID;
  slug: string;
  name: string;
  description: string;
  categoryId: ID;
  image: string;
  kind: ProductKind;
  /** Base price for items; for pizzas the smallest size price is used for display */
  price: number;
  sizes: PizzaSize[];
  toppingIds: ID[];
  addonIds: ID[];
  available: boolean;
  featured: boolean;
  bestSeller: boolean;
  tags: ProductTag[];
  rating: number;
  reviewCount: number;
  calories?: number;
  /** Relative popularity used by seed order generation and "Popular" sorting */
  popularity: number;
}

export interface SelectedOption {
  id: ID;
  name: string;
  price: number;
}

export interface CartItem {
  id: ID;
  productId: ID;
  name: string;
  image: string;
  kind: ProductKind;
  size?: SelectedOption;
  crust?: SelectedOption;
  toppings: SelectedOption[];
  addons: SelectedOption[];
  notes?: string;
  unitPrice: number;
  quantity: number;
}

export type FulfillmentType = "delivery" | "pickup";

export interface Cart {
  items: CartItem[];
  promoCode?: string;
  fulfillment: FulfillmentType;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "completed"
  | "rejected"
  | "cancelled";

export interface OrderStatusEvent {
  status: OrderStatus;
  at: ISODate;
  note?: string;
}

export interface OrderItem {
  productId: ID;
  name: string;
  image: string;
  size?: string;
  crust?: string;
  toppings: string[];
  addons: string[];
  notes?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export type PaymentMethod = "cod";

export interface Order {
  id: ID;
  number: string;
  customerId: ID;
  customer: { name: string; email: string; phone: string };
  fulfillment: FulfillmentType;
  address?: string;
  instructions?: string;
  paymentMethod: PaymentMethod;
  promoCode?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  history: OrderStatusEvent[];
  createdAt: ISODate;
  estimatedMinutes: number;
  /** True for orders placed during the live prototype session */
  placedInDemo: boolean;
}

export type PromotionType = "percent" | "fixed" | "free_delivery";

export interface Promotion {
  id: ID;
  code: string;
  title: string;
  description: string;
  type: PromotionType;
  value: number;
  minSubtotal: number;
  active: boolean;
}

export interface Commission {
  rate: number;
  gross: number;
  commission: number;
  earnings: number;
  orders: number;
}

export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  /** Percentage, e.g. 12 means 12% */
  commissionRate: number;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  promo?: Promotion;
  promoError?: string;
  /** Amount still needed to reach the delivery minimum (0 when met) */
  belowMinimum: number;
  /** Amount still needed for free delivery (0 when met or not applicable) */
  toFreeDelivery: number;
}
