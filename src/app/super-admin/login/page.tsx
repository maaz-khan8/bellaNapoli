import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Activity, ArrowLeft, Fingerprint, Lock, Percent, Users } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { PlatformMark } from "@/components/brand/platform-logo";

export const metadata: Metadata = { title: "Super Admin sign in" };

export default function SuperAdminLoginPage() {
  return (
    <div className="theme-admin relative flex min-h-svh flex-1 overflow-hidden bg-[#080a16] text-white">
      <div className="bg-grid-admin absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" aria-hidden="true" />
      <div className="absolute top-1/4 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <PlatformMark className="size-14" />
          <p className="mt-4 text-sm font-semibold tracking-[0.3em] text-indigo-300 uppercase">Crustline Platform</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Super Admin console</h1>
          <p className="mt-2 text-sm text-white/55">Restricted to platform administrators.</p>
        </div>

        <main id="main" className="rounded-2xl bg-white/[0.04] p-7 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-indigo-500/10 px-3 py-2 text-xs font-medium text-indigo-200 ring-1 ring-indigo-400/20">
            <Fingerprint className="size-4" aria-hidden="true" /> Secure admin session · activity is logged
          </div>
          <Suspense>
            <LoginForm role="admin" tone="dark" submitClassName="bg-indigo-500 text-white hover:bg-indigo-400" />
          </Suspense>
        </main>

        <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-[11px] text-white/50" aria-label="Console capabilities">
          <li className="rounded-xl bg-white/[0.03] px-2 py-3 ring-1 ring-white/5"><Activity className="mx-auto mb-1.5 size-4 text-indigo-300" aria-hidden="true" />Live monitoring</li>
          <li className="rounded-xl bg-white/[0.03] px-2 py-3 ring-1 ring-white/5"><Users className="mx-auto mb-1.5 size-4 text-indigo-300" aria-hidden="true" />Customer control</li>
          <li className="rounded-xl bg-white/[0.03] px-2 py-3 ring-1 ring-white/5"><Percent className="mx-auto mb-1.5 size-4 text-indigo-300" aria-hidden="true" />Commissions</li>
        </ul>
        <div className="mt-8 flex items-center justify-between text-xs text-white/45">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-white"><ArrowLeft className="size-3.5" aria-hidden="true" /> Customer website</Link>
          <span className="inline-flex items-center gap-1.5"><Lock className="size-3.5" aria-hidden="true" /> Demo environment</span>
        </div>
      </div>
    </div>
  );
}
