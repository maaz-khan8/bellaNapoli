"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useContent } from "@/hooks/use-content";
import { useFormat } from "@/hooks/use-format";
import Image from "next/image";
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
import { uid } from "@/lib/format";
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
  const tc = useTranslations("checkout");
  const tv = useTranslations();
  const content = useContent();
  const f = useFormat();
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
    unavailable.length > 0 && tc("blockers.unavailable", { items: unavailable.map((i) => content.productName({ id: i.productId, name: i.name })).join(", ") }),
    fulfillment === "delivery" && totals.belowMinimum > 0 && tc("blockers.minimum", { minimum: f.currency(restaurant.delivery.minOrder), amount: f.currency(totals.belowMinimum) }),
    fulfillment === "delivery" && !restaurant.delivery.enabled && tc("blockers.noDelivery"),
    fulfillment === "pickup" && !restaurant.pickup.enabled && tc("blockers.noPickup"),
  ].filter(Boolean) as string[];

  if (items.length === 0 && !placed) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title={tc("emptyTitle")}
        description={tc("emptyBody")}
        action={<Button asChild className="h-12 rounded-full px-7"><Link href="/menu">{tc("browseMenu")}</Link></Button>}
        className="min-h-[60vh]"
      />
    );
  }

  const onSubmit = async (values: CheckoutValues) => {
    if (blockers.length) {
      toast.error(tc("cantPlace"), { description: blockers[0] });
      return;
    }
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900)); // simulated network latency

    let address: string | undefined;
    if (values.fulfillment === "delivery") {
      if (values.addressId === "new") {
        address = `${values.line1}, ${values.city} ${values.postalCode}`;
        if (values.saveAddress && customer) {
          saveAddress(customer.id, { id: uid("addr"), label: addresses.length ? tc("addressOther") : tc("addressHome"), line1: values.line1, city: values.city, postalCode: values.postalCode, isDefault: addresses.length === 0 });
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
    <form onSubmit={handleSubmit(onSubmit, () => toast.error(tc("checkDetails"), { description: tc("checkDetailsBody") }))} noValidate className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{tc("title")}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 text-basil-500" aria-hidden="true" /> {tc.rich("signedInAs", { email: session.email, strong: (c) => <strong className="text-foreground">{c}</strong> })}
          </p>
        </div>
        <Link href="/cart" className="text-sm font-semibold text-primary hover:underline">{tc("editCart")}</Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_26rem]">
        <div className="min-w-0 space-y-6">
          <Step n={1} title={tc("steps.contact")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={tc("fields.name")} required error={errors.name?.message} className="sm:col-span-2">
                <Input autoComplete="name" className="h-11 rounded-xl" {...register("name")} />
              </FormField>
              <FormField label={tc("fields.phone")} required error={errors.phone?.message} hint={tc("fields.phoneHint")}>
                <Input type="tel" autoComplete="tel" placeholder="(212) 555-0123" className="h-11 rounded-xl" {...register("phone")} />
              </FormField>
              <FormField label={tc("fields.email")} required error={errors.email?.message} hint={tc("fields.emailHint")}>
                <Input type="email" autoComplete="email" className="h-11 rounded-xl" {...register("email")} />
              </FormField>
            </div>
          </Step>

          <Step n={2} title={tc("steps.fulfillment")}>
            <FulfillmentToggle value={fulfillment} onChange={(v) => setValue("fulfillment", v, { shouldValidate: true })} name="checkout-fulfillment" />
            <AnimatePresence mode="wait" initial={false}>
              {fulfillment === "delivery" ? (
                <motion.div key="delivery" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 space-y-4">
                  <fieldset>
                    <legend className="mb-3 text-sm font-medium">{tc("deliveryAddress")}</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {addresses.map((a) => (
                        <label key={a.id} className="flex cursor-pointer gap-3 rounded-2xl border-2 border-border p-4 transition hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                          <input type="radio" value={a.id} className="sr-only" {...register("addressId")} />
                          <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="min-w-0 text-sm">
                            <span className="flex items-center gap-2 font-semibold">{a.label}{a.isDefault && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase">{tc("default")}</span>}</span>
                            <span className="block text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</span>
                            <span className="block text-muted-foreground">{a.city} {a.postalCode}</span>
                          </span>
                          {addressId === a.id && <Check className="ml-auto size-5 shrink-0 text-primary" aria-hidden="true" />}
                        </label>
                      ))}
                      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 text-sm font-semibold transition hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                        <input type="radio" value="new" className="sr-only" {...register("addressId")} />
                        <Plus className="size-5 text-primary" aria-hidden="true" /> {tc("newAddress")}
                      </label>
                    </div>
                  </fieldset>
                  {addressId === "new" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-4 overflow-hidden px-0.5 pb-0.5 sm:grid-cols-[1fr_10rem]">
                      <FormField label={tc("fields.street")} required error={errors.line1?.message} className="sm:col-span-2">
                        <Input autoComplete="street-address" placeholder={tc("fields.streetPlaceholder")} className="h-11 rounded-xl" {...register("line1")} />
                      </FormField>
                      <FormField label={tc("fields.city")} required error={errors.city?.message}>
                        <Input autoComplete="address-level2" className="h-11 rounded-xl" {...register("city")} />
                      </FormField>
                      <FormField label={tc("fields.zip")} required error={errors.postalCode?.message}>
                        <Input inputMode="numeric" autoComplete="postal-code" placeholder="10012" className="h-11 rounded-xl" {...register("postalCode")} />
                      </FormField>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <Checkbox id="save-address" defaultChecked onCheckedChange={(v) => setValue("saveAddress", v === true)} />
                        <Label htmlFor="save-address" className="text-sm font-normal">{tc("saveAddress")}</Label>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="pickup" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-5 flex gap-3 rounded-2xl bg-muted p-4 text-sm">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">{tc("pickupAt", { name: restaurant.name })}</p>
                    <p className="text-muted-foreground">{restaurant.address}, {restaurant.city} · {tc("readyIn", { minutes: restaurant.pickup.estimatedMinutes })}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <FormField label={fulfillment === "delivery" ? tc("fields.instructions") : tc("fields.kitchenNotes")} error={errors.instructions?.message} className="mt-5">
              <Textarea placeholder={fulfillment === "delivery" ? tc("fields.instructionsPlaceholder") : tc("fields.kitchenNotesPlaceholder")} className="min-h-20 rounded-xl" {...register("instructions")} />
            </FormField>
          </Step>

          <Step n={3} title={tc("steps.payment")}>
            <div role="radiogroup" aria-label={tc("paymentMethod")} className="grid gap-3">
              <label className="flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-primary bg-primary/5 p-4 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                <input type="radio" value="cod" className="sr-only" {...register("paymentMethod")} />
                <span className="flex size-11 items-center justify-center rounded-xl bg-basil-500 text-white"><Banknote className="size-5" aria-hidden="true" /></span>
                <span className="flex-1">
                  <span className="block font-semibold">{tc("cod")}</span>
                  <span className="block text-sm text-muted-foreground">{fulfillment === "delivery" ? tc("codDelivery") : tc("codPickup")}</span>
                </span>
                <Check className="size-5 text-primary" aria-hidden="true" />
              </label>
              {[{ icon: CreditCard, label: tc("card") }, { icon: Apple, label: tc("wallet") }].map((m) => (
                <div key={m.label} aria-disabled="true" className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-border p-4 opacity-60">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-muted"><m.icon className="size-5" aria-hidden="true" /></span>
                  <span className="flex-1 font-semibold">{m.label}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold uppercase">{tc("comingSoon")}</span>
                </div>
              ))}
            </div>
            {errors.paymentMethod && <p role="alert" className="mt-2 text-xs font-medium text-destructive">{tv(errors.paymentMethod.message as "validation.paymentRequired")}</p>}
          </Step>

          <Step n={4} title={tc("steps.review")}>
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted"><Image src={item.image} alt="" fill sizes="56px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-semibold"><span className="text-muted-foreground">{item.quantity}×</span> {content.productName({ id: item.productId, name: item.name })}</p>
                    <p className="text-xs text-muted-foreground">{[item.size && content.sizeText(item.size.name), item.crust && content.crustName(item.crust), ...item.toppings.map((o) => `+ ${content.toppingName(o.id, o.name)}`), ...item.addons.map((o) => `+ ${content.addonName(o.id, o.name)}`)].filter(Boolean).join(" · ")}</p>
                  </div>
                  <p className="tabular text-sm font-semibold">{f.currency(lineTotal(item))}</p>
                </li>
              ))}
            </ul>
          </Step>
        </div>

        <aside aria-label={tc("summary")} className="h-fit space-y-5 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border lg:sticky lg:top-28">
          <h2 className="text-lg font-semibold">{tc("summary")}</h2>
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
            {placing ? (<><Loader2 className="animate-spin" /> {tc("placing")}</>) : (<><Lock /> {tc("place", { total: f.currency(totals.total) })}</>)}
          </Button>
          <p className={cn("rounded-xl bg-muted px-3 py-2 text-center text-xs text-muted-foreground")}>
            {tc("demoNote")}
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
