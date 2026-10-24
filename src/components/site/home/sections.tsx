"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowRight,
  Bike,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Store,
  Timer,
  Wheat,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/product-card";
import { SectionHeading } from "@/components/site/section-heading";
import { useCatalog } from "@/hooks/use-catalog";
import { useContent } from "@/hooks/use-content";
import { useFormat } from "@/hooks/use-format";
import { useDataStore } from "@/store/data-store";
import { useHydrated } from "@/store/ui-store";
import { PHOTOS } from "@/lib/images";
import type { OpeningHours } from "@/lib/types";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: "easeOut" },
} as const;

/** Rich-text renderer for <em> tags in translated headings. */
function em(className: string) {
  return function Emphasis(chunks: React.ReactNode) {
    return <em className={className}>{chunks}</em>;
  };
}

export function TrustStrip() {
  const t = useTranslations("home.trust");
  const items = [
    { icon: Wheat, key: "dough" },
    { icon: Leaf, key: "tomatoes" },
    { icon: Flame, key: "oven" },
    { icon: Bike, key: "delivery" },
  ] as const;
  return (
    <section aria-label={t("label")} className="relative z-10 -mt-px border-b bg-cream-100">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-border/60 lg:grid-cols-4">
        {items.map((item, i) => (
          <motion.div key={item.key} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="flex items-center gap-3 bg-cream-100 px-4 py-6 sm:px-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-border">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold">{t(`${item.key}.title`)}</p>
              <p className="text-xs text-muted-foreground">{t(`${item.key}.body`)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function CategoryShowcase() {
  const { categories, products } = useCatalog();
  const t = useTranslations("home.categories");
  const content = useContent();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="categories-heading">
      <SectionHeading
        eyebrow={t("eyebrow")}
        title={<span id="categories-heading">{t.rich("title", { em: em("text-primary") })}</span>}
        action={<Button asChild variant="outline" className="h-11 rounded-full px-5"><Link href="/menu">{t("fullMenu")} <ArrowRight /></Link></Button>}
      />
      <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4">
        {categories.map((c, i) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <motion.div key={c.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: (i % 4) * 0.06 }} className="w-[70%] shrink-0 snap-start sm:w-auto">
              <Link href={`/menu?category=${c.slug}`} className="group relative block aspect-4/5 overflow-hidden rounded-3xl bg-charcoal-900 sm:aspect-5/4">
                <Image src={c.image} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 70vw" className="object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-5 text-white">
                  <div>
                    <p className="font-display text-2xl font-semibold leading-tight">{content.categoryName(c)}</p>
                    <p className="mt-0.5 text-xs text-white/70">{t("count", { count })} · {content.categoryDescription(c)}</p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-primary">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function FeaturedPizzas() {
  const { products } = useCatalog();
  const t = useTranslations("home.featured");
  const featured = products.filter((p) => p.featured).slice(0, 8);
  if (!featured.length) return null;
  return (
    <section className="bg-cream-200/60 py-20" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={<span id="featured-heading">{t.rich("title", { em: em("text-primary") })}</span>}
          description={t("description")}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((p, i) => <ProductCard key={p.id} product={p} priority={i < 2} />)}
        </div>
      </div>
    </section>
  );
}

export function PromoBanners() {
  const promotions = useDataStore((s) => s.promotions);
  const t = useTranslations("home.promos");
  const content = useContent();
  const f = useFormat();
  const pizza20 = promotions.find((p) => p.code === "PIZZA20" && p.active);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-label={t("label")}>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <motion.div {...fadeUp} className="group relative isolate overflow-hidden rounded-[2rem] bg-linear-to-br from-tomato-600 via-tomato-500 to-ember-500 p-8 text-white sm:p-12">
          <div className="absolute -right-16 -bottom-16 -z-10 size-80 overflow-hidden rounded-full opacity-90 ring-8 ring-white/10 transition duration-700 group-hover:rotate-12 sm:size-96">
            <Image src={PHOTOS.partySlices} alt="" fill sizes="384px" className="object-cover" />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-widest uppercase backdrop-blur">{t("feast.badge")}</span>
          <h3 className="mt-5 max-w-xs font-display text-4xl leading-none font-semibold sm:text-5xl">{t("feast.title")}</h3>
          <p className="mt-4 max-w-[17rem] text-white/85">{t("feast.body")}</p>
          <p className="mt-6 flex items-baseline gap-3">
            <span className="text-5xl font-bold tracking-tight">{f.currency(39.99)}</span>
            <span className="text-lg text-white/60 line-through">{f.currency(52.49)}</span>
          </p>
          <Button asChild className="mt-8 h-12 rounded-full bg-white px-6 font-semibold text-tomato-700 hover:bg-cream-100">
            <Link href="/menu/family-feast">{t("feast.cta")} <ArrowRight /></Link>
          </Button>
        </motion.div>
        <div className="grid gap-6">
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="relative overflow-hidden rounded-[2rem] bg-charcoal-900 p-8 text-white">
            <div className="bg-dots absolute inset-0" aria-hidden="true" />
            <div className="relative">
              <p className="text-xs font-bold tracking-widest text-ember-300 uppercase">{t("code.badge")}</p>
              <p className="mt-3 font-display text-3xl font-semibold">{pizza20 ? content.promoTitle(pizza20) : t("code.fallback")}</p>
              <p className="mt-2 text-sm text-white/70">{pizza20 && content.promoDescription(pizza20)}</p>
              <div className="mt-5 inline-flex items-center gap-3 rounded-xl border border-dashed border-ember-400/60 bg-white/5 px-4 py-2.5 font-mono text-lg font-bold tracking-widest text-ember-300">PIZZA20</div>
            </div>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }} className="relative overflow-hidden rounded-[2rem] bg-basil-600 p-8 text-white">
            <Leaf className="absolute -right-6 -bottom-6 size-40 text-white/10" aria-hidden="true" />
            <p className="text-xs font-bold tracking-widest text-basil-100 uppercase">{t("welcome.badge")}</p>
            <p className="mt-3 font-display text-3xl font-semibold">{t("welcome.title")}</p>
            <Link href="/register" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline">{t("welcome.cta")} <ArrowRight className="size-4" aria-hidden="true" /></Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function BestSellers() {
  const { products } = useCatalog();
  const t = useTranslations("home.bestsellers");
  const best = products.filter((p) => p.bestSeller).sort((a, b) => b.popularity - a.popularity);
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.8, behavior: "smooth" });
  if (!best.length) return null;
  return (
    <section className="overflow-hidden py-20" aria-labelledby="bestsellers-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={<span id="bestsellers-heading">{t.rich("title", { em: em("text-primary") })}</span>}
          action={
            <div className="hidden gap-2 sm:flex">
              <Button variant="outline" size="icon-lg" className="size-11 rounded-full" onClick={() => scroll(-1)} aria-label={t("scrollLeft")}><ChevronLeft className="size-5" /></Button>
              <Button variant="outline" size="icon-lg" className="size-11 rounded-full" onClick={() => scroll(1)} aria-label={t("scrollRight")}><ChevronRight className="size-5" /></Button>
            </div>
          }
        />
        <div ref={scroller} className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {best.map((p) => (
            <ProductCard key={p.id} product={p} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[30%] xl:w-[23.5%]" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutSection() {
  const restaurant = useDataStore((s) => s.restaurant);
  const t = useTranslations("home.about");
  const content = useContent();
  const f = useFormat();
  return (
    <section id="about" className="scroll-mt-24 overflow-hidden bg-charcoal-950 py-24 text-white" aria-labelledby="about-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div {...fadeUp} className="relative">
          <div className="relative aspect-4/5 overflow-hidden rounded-[2rem]">
            <Image src={PHOTOS.woodOven} alt={t("ovenAlt")} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute -right-4 -bottom-8 w-1/2 overflow-hidden rounded-3xl ring-8 ring-charcoal-950 sm:-right-8">
            <div className="relative aspect-square">
              <Image src={PHOTOS.interior} alt={t("roomAlt")} fill sizes="25vw" className="object-cover" />
            </div>
          </div>
          <div className="glass absolute top-6 -left-3 rounded-2xl px-5 py-4 text-charcoal-900 shadow-xl sm:-left-6">
            <p className="font-display text-4xl font-semibold text-primary">{2026 - restaurant.foundedYear}+</p>
            <p className="text-xs font-semibold">{t("years")}</p>
          </div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }}>
          <SectionHeading tone="light" eyebrow={t("eyebrow")} title={<span id="about-heading">{t.rich("title", { em: em("text-ember-300") })}</span>} />
          <p className="mt-6 text-lg leading-relaxed text-white/75">{content.restaurantDescription(restaurant)}</p>
          <blockquote className="mt-8 border-l-2 border-ember-400 pl-5">
            <p className="font-display text-xl text-white/90 italic">“{t("quote")}”</p>
            <footer className="mt-3 text-sm text-white/60">— {t("quoteBy")}</footer>
          </blockquote>
          <dl className="mt-10 grid grid-cols-3 gap-6">
            {[
              [t("stats.pizzasValue"), t("stats.pizzas")],
              [`${f.decimal(restaurant.rating)}★`, t("stats.reviews", { count: f.compact(restaurant.reviewCount) })],
              ["100%", t("stats.fresh")],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-semibold sm:text-4xl">{value}</dd>
                <dd className="mt-1 text-xs text-white/60">{label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const t = useTranslations("home.how");
  const steps = [
    { icon: SlidersHorizontal, key: "customise" },
    { icon: ShoppingBag, key: "checkout" },
    { icon: Timer, key: "track" },
  ] as const;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="how-heading">
      <SectionHeading align="center" eyebrow={t("eyebrow")} title={<span id="how-heading">{t("title")}</span>} />
      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <motion.li key={s.key} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.1 }} className="relative rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border">
            <span className="absolute top-6 right-7 font-display text-6xl font-semibold text-primary/10" aria-hidden="true">0{i + 1}</span>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"><s.icon className="size-5" aria-hidden="true" /></span>
            <h3 className="mt-5 text-lg font-semibold">{t(`${s.key}.title`)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(`${s.key}.body`)}</p>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

export function Testimonials() {
  const reviews = useDataStore((s) => s.restaurant.reviews);
  const restaurant = useDataStore((s) => s.restaurant);
  const t = useTranslations("home.reviews");
  const content = useContent();
  const f = useFormat();
  return (
    <section className="bg-cream-200/60 py-20" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={<span id="reviews-heading">{t("title", { rating: f.decimal(restaurant.rating), count: f.number(restaurant.reviewCount) })}</span>}
        />
        <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {reviews.slice(0, 3).map((r, i) => (
            <motion.figure key={r.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="relative flex w-[85%] shrink-0 snap-start flex-col rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border md:w-auto">
              <Quote className="size-8 text-primary/20" aria-hidden="true" />
              <div className="mt-3 flex gap-0.5" role="img" aria-label={t("stars", { rating: r.rating })}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className={cn("size-4", s < r.rating ? "fill-gold-500 text-gold-500" : "text-charcoal-200")} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 leading-relaxed text-charcoal-700">“{content.reviewQuote(r)}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-linear-to-br from-tomato-500 to-ember-500 text-sm font-bold text-white">{r.avatar}</span>
                <span>
                  <span className="block text-sm font-semibold">{r.author}</span>
                  <span className="block text-xs text-muted-foreground">{r.location}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const DAY_INDEX: Record<OpeningHours["day"], number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

/** Deterministic time text (avoids server/browser Intl differences): 24h for de/tr, 12h for en. */
function useClock() {
  const locale = useLocale();
  const t = useTranslations("home.visit");
  return (time: string) => {
    const [h, m] = time.split(":").map(Number) as [number, number];
    if (h === 0 && m === 0) return t("midnight");
    if (locale !== "en") return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""}${h >= 12 ? "pm" : "am"}`;
  };
}

export function VisitSection() {
  const restaurant = useDataStore((s) => s.restaurant);
  const hydrated = useHydrated();
  const t = useTranslations("home.visit");
  const days = useTranslations("days");
  const f = useFormat();
  const clock = useClock();
  const todayIndex = hydrated ? new Date().getDay() : -1;

  return (
    <section id="visit" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="visit-heading">
      <SectionHeading eyebrow={t("eyebrow")} title={<span id="visit-heading">{t.rich("title", { em: em("text-primary") })}</span>} />
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <motion.div {...fadeUp} className="rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border">
          <h3 className="flex items-center gap-2 font-semibold"><Clock className="size-5 text-primary" aria-hidden="true" /> {t("hours")}</h3>
          <ul className="mt-5 space-y-1 text-sm">
            {restaurant.hours.map((h) => {
              const isToday = DAY_INDEX[h.day] === todayIndex;
              return (
                <li key={h.day} className={cn("flex justify-between rounded-lg px-3 py-2", isToday && "bg-primary/10 font-semibold text-primary")}>
                  <span>{days(h.day.toLowerCase() as "monday")}{isToday && <span className="sr-only"> ({t("today")})</span>}</span>
                  <span className="tabular">{h.closed ? t("closed") : `${clock(h.open)} – ${clock(h.close)}`}</span>
                </li>
              );
            })}
          </ul>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="flex flex-col gap-6">
          <div className="flex-1 rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border">
            <h3 className="flex items-center gap-2 font-semibold"><Bike className="size-5 text-primary" aria-hidden="true" /> {t("delivery")}</h3>
            {restaurant.delivery.enabled ? (
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>{t("deliveryRadius", { km: restaurant.delivery.radiusKm, minutes: restaurant.delivery.estimatedMinutes })}</li>
                <li>{t("deliveryFee", { fee: f.currency(restaurant.delivery.fee), threshold: f.currency(restaurant.delivery.freeDeliveryOver) })}</li>
                <li>{t("deliveryMinimum", { amount: f.currency(restaurant.delivery.minOrder) })}</li>
              </ul>
            ) : <p className="mt-4 text-sm text-muted-foreground">{t("deliveryPaused")}</p>}
          </div>
          <div className="flex-1 rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border">
            <h3 className="flex items-center gap-2 font-semibold"><Store className="size-5 text-primary" aria-hidden="true" /> {t("pickup")}</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              {restaurant.pickup.enabled ? t("pickupBody", { minutes: restaurant.pickup.estimatedMinutes }) : t("pickupOff")}
            </p>
          </div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.16 }} className="relative overflow-hidden rounded-3xl bg-charcoal-900 p-7 text-white">
          <div className="absolute inset-0 opacity-30">
            <Image src={PHOTOS.interiorBright} alt="" fill sizes="33vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-charcoal-950 via-charcoal-950/80 to-charcoal-950/40" />
          <div className="relative flex h-full flex-col">
            <h3 className="flex items-center gap-2 font-semibold"><MapPin className="size-5 text-ember-400" aria-hidden="true" /> {t("findUs")}</h3>
            <address className="mt-4 text-lg not-italic leading-relaxed">{restaurant.address}<br />{restaurant.city}</address>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2"><Phone className="size-4 text-ember-400" aria-hidden="true" /> {restaurant.phone}</li>
              <li className="flex items-center gap-2"><Mail className="size-4 text-ember-400" aria-hidden="true" /> {restaurant.email}</li>
            </ul>
            <Button asChild className="mt-auto h-12 w-full rounded-full font-semibold">
              <Link href="/menu">{t("startOrder")} <ArrowRight /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const t = useTranslations("home.cta");
  const minutes = useDataStore((s) => s.restaurant.delivery.estimatedMinutes);
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8" aria-label={t("label")}>
      <motion.div {...fadeUp} className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-linear-to-br from-charcoal-900 to-charcoal-950 px-6 py-16 text-center text-white sm:px-12">
        <div className="absolute -top-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-tomato-500/30 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <p className="font-display text-4xl font-semibold text-balance sm:text-6xl">{t.rich("title", { minutes, em: em("text-ember-300") })}</p>
          <p className="mx-auto mt-4 max-w-lg text-white/70">{t("body")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild className="h-13 rounded-full px-8 text-base font-semibold"><Link href="/menu">{t("order")} <ArrowRight /></Link></Button>
            <Button asChild variant="outline" className="h-13 rounded-full border-white/20 bg-white/5 px-8 text-base text-white hover:bg-white/15 hover:text-white"><Link href="/register">{t("register")}</Link></Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
