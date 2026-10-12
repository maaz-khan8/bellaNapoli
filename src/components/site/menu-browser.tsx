"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Search, SearchX, X } from "lucide-react";
import type { Product } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useCatalog } from "@/hooks/use-catalog";
import { startingPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type SortKey = "popular" | "price-asc" | "price-desc" | "rating" | "name";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

function sortProducts(list: Product[], sort: SortKey) {
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => startingPrice(a) - startingPrice(b));
    case "price-desc":
      return sorted.sort((a, b) => startingPrice(b) - startingPrice(a));
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted.sort((a, b) => Number(b.available) - Number(a.available) || b.popularity - a.popularity);
  }
}

export function MenuBrowser() {
  const { categories, products } = useCatalog();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeSlug = searchParams.get("category") ?? "all";
  const activeCategory = categories.find((c) => c.slug === activeSlug);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("popular");
  const [availableOnly, setAvailableOnly] = useState(false);

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === "all") params.delete("category");
    else params.set("category", slug);
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const catName = new Map(categories.map((c) => [c.id, c.name.toLowerCase()]));
    return sortProducts(
      products.filter((p) => {
        if (activeCategory && p.categoryId !== activeCategory.id) return false;
        if (availableOnly && !p.available) return false;
        if (!q) return true;
        return [p.name, p.description, catName.get(p.categoryId) ?? "", ...p.tags].some((s) => s.toLowerCase().includes(q));
      }),
      sort,
    );
  }, [products, categories, activeCategory, query, availableOnly, sort]);

  const grouped = !activeCategory && !query.trim();
  const clearAll = () => {
    setQuery("");
    setAvailableOnly(false);
    setCategory("all");
  };

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal-950 text-white">
        <div className="bg-dots absolute inset-0" aria-hidden="true" />
        <div className="absolute -top-32 right-0 size-[28rem] rounded-full bg-tomato-500/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-bold tracking-[0.2em] text-ember-300 uppercase">Bella Napoli menu</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight sm:text-6xl">
            {activeCategory ? activeCategory.name : <>Pick your <em className="text-ember-300">perfect</em> pie</>}
          </h1>
          <p className="mt-4 max-w-xl text-white/70">
            {activeCategory?.description ?? "Wood-fired pizzas, sides, desserts and deals. Customise any pizza — size, crust and toppings — on its page."}
          </p>
          <div className="relative mt-8 max-w-xl">
            <label htmlFor="menu-search" className="sr-only">Search the menu</label>
            <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-charcoal-400" aria-hidden="true" />
            <Input
              id="menu-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pizzas, toppings, sides…"
              className="h-14 rounded-2xl border-0 bg-white pr-12 pl-12 text-base text-charcoal-900 shadow-xl placeholder:text-charcoal-400"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-charcoal-500 hover:bg-charcoal-100" aria-label="Clear search">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="glass sticky top-18 z-30 border-b">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-1 lg:px-0" role="tablist" aria-label="Menu categories">
            {[{ slug: "all", name: "All" }, ...categories].map((c) => {
              const active = c.slug === (activeCategory?.slug ?? "all");
              return (
                <button
                  key={c.slug}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(c.slug)}
                  className={cn(
                    "relative h-10 shrink-0 rounded-full px-4 text-sm font-semibold whitespace-nowrap transition-colors",
                    active ? "text-white" : "bg-white text-charcoal-700 ring-1 ring-border hover:ring-primary/40",
                  )}
                >
                  {active && <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                  <span className="relative">{c.name}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch id="available-only" checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <Label htmlFor="available-only" className="text-sm whitespace-nowrap">Available now</Label>
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="ml-auto h-10 min-w-44 rounded-full bg-white" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
          Showing <strong className="text-foreground">{filtered.length}</strong> item{filtered.length === 1 ? "" : "s"}
          {query && <> for “{query}”</>}
        </p>
        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No matches on the menu"
            description="Try a different search or clear your filters — our pizzaiolo has plenty more to offer."
            action={<Button onClick={clearAll} className="h-11 rounded-full px-6">Clear filters</Button>}
          />
        ) : grouped ? (
          <div className="space-y-16">
            {categories.map((c) => {
              const items = filtered.filter((p) => p.categoryId === c.id);
              if (!items.length) return null;
              return (
                <section key={c.id} aria-labelledby={`cat-${c.slug}`} className="scroll-mt-40">
                  <div className="mb-6 flex items-end justify-between gap-4 border-b pb-4">
                    <div>
                      <h2 id={`cat-${c.slug}`} className="font-display text-3xl font-semibold">{c.name}</h2>
                      <p className="text-sm text-muted-foreground">{c.description}</p>
                    </div>
                    <button onClick={() => setCategory(c.slug)} className="shrink-0 text-sm font-semibold text-primary hover:underline">View only these</button>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {items.map((p) => <ProductCard key={p.id} product={p} />)}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}
