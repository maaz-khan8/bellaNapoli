import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { PHOTOS } from "@/lib/images";

export default function CustomerAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col bg-cream-100 px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-muted-foreground hover:bg-white hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to site
          </Link>
        </div>
        <main id="main" className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {children}
        </main>
        <p className="text-center text-xs text-muted-foreground">Interactive prototype · accounts are stored only in this browser</p>
      </div>
      <div className="relative hidden overflow-hidden bg-charcoal-950 lg:block">
        <Image src={PHOTOS.cheesePull} alt="" fill priority sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-linear-to-t from-charcoal-950 via-charcoal-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <div className="flex gap-1" role="img" aria-label="5 out of 5 stars">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-5 fill-gold-400 text-gold-400" aria-hidden="true" />)}
          </div>
          <blockquote className="mt-4 max-w-lg font-display text-3xl leading-snug">
            “The crust is unreal — blistered, chewy, and light. Ordering takes thirty seconds.”
          </blockquote>
          <p className="mt-4 text-sm text-white/70">Marcus T., SoHo · one of 2,847 five-star reviews</p>
        </div>
      </div>
    </div>
  );
}
