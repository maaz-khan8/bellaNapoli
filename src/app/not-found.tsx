import Link from "next/link";
import { Pizza } from "lucide-react";
import { fontVariables } from "@/lib/fonts";

/** Fallback 404 outside the localized site (e.g. unknown staff-portal URLs). */
export default function NotFound() {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <main id="main" className="flex min-h-svh flex-1 flex-col items-center justify-center bg-cream-100 px-6 text-center">
          <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <Pizza className="size-10" aria-hidden="true" />
          </span>
          <p className="mt-8 text-sm font-bold tracking-[0.2em] text-primary uppercase">404</p>
          <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">Bella Napoli</Link>
            <Link href="/manager/login" className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-border">Manager</Link>
            <Link href="/super-admin/login" className="inline-flex h-12 items-center rounded-full px-6 font-semibold ring-1 ring-border">Super Admin</Link>
          </div>
        </main>
      </body>
    </html>
  );
}
