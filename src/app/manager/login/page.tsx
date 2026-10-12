import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ChefHat, ClipboardList, Flame, TrendingUp } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = { title: "Manager sign in" };

const TICKETS = [
  { n: "BN-10412", items: "2× Margherita · 1× Tiramisu", status: "New", tone: "bg-amber-400 text-amber-950" },
  { n: "BN-10411", items: "1× 'Nduja & Hot Honey (L)", status: "In oven", tone: "bg-ember-500 text-white" },
  { n: "BN-10409", items: "Family Feast · 2× Lemonade", status: "Ready", tone: "bg-basil-500 text-white" },
];

export default function ManagerLoginPage() {
  return (
    <div className="theme-manager relative flex min-h-svh flex-1 overflow-hidden bg-charcoal-950 text-white">
      <div className="bg-dots absolute inset-0" aria-hidden="true" />
      <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-ember-500/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-40 -bottom-40 size-[30rem] rounded-full bg-tomato-600/25 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-2 lg:px-8">
        <div className="hidden lg:block">
          <div className="flex items-center gap-3">
            <LogoMark className="size-12" />
            <div>
              <p className="font-display text-2xl font-semibold">Bella Napoli</p>
              <p className="text-xs font-semibold tracking-[0.25em] text-ember-300 uppercase">Kitchen & Manager Console</p>
            </div>
          </div>
          <h1 className="mt-10 font-display text-5xl leading-tight font-semibold">Run tonight&apos;s service <em className="text-ember-300">from one screen.</em></h1>
          <ul className="mt-8 space-y-4 text-white/75">
            <li className="flex items-center gap-3"><ClipboardList className="size-5 text-ember-400" aria-hidden="true" /> Accept, prepare and dispatch orders in real time</li>
            <li className="flex items-center gap-3"><ChefHat className="size-5 text-ember-400" aria-hidden="true" /> Update menu, prices and availability instantly</li>
            <li className="flex items-center gap-3"><TrendingUp className="size-5 text-ember-400" aria-hidden="true" /> Track revenue and best-sellers as they happen</li>
          </ul>
          <div className="mt-10 space-y-2.5" aria-hidden="true">
            {TICKETS.map((t, i) => (
              <div key={t.n} className="glass-dark flex items-center gap-4 rounded-2xl px-4 py-3 ring-1 ring-white/10" style={{ marginLeft: i * 24 }}>
                <Flame className="size-4 text-ember-400" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{t.n}</p>
                  <p className="text-xs text-white/60">{t.items}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${t.tone}`}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>

        <main id="main" className="mx-auto w-full max-w-md">
          <div className="rounded-3xl bg-charcoal-900/80 p-7 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-9">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <LogoMark />
              <p className="text-xs font-semibold tracking-[0.2em] text-ember-300 uppercase">Manager Console</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ember-500/15 px-3 py-1 text-xs font-semibold text-ember-300 ring-1 ring-ember-500/30">
              <ChefHat className="size-3.5" aria-hidden="true" /> Restaurant staff only
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Manager sign in</h2>
            <p className="mt-1.5 mb-7 text-sm text-white/60">Use your Bella Napoli manager account.</p>
            <Suspense>
              <LoginForm role="manager" tone="dark" submitClassName="bg-ember-500 text-charcoal-950 hover:bg-ember-400" />
            </Suspense>
          </div>
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to customer website
          </Link>
        </main>
      </div>
    </div>
  );
}
