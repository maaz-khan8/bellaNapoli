import Link from "next/link";
import { Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-svh flex-1 flex-col items-center justify-center bg-cream-100 px-6 text-center">
      <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Pizza className="size-10" aria-hidden="true" />
      </span>
      <p className="mt-8 text-sm font-bold tracking-[0.2em] text-primary uppercase">404</p>
      <h1 className="mt-2 font-display text-5xl font-semibold tracking-tight">This slice is missing</h1>
      <p className="mt-4 max-w-md text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back to something delicious.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="h-12 rounded-full px-6"><Link href="/">Back home</Link></Button>
        <Button asChild variant="outline" className="h-12 rounded-full px-6"><Link href="/menu">See the menu</Link></Button>
      </div>
    </main>
  );
}
