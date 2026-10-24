"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Apple,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RoleGuard } from "@/components/auth/role-guard";
import { FormField } from "@/components/shared/form-field";
import { EmptyState } from "@/components/shared/empty-state";
import { FulfillmentToggle } from "@/components/site/fulfillment-toggle";
import { FreeDeliveryProgress, PromoCodeInput, TotalsList } from "@/components/site/cart-summary";
import { useCartStore } from "@/store/cart-store";
import { useDataStore } from "@/store/data-store";
import { useCartTotals } from "@/hooks/use-cart-totals";
import { useCurrentCustomer, useSession } from "@/hooks/use-session";
import { useOrderingStatus } from "@/hooks/use-catalog";
import { checkoutSchema, type CheckoutValues } from "@/lib/validation";
import { formatCurrency, uid } from "@/lib/format";
import { lineTotal } from "@/lib/pricing";
import { cn } from "@/lib/utils";

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${n}`} className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-7">
      <h2 id={`step-${n}`} className="mb-5 flex items-center gap-3 text-lg font-semibold">
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground" aria-hidden="true">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function CheckoutForm() {
  const router = useRouter();
  const session = useSession("customer")!;
  const customer = useCurrentCustomer();
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const clearCart = useCartStore((s) => s.clear);
  const setCartFulfillment = useCartStore((s) => s.setFulfillment);
  const cartFulfillment = useCartStore((s) => s.fulfillment);
  const products = useDataStore((s) => s.products);
  const createOrder = useDataStore((s) => s.createOrder);
  const saveAddress = useDataStore((s) => s.saveAddress);
  const restaurant = useDataStore((s) => s.restaurant);
  const { canOrder, reason } = useOrderingStatus();
  const [placing, setPlacing] = useState(false);
  // Set once the order is created so clearing the cart doesn't flash the empty state
  const [placed, setPlaced] = useState(false);

  const addresses = customer?.addresses ?? [];
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: {
      name: customer?.name ?? session.name,
      email: customer?.email ?? session.email,
      phone: customer?.phone ?? "",
      fulfillment: cartFulfillment,
      addressId: defaultAddress?.id ?? "new",
      line1: "",
      city: "New York, NY",
      postalCode: "",
      instructions: "",
      paymentMethod: "cod",
      saveAddress: true,
    },
  });
  const { register, handleSubmit, setValue, control, formState: { errors } } = form;
  const fulfillment = useWatch({ control, name: "fulfillment" });
  const addressId = useWatch({ control, name: "addressId" });
  const totals = useCartTotals(fulfillment);

  useEffect(() => setCartFulfillment(fulfillment), [fulfillment, setCartFulfillment]);

  const unavailable = items.filter((i) => !products.find((p) => p.id === i.productId)?.available);
  const blockers = [
    !canOrder && reason,
    unavailable.length > 0 && `Remove unavailable items: ${unavailable.map((i) => i.name).join(", ")}.`,
    fulfillment === "delivery" && totals.belowMinimum > 0 && `Delivery needs a ${formatCurrency(restaurant.delivery.minOrder)} minimum — add ${formatCurrency(totals.belowMinimum)} more or choose pickup.`,
    fulfillment === "delivery" && !restaurant.delivery.enabled && "Delivery is currently unavailable — please choose pickup.",
    fulfillment === "pickup" && !restaurant.pickup.enabled && "Pickup is currently unavailable — please choose delivery.",
  ].filter(Boolean) as string[];

  if (items.length === 0 && !placed) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Nothing to check out yet"
        description="Your cart is empty. Add a pizza or two and come back here."
        action={<Button asChild className="h-12 rounded-full px-7"><Link href="/menu">Browse the menu</Link></Button>}
        className="min-h-[60vh]"
      />
    );
  }

  const onSubmit = async (values: CheckoutValues) => {
    if (blockers.length) {
      toast.error("We can't place this order yet", { description: blockers[0] });
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900)); // simulated network latency

    let address: string | undefined;
    if (values.fulfillment === "delivery") {
      if (values.addressId === "new") {
        address = `${values.line1}, ${values.city} ${values.postalCode}`;
        if (values.saveAddress && customer) {
          saveAddress(customer.id, { id: uid("addr"), label: addresses.length ? "Other" : "Home", line1: values.line1, city: values.city, postalCode: values.postalCode, isDefault: addresses.length === 0 });
        }
      } else {
        const a = addresses.find((x) => x.id === values.addressId);
        address = a ? `${a.line1}${a.line2 ? `, ${a.line2}` : ""}, ${a.city} ${a.postalCode}` : undefined;
      }
    }

    const order = createOrder({
      customerId: session.customerId!,
      customer: { name: values.name, email: values.email, phone: values.phone },
      fulfillment: values.fulfillment,
      address,
      instructions: values.instructions,
      promoCode,
      items,
    });
    setPlaced(true);
    router.push(`/order-confirmation/${order.id}`);
    clearCart();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please check your details", { description: "Some required fields need attention." }))} noValidate className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Checkout</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-basil-500" aria-hidden="true" /> Signed in as <strong className="text-foreground">{session.email}</strong>
          </p>
        </div>
        <Link href="/cart" className="text-sm font-semibold text-primary hover:underline">Edit cart</Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_26rem]">
        <div className="min-w-0 space-y-6">
          <Step n={1} title="Contact details">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" required error={errors.name?.message} className="sm:col-span-2">
                <Input autoComplete="name" className="h-11 rounded-xl" {...register("name")} />
              </FormField>
              <FormField label="Phone number" required error={errors.phone?.message} hint="The driver will call if needed">
                <Input type="tel" autoComplete="tel" placeholder="(212) 555-0123" className="h-11 rounded-xl" {...register("phone")} />
              </FormField>
              <FormField label="Email" required error={errors.email?.message} hint="For your demo receipt">
                <Input type="email" autoComplete="email" className="h-11 rounded-xl" {...register("email")} />
              </FormField>
            </div>
          </Step>

          <Step n={2} title="Delivery or pickup">
            <FulfillmentToggle value={fulfillment} onChange={(v) => setValue("fulfillment", v, { shouldValidate: true })} name="checkout-fulfillment" />
            <AnimatePresence mode="wait" initial={false}>
              {fulfillment === "delivery" ? (
                <motion.div key="delivery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 space-y-4">
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium">Delivery address</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addresses.map((a) => (
                        <label key={a.id} className="flex cursor-pointer gap-3 rounded-2xl border-2 border-border p-4 transition hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                          <input type="radio" value={a.id} className="sr-only" {...register("addressId")} />
                          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="min-w-0 text-sm">
                            <span className="flex items-center gap-2 font-semibold">{a.label}{a.isDefault && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">Default</span>}</span>
                            <span className="block text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</span>
                            <span className="block text-muted-foreground">{a.city} {a.postalCode}</span>
                          </span>
                          {addressId === a.id && <Check className="ml-auto size-5 shrink-0 text-primary" aria-hidden="true" />}
                        </label>
                      ))}
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 text-sm font-semibold transition hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                        <input type="radio" value="new" className="sr-only" {...register("addressId")} />
                        <Plus className="size-5 text-primary" aria-hidden="true" /> Use a new address
                      </label>
                    </div>
                  </fieldset>
                  {addressId === "new" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-4 overflow-hidden px-0.5 pb-0.5 sm:grid-cols-[1fr_10rem]">
                      <FormField label="Street address" required error={errors.line1?.message} className="sm:col-span-2">
                        <Input autoComplete="street-address" placeholder="214 Spring Street, Apt 3" className="h-11 rounded-xl" {...register("line1")} />
                      </FormField>
                      <FormField label="City" required error={errors.city?.message}>
                        <Input autoComplete="address-level2" className="h-11 rounded-xl" {...register("city")} />
                      </FormField>
                      <FormField label="ZIP code" required error={errors.postalCode?.message}>
                        <Input inputMode="numeric" autoComplete="postal-code" placeholder="10012" className="h-11 rounded-xl" {...register("postalCode")} />
                      </FormField>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Checkbox id="save-address" defaultChecked onCheckedChange={(v) => setValue("saveAddress", v === true)} />
                        <Label htmlFor="save-address" className="text-sm font-normal">Save this address to my account</Label>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="pickup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 flex gap-3 rounded-2xl bg-muted p-4 text-sm">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Pick up at {restaurant.name}</p>
                    <p className="text-muted-foreground">{restaurant.address}, {restaurant.city} · ready in ~{restaurant.pickup.estimatedMinutes} min</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <FormField label={fulfillment === "delivery" ? "Delivery instructions" : "Notes for the kitchen"} error={errors.instructions?.message} className="mt-5">
              <Textarea placeholder={fulfillment === "delivery" ? "Gate code, floor, leave at door…" : "Anything we should know?"} className="min-h-20 rounded-xl" {...register("instructions")} />
            </FormField>
          </Step>

          <Step n={3} title="Payment">
            <div role="radiogroup" aria-label="Payment method" className="grid gap-3">
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-primary bg-primary/5 p-4 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                <input type="radio" value="cod" className="sr-only" {...register("paymentMethod")} />
                <span className="flex size-11 items-center justify-center rounded-xl bg-basil-500 text-white"><Banknote className="size-5" aria-hidden="true" /></span>
                <span className="flex-1">
                  <span className="block font-semibold">Cash on Delivery</span>
                  <span className="block text-sm text-muted-foreground">Pay the {fulfillment === "delivery" ? "driver" : "counter"} when your order arrives</span>
                </span>
                <Check className="size-5 text-primary" aria-hidden="true" />
              </label>
              {[{ icon: CreditCard, label: "Credit or debit card" }, { icon: Apple, label: "Apple Pay / Google Pay" }].map((m) => (
                <div key={m.label} aria-disabled="true" className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-border p-4 opacity-60">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-muted"><m.icon className="size-5" aria-hidden="true" /></span>
                  <span className="flex-1 font-semibold">{m.label}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase">Coming soon</span>
                </div>
              ))}
            </div>
            {errors.paymentMethod && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{errors.paymentMethod.message}</p>}
          </Step>

          <Step n={4} title="Review your order">
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={item.image} alt="" fill sizes="56px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-semibold"><span className="text-muted-foreground">{item.quantity}×</span> {item.name}</p>
                    <p className="text-xs text-muted-foreground">{[item.size?.name, item.crust?.name, ...item.toppings.map((t) => `+ ${t.name}`), ...item.addons.map((a) => `+ ${a.name}`)].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="tabular text-sm font-semibold">{formatCurrency(lineTotal(item))}</p>
                </li>
              ))}
            </ul>
          </Step>
        </div>

        <aside aria-label="Order summary" className="h-fit space-y-5 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <FreeDeliveryProgress totals={totals} />
          <PromoCodeInput />
          <TotalsList totals={totals} />
          {blockers.length > 0 && (
            <div role="alert" className="space-y-1.5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              {blockers.map((b) => (
                <p key={b} className="flex gap-2"><AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />{b}</p>
              ))}
            </div>
          )}
          <Button type="submit" disabled={placing || blockers.length > 0} className="h-14 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/25">
            {placing ? (<><Loader2 className="animate-spin" /> Placing your order…</>) : (<><Lock /> Place order · {formatCurrency(totals.total)}</>)}
          </Button>
          <p className={cn("rounded-xl bg-muted px-3 py-2 text-center text-xs text-muted-foreground")}>
            Demo transaction — no payment is taken and no food will be delivered.
          </p>
        </aside>
      </div>
    </form>
  );
}

export default function CheckoutPage() {
  return (
    <RoleGuard role="customer">
      <CheckoutForm />
    </RoleGuard>
  );
}
