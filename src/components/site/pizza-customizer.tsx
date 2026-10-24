"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useContent } from "@/hooks/use-content";
import { useFormat } from "@/hooks/use-format";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronRight, Flame, Info, ShoppingBag, Star } from "lucide-react";
import type { Product, SelectedOption } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { ProductTagBadge } from "@/components/site/product-tags";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { useDataStore } from "@/store/data-store";
import { configuredUnitPrice, round2 } from "@/lib/pricing";
import { cn } from "@/lib/utils";

const SIZE_SCALE = [0.74, 0.84, 0.93, 1];
const MAX_TOPPINGS = 8;

function OptionPrice({ price }: { price: number }) {
  const tr = useTranslations("customizer");
  const f = useFormat();
  return <span className="tabular text-sm font-semibold text-muted-foreground">{price > 0 ? `+${f.currency(price)}` : tr("included")}</span>;
}

function Fieldset({ legend, hint, children }: { legend: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t pt-6">
      <legend className="sr-only">{legend}</legend>
      <div className="mb-4 flex items-baseline justify-between gap-3" aria-hidden="true">
        <p className="text-lg font-semibold">{legend}</p>
        {hint && <p className="text-xs font-medium text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </fieldset>
  );
}

export function PizzaCustomizer({ product }: { product: Product }) {
  const crusts = useDataStore((s) => s.crusts);
  const tr = useTranslations("customizer");
  const content = useContent();
  const f = useFormat();
  const productName = content.productName(product);
  const allToppings = useDataStore((s) => s.toppings);
  const allAddons = useDataStore((s) => s.addons);
  const category = useDataStore((s) => s.categories.find((c) => c.id === product.categoryId));
  const restaurantPhone = useDataStore((s) => s.restaurant.phone);
  const { add } = useAddToCart();
  const isPizza = product.kind === "pizza";

  const toppings = allToppings.filter((t) => product.toppingIds.includes(t.id));
  const addons = allAddons.filter((a) => product.addonIds.includes(a.id) && a.available);
  const defaultSize = product.sizes.find((s) => s.id === "size_m") ?? product.sizes[0];

  const [sizeId, setSizeId] = useState(defaultSize?.id);
  const [crustId, setCrustId] = useState(crusts[0]?.id);
  const [toppingIds, setToppingIds] = useState<string[]>([]);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const sizeIndex = Math.max(0, product.sizes.findIndex((s) => s.id === sizeId));
  const sizeDef = product.sizes[sizeIndex];
  const crustDef = crusts.find((c) => c.id === crustId);

  const selection = useMemo(() => {
    const size: SelectedOption | undefined = isPizza && sizeDef ? { id: sizeDef.id, name: `${sizeDef.label} ${sizeDef.inches}"`, price: sizeDef.price } : undefined;
    const crust: SelectedOption | undefined = isPizza && crustDef ? { id: crustDef.id, name: crustDef.name, price: crustDef.price } : undefined;
    const tops = toppings.filter((t) => toppingIds.includes(t.id)).map((t) => ({ id: t.id, name: t.name, price: t.price }));
    const adds = addons.filter((a) => addonIds.includes(a.id)).map((a) => ({ id: a.id, name: a.name, price: a.price }));
    return { size, crust, toppings: tops, addons: adds };
  }, [isPizza, sizeDef, crustDef, toppings, toppingIds, addons, addonIds]);

  const unitPrice = configuredUnitPrice(product, selection);
  const total = round2(unitPrice * quantity);

  const toggle = (list: string[], id: string, set: (v: string[]) => void, max = Infinity) => {
    if (list.includes(id)) set(list.filter((x) => x !== id));
    else if (list.length < max) set([...list, id]);
  };

  const handleAdd = () => {
    add({
      productId: product.id,
      name: product.name,
      image: product.image,
      kind: product.kind,
      ...selection,
      notes: notes.trim() || undefined,
      unitPrice,
      quantity,
    });
    setQuantity(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-40 sm:px-6 lg:px-8 lg:pb-20">
      <nav aria-label={tr("breadcrumb")} className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-foreground">{tr("home")}</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li><Link href="/menu" className="hover:text-foreground">{tr("menu")}</Link></li>
          {category && (
            <>
              <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
              <li><Link href={`/menu?category=${category.slug}`} className="hover:text-foreground">{content.categoryName(category)}</Link></li>
            </>
          )}
          <li aria-hidden="true"><ChevronRight className="size-3.5" /></li>
          <li aria-current="page" className="font-medium text-foreground">{productName}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Visual */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2.5rem] bg-linear-to-br from-cream-200 via-cream-100 to-ember-100">
            <div className="bg-grain absolute inset-0" aria-hidden="true" />
            {isPizza ? (
              <>
                <div className="absolute size-[92%] rounded-full bg-white/60 shadow-inner ring-1 ring-black/5" aria-hidden="true" />
                <motion.div
                  className="relative aspect-square w-[88%] overflow-hidden rounded-full shadow-[0_30px_60px_-15px_rgb(120_40_20/0.45)]"
                  animate={{ scale: SIZE_SCALE[sizeIndex] ?? 1, rotate: sizeIndex * 25 }}
                  transition={{ type: "spring", stiffness: 140, damping: 16 }}
                >
                  <Image src={product.image} alt={productName} fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="scale-[1.35] object-cover" />
                </motion.div>
                {sizeDef && (
                  <span className="glass absolute right-5 bottom-5 rounded-full px-4 py-2 text-sm font-semibold shadow-lg">
                    {content.sizeLabel(sizeDef.label)} · {sizeDef.inches}&quot;
                  </span>
                )}
              </>
            ) : (
              <Image src={product.image} alt={productName} fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
            )}
            {!product.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900/50">
                <span className="rounded-full bg-white px-5 py-2 font-semibold">{tr("soldOutToday")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Configuration */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.bestSeller && <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-white"><Flame className="size-3" aria-hidden="true" /> {tr("bestseller")}</span>}
            {product.tags.map((t) => <ProductTagBadge key={t} tag={t} />)}
          </div>
          <h1 className="mt-4 font-display text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{productName}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {product.reviewCount > 0 ? (
              <>
                <span className="flex items-center gap-1 font-semibold text-foreground"><Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" /> {f.decimal(product.rating)}</span>
                <span>{tr("reviews", { count: product.reviewCount, formatted: f.number(product.reviewCount) })}</span>
              </>
            ) : (
              <span className="font-semibold text-foreground">{tr("newOnMenu")}</span>
            )}
            {product.calories ? <span>{isPizza ? tr("caloriesMedium", { kcal: product.calories }) : tr("calories", { kcal: product.calories })}</span> : null}
          </div>
          <p className="mt-5 text-lg leading-relaxed text-charcoal-600">{content.productDescription(product)}</p>

          <div className="mt-8 space-y-8">
            {isPizza && product.sizes.length > 0 && (
              <Fieldset legend={tr("size")} hint={tr("required")}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {product.sizes.map((s, i) => (
                    <label key={s.id} className="relative flex cursor-pointer flex-col items-center rounded-2xl border-2 border-border bg-card p-4 text-center transition hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                      <input type="radio" name="size" value={s.id} checked={sizeId === s.id} onChange={() => setSizeId(s.id)} className="sr-only" />
                      <span className="mb-2 flex items-center justify-center" aria-hidden="true">
                        <span className="rounded-full border-2 border-current text-primary/70" style={{ width: 18 + i * 6, height: 18 + i * 6 }} />
                      </span>
                      <span className="font-semibold">{content.sizeLabel(s.label)}</span>
                      <span className="text-xs text-muted-foreground">{s.inches}&quot;</span>
                      <span className="tabular mt-1 text-sm font-bold">{f.currency(s.price)}</span>
                    </label>
                  ))}
                </div>
              </Fieldset>
            )}

            {isPizza && (
              <Fieldset legend={tr("crust")} hint={tr("required")}>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {crusts.map((c) => (
                    <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 transition hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                      <input type="radio" name="crust" value={c.id} checked={crustId === c.id} onChange={() => setCrustId(c.id)} className="peer sr-only" />
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-charcoal-300 peer-checked:border-primary peer-checked:bg-primary" aria-hidden="true">
                        <span className="size-1.5 rounded-full bg-white" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{content.crustName(c)}</span>
                        <span className="block text-xs text-muted-foreground">{content.crustDescription(c)}</span>
                      </span>
                      <OptionPrice price={c.price} />
                    </label>
                  ))}
                </div>
              </Fieldset>
            )}

            {isPizza && toppings.length > 0 && (
              <Fieldset legend={tr("toppings")} hint={tr("toppingsHint", { count: toppingIds.length, max: MAX_TOPPINGS })}>
                <div className="flex flex-wrap gap-2.5">
                  {toppings.map((t) => {
                    const checked = toppingIds.includes(t.id);
                    const disabled = !t.available || (!checked && toppingIds.length >= MAX_TOPPINGS);
                    return (
                      <label key={t.id} className={cn("inline-flex cursor-pointer items-center gap-2 rounded-full border-2 px-3.5 py-2 text-sm transition has-focus-visible:ring-3 has-focus-visible:ring-ring/40", checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/40", disabled && "cursor-not-allowed opacity-45")}>
                        <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={() => toggle(toppingIds, t.id, setToppingIds, MAX_TOPPINGS)} />
                        <AnimatePresence initial={false}>
                          {checked && (
                            <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }}>
                              <Check className="size-4" aria-hidden="true" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                        <span className="font-medium">{content.toppingName(t.id, t.name)}</span>
                        <span className={cn("tabular text-xs", checked ? "text-white/80" : "text-muted-foreground")}>
                          {t.available ? `+${f.currency(t.price)}` : tr("out")}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Fieldset>
            )}

            {addons.length > 0 && (
              <Fieldset legend={tr("addons")} hint={tr("optional")}>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {addons.map((a) => {
                    const checked = addonIds.includes(a.id);
                    return (
                      <label key={a.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-border bg-card px-4 py-3 transition hover:border-primary/40 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-3 has-focus-visible:ring-ring/40">
                        <input type="checkbox" className="peer sr-only" checked={checked} onChange={() => toggle(addonIds, a.id, setAddonIds)} />
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md border-2 border-charcoal-300 text-white peer-checked:border-primary peer-checked:bg-primary" aria-hidden="true">
                          {checked && <Check className="size-3.5" />}
                        </span>
                        <span className="flex-1 text-sm font-semibold">{content.addonName(a.id, a.name)}</span>
                        <OptionPrice price={a.price} />
                      </label>
                    );
                  })}
                </div>
              </Fieldset>
            )}

            <Fieldset legend={tr("notes")} hint={`${notes.length}/140`}>
              <label htmlFor="notes" className="sr-only">{tr("notes")}</label>
              <Textarea
                id="notes"
                value={notes}
                maxLength={140}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={tr("notesPlaceholder")}
                className="min-h-24 rounded-2xl bg-card"
              />
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><Info className="size-3.5" aria-hidden="true" /> {tr("allergies", { phone: restaurantPhone })}</p>
            </Fieldset>
          </div>

          {/* Purchase bar — fixed on mobile, inline on desktop */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-12px_30px_-12px_rgb(0_0_0/0.15)] backdrop-blur lg:static lg:mt-8 lg:rounded-3xl lg:border lg:bg-card lg:p-5 lg:shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <QuantityStepper value={quantity} onChange={setQuantity} label={tr("quantityOf", { name: productName })} />
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleAdd}
                disabled={!product.available}
                aria-label={product.available ? tr("addAria", { total: f.currency(total) }) : tr("soldOutAria", { name: productName })}
                className="flex h-13 min-w-0 flex-1 items-center justify-between gap-2 rounded-full bg-primary pr-1.5 pl-4 font-semibold whitespace-nowrap sm:gap-3 sm:pr-2 sm:pl-6 text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-tomato-600 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
              >
                {/* Under 400px only the icon + price fit (German labels are long); aria-label still names the action */}
                <span className="flex items-center gap-2">
                  <ShoppingBag className="size-5 shrink-0" aria-hidden="true" />
                  {product.available ? <span className="hidden min-[400px]:inline">{tr("addLong")}</span> : tr("soldOut")}
                </span>
                <span className="tabular rounded-full bg-white/20 px-3 py-2 sm:px-4" aria-live="polite">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={total} initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }} className="inline-block">
                      {f.currency(total)}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.button>
            </div>
            {isPizza && (
              <p className="mx-auto mt-2 hidden max-w-7xl text-xs text-muted-foreground lg:block">
                {tr("breakdown.base", { amount: f.currency(sizeDef?.price ?? product.price) })}
                {selection.crust?.price ? ` + ${tr("breakdown.crust", { amount: f.currency(selection.crust.price) })}` : ""}
                {selection.toppings.length ? ` + ${tr("breakdown.toppings", { amount: f.currency(selection.toppings.reduce((s, t) => s + t.price, 0)) })}` : ""}
                {selection.addons.length ? ` + ${tr("breakdown.addons", { amount: f.currency(selection.addons.reduce((s, a) => s + a.price, 0)) })}` : ""}
                {quantity > 1 ? ` × ${quantity}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
