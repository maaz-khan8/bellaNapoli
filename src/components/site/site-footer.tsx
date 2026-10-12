"use client";

import Link from "next/link";
import { ChefHat, Clock, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ResetDemoButton } from "@/components/shared/reset-demo-button";
import { useDataStore } from "@/store/data-store";
import { useCatalog } from "@/hooks/use-catalog";

export function SiteFooter() {
  const restaurant = useDataStore((s) => s.restaurant);
  const { categories } = useCatalog();

  return (
    <footer className="relative overflow-hidden bg-charcoal-950 text-charcoal-200">
      <div className="pointer-events-none absolute -top-40 right-0 size-[30rem] rounded-full bg-tomato-500/10 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-28 sm:px-6 md:pb-10 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-charcoal-300">{restaurant.tagline}. Hand-stretched dough, San Marzano tomatoes and a 485°C wood oven.</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">Menu</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}><Link href={`/menu?category=${c.slug}`} className="hover:text-white">{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">Your account</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
              <li><Link href="/register" className="hover:text-white">Create account</Link></li>
              <li><Link href="/account/orders" className="hover:text-white">Track an order</Link></li>
              <li><Link href="/cart" className="hover:text-white">Your cart</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">Visit us</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />{restaurant.address}, {restaurant.city}</li>
              <li className="flex gap-2.5"><Phone className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />{restaurant.phone}</li>
              <li className="flex gap-2.5"><Mail className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />{restaurant.email}</li>
              <li className="flex gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-ember-400" aria-hidden="true" />Open daily · see hours above</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs text-charcoal-400">
            © {restaurant.foundedYear}–2026 {restaurant.name}. Interactive UI prototype — all orders, accounts and payments are simulated.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/manager/login" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-charcoal-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white">
              <ChefHat className="size-3.5" aria-hidden="true" /> Restaurant Manager
            </Link>
            <Link href="/super-admin/login" className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-charcoal-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Super Admin
            </Link>
            <ResetDemoButton variant="ghost" className="h-9 text-xs text-charcoal-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white" />
          </div>
        </div>
      </div>
    </footer>
  );
}
