"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useContent } from "@/hooks/use-content";
import { useFormat } from "@/hooks/use-format";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Flame, Pause, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHOTOS } from "@/lib/images";
import { useDataStore } from "@/store/data-store";
import { startingPrice } from "@/lib/pricing";

/** Slide copy lives in messages under hero.slides.<key>; layout data stays here. */
interface Slide {
  key: "s1" | "s2" | "s3";
  image: string;
  productSlug: string;
  primaryHref: string;
  secondaryHref: string;
  glow: string;
}

const SLIDES: Slide[] = [
  { key: "s1", image: PHOTOS.margherita, productSlug: "margherita-classica", primaryHref: "/menu", secondaryHref: "/menu/margherita-classica", glow: "from-tomato-500/40" },
  { key: "s2", image: PHOTOS.pepperoniOlive, productSlug: "nduja-hot-honey", primaryHref: "/menu/nduja-hot-honey", secondaryHref: "/menu?category=signature", glow: "from-ember-500/45" },
  { key: "s3", image: PHOTOS.pepperoni, productSlug: "family-feast", primaryHref: "/menu/family-feast", secondaryHref: "/menu?category=deals", glow: "from-basil-500/40" },
];

const AUTOPLAY_MS = 7000;

export function HeroSlider() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const products = useDataStore((s) => s.products);
  const restaurant = useDataStore((s) => s.restaurant);
  const slide = SLIDES[index]!;
  const product = products.find((p) => p.slug === slide.productSlug);
  const autoplay = playing && !hovered && !reduceMotion;
  const t = useTranslations("hero");
  const content = useContent();
  const f = useFormat();
  const s = (field: "eyebrow" | "title1" | "title2" | "title3" | "body" | "primary" | "secondary", key = slide.key) => t(`slides.${key}.${field}`);

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir);
    setIndex((next + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => go(index + 1, 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [autoplay, index, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={t("label")}
      className="relative isolate overflow-hidden bg-charcoal-950 text-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1, 1);
        if (e.key === "ArrowLeft") go(index - 1, -1);
      }}
    >
      {/* Atmosphere */}
      <div className="bg-dots absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <AnimatePresence initial={false}>
        <motion.div
          key={`glow-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className={`absolute top-1/2 right-[-10%] -z-10 size-[60rem] -translate-y-1/2 rounded-full bg-radial ${slide.glow} to-transparent to-70% blur-2xl`}
          aria-hidden="true"
        />
      </AnimatePresence>
      <div className="absolute -bottom-32 -left-32 -z-10 size-96 rounded-full bg-tomato-600/20 blur-3xl" aria-hidden="true" />

      <motion.div
        className="mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl touch-pan-y items-center gap-10 px-4 pt-10 pb-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:px-8 lg:pt-6"
        drag={reduceMotion ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x < -70) go(index + 1, 1);
          else if (info.offset.x > 70) go(index - 1, -1);
        }}
      >
        <div className="relative z-10 order-2 lg:order-1" aria-live={autoplay ? "off" : "polite"}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              initial="enter"
              animate="center"
              exit="exit"
              variants={{
                enter: { opacity: 0, y: 28 },
                center: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, duration: 0.5 } },
                exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={t("slideOf", { n: index + 1, total: SLIDES.length })}
            >
              <motion.p variants={{ enter: { opacity: 0, y: 12 }, center: { opacity: 1, y: 0 } }} className="glass-dark inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-ember-200 ring-1 ring-white/10">
                <Flame className="size-3.5 text-ember-400" aria-hidden="true" /> {s("eyebrow")}
              </motion.p>
              <motion.h1 variants={{ enter: { opacity: 0, y: 18 }, center: { opacity: 1, y: 0 } }} className="mt-6 font-display text-5xl leading-[0.98] font-semibold tracking-tight text-balance sm:text-6xl xl:text-7xl">
                {s("title1")}
                <br />
                <span className="bg-linear-to-r from-ember-300 via-ember-400 to-tomato-400 bg-clip-text text-transparent italic">{s("title2")}</span>{" "}
                {s("title3")}
              </motion.h1>
              <motion.p variants={{ enter: { opacity: 0, y: 18 }, center: { opacity: 1, y: 0 } }} className="mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
                {s("body")}
              </motion.p>
              <motion.div variants={{ enter: { opacity: 0, y: 18 }, center: { opacity: 1, y: 0 } }} className="mt-8 flex flex-wrap gap-3">
                <Button asChild className="group h-13 rounded-full px-7 text-base font-semibold shadow-xl shadow-tomato-900/40">
                  <Link href={slide.primaryHref}>
                    {s("primary")}
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-13 rounded-full border-white/20 bg-white/5 px-7 text-base font-semibold text-white hover:bg-white/15 hover:text-white">
                  <Link href={slide.secondaryHref}>{s("secondary")}</Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <dt className="text-xs text-white/55">{t("rating")}</dt>
              <dd className="mt-1 flex items-center gap-1 text-lg font-semibold">
                <Star className="size-4 fill-gold-400 text-gold-400" aria-hidden="true" /> {f.decimal(restaurant.rating)}
                <span className="text-xs font-normal text-white/50">({f.compact(restaurant.reviewCount)})</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">{t("delivery")}</dt>
              <dd className="mt-1 flex items-center gap-1 text-lg font-semibold"><Clock className="size-4 text-ember-400" aria-hidden="true" /> {t("minutes", { minutes: restaurant.delivery.estimatedMinutes })}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/55">{t("oven")}</dt>
              <dd className="mt-1 flex items-center gap-1 text-lg font-semibold"><Flame className="size-4 text-tomato-400" aria-hidden="true" /> 485°C</dd>
            </div>
          </dl>
        </div>

        {/* Pizza visual */}
        <div className="relative order-1 mx-auto w-full max-w-[min(30rem,62vw)] sm:max-w-[min(30rem,72vw)] lg:order-2 lg:max-w-[34rem]">
          <div className="absolute inset-[-8%] rounded-full border border-dashed border-white/10" aria-hidden="true" />
          <div className="absolute inset-[-16%] hidden rounded-full border border-white/5 sm:block" aria-hidden="true" />
          <AnimatePresence mode="popLayout" custom={direction} initial={false}>
            <motion.div
              key={slide.image}
              custom={direction}
              initial={{ opacity: 0, rotate: direction * -70, scale: 0.75, x: direction * 120 }}
              animate={{ opacity: 1, rotate: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, rotate: direction * 70, scale: 0.75, x: direction * -120 }}
              transition={{ type: "spring", stiffness: 70, damping: 18 }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 animate-spin-slow overflow-hidden rounded-full shadow-[0_40px_120px_-20px_rgb(0_0_0/0.8)] ring-8 ring-white/5">
                <Image src={slide.image} alt={product ? content.productName(product) : t("featuredPizza")} fill priority sizes="(min-width: 1024px) 34rem, 82vw" className="scale-[1.35] object-cover" />
              </div>
            </motion.div>
          </AnimatePresence>

          {product && (
            <motion.div
              key={`price-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="glass absolute bottom-[4%] -left-2 animate-float rounded-2xl px-4 py-3 text-charcoal-900 shadow-2xl sm:-left-8"
            >
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">{product.kind === "pizza" ? t("from") : t("only")}</p>
              <p className="text-2xl font-bold tracking-tight text-primary">{f.currency(startingPrice(product))}</p>
              <p className="max-w-36 truncate text-xs font-medium">{content.productName(product)}</p>
            </motion.div>
          )}
          <div className="glass-dark absolute top-[6%] -right-1 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium ring-1 ring-white/10 sm:flex sm:-right-6 [animation-delay:1.5s] animate-float">
            <span className="flex size-8 items-center justify-center rounded-full bg-basil-500"><Clock className="size-4" aria-hidden="true" /></span>
            {t("hotFresh", { minutes: restaurant.delivery.estimatedMinutes })}
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-6 z-20">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2" role="tablist" aria-label={t("chooseSlide")}>
            {SLIDES.map((sl, i) => (
              <button
                key={sl.productSlug}
                role="tab"
                aria-selected={i === index}
                aria-label={t("slideLabel", { n: i + 1, title: [s("title1", sl.key), s("title2", sl.key), s("title3", sl.key)].join(" ") })}
                onClick={() => go(i, i > index ? 1 : -1)}
                className="group relative flex h-8 items-center"
              >
                <span className={`relative block h-1.5 overflow-hidden rounded-full bg-white/25 transition-all duration-300 ${i === index ? "w-14" : "w-6 group-hover:bg-white/50"}`}>
                  {i === index && (
                    <motion.span
                      key={`${index}-${autoplay}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-ember-400"
                      initial={{ width: autoplay ? "0%" : "100%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: autoplay ? AUTOPLAY_MS / 1000 : 0, ease: "linear" }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setPlaying((p) => !p)} className="flex size-11 items-center justify-center rounded-full text-white/80 ring-1 ring-white/15 transition hover:bg-white/10 hover:text-white" aria-label={playing ? t("pause") : t("play")}>
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button onClick={() => go(index - 1, -1)} className="flex size-11 items-center justify-center rounded-full text-white ring-1 ring-white/15 transition hover:bg-white/10" aria-label={t("previous")}>
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => go(index + 1, 1)} className="flex size-11 items-center justify-center rounded-full bg-white text-charcoal-900 transition hover:bg-ember-300" aria-label={t("next")}>
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
