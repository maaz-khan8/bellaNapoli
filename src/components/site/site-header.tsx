"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChefHat,
  LogOut,
  MapPin,
  Menu as MenuIcon,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "@/hooks/use-session";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { useUIStore } from "@/store/ui-store";
import { useOrderingStatus } from "@/hooks/use-catalog";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/menu?category=deals", label: "Deals" },
  { href: "/#about", label: "Our Story" },
  { href: "/#visit", label: "Visit" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const count = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const pulse = useUIStore((s) => s.cartPulse);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const session = useSession("customer");
  const logout = useAuthStore((s) => s.logout);
  const { canOrder, reason } = useOrderingStatus();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = () => {
    logout("customer");
    toast.success("Signed out", { description: "See you again soon!" });
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.split("?")[0]!.split("#")[0]!) && !href.includes("#") && !href.includes("?");

  return (
    <>
      <div className="bg-charcoal-900 text-cream-100">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs font-medium sm:text-sm">
          {canOrder ? (
            <>
              <Sparkles className="size-4 shrink-0 text-ember-400" aria-hidden="true" />
              <span>
                Free delivery over $40 · Use <strong className="text-ember-300">WELCOME10</strong> for 10% off
              </span>
            </>
          ) : (
            <span role="status" className="text-ember-200">{reason}</span>
          )}
        </div>
      </div>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-300",
          scrolled ? "glass border-b border-border/60 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)]" : "bg-background",
        )}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Open navigation menu">
                <MenuIcon className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[85%] max-w-sm bg-cream-100 p-0" showCloseButton={false}>
              <div className="flex items-center justify-between border-b px-5 py-4">
                <Logo />
                <Button variant="ghost" size="icon-lg" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="size-5" />
                </Button>
              </div>
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">Site navigation and account links</SheetDescription>
              <nav className="flex flex-col gap-1 px-3" aria-label="Mobile">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-xl px-4 py-3.5 font-display text-2xl font-medium transition-colors hover:bg-white",
                      isActive(item.href) && "bg-white text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto space-y-2 border-t p-5 text-sm">
                {session ? (
                  <>
                    <Link href="/account" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 font-medium"><User className="size-4" /> My account</Link>
                    <Link href="/account/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 font-medium"><Package className="size-4" /> My orders</Link>
                    <button onClick={() => { setMobileOpen(false); signOut(); }} className="flex items-center gap-2 py-2 font-medium text-destructive"><LogOut className="size-4" /> Sign out</button>
                  </>
                ) : (
                  <Button asChild className="h-11 w-full rounded-full"><Link href="/login" onClick={() => setMobileOpen(false)}>Sign in or register</Link></Button>
                )}
                <div className="flex gap-4 pt-3 text-xs text-muted-foreground">
                  <Link href="/manager/login" className="inline-flex items-center gap-1 hover:text-foreground"><ChefHat className="size-3.5" /> Manager portal</Link>
                  <Link href="/super-admin/login" className="inline-flex items-center gap-1 hover:text-foreground"><ShieldCheck className="size-3.5" /> Super Admin</Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Logo className="mr-auto lg:mr-0" />

          <nav className="mx-auto hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold text-charcoal-700 transition-colors hover:text-primary",
                  isActive(item.href) && "text-primary",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span layoutId="nav-pill" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/#visit" className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground xl:inline-flex">
              <MapPin className="size-4 text-primary" /> Mulberry St, NYC
            </Link>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex size-11 items-center justify-center rounded-full bg-charcoal-900 text-sm font-semibold text-white ring-2 ring-transparent transition hover:ring-primary/40" aria-label="Account menu">
                    {initials(session.name)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-semibold">{session.name}</p>
                    <p className="truncate text-xs font-normal text-muted-foreground">{session.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/account"><User /> My account</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/orders"><Package /> My orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account/addresses"><MapPin /> Addresses</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onSelect={signOut}><LogOut /> Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="ghost" className="hidden h-11 rounded-full px-4 font-semibold sm:inline-flex">
                <Link href="/login"><User className="size-4" /> Sign in</Link>
              </Button>
            )}
            <motion.button
              key={pulse}
              initial={pulse ? { scale: 1 } : false}
              animate={pulse ? { scale: [1, 1.18, 0.95, 1] } : undefined}
              transition={{ duration: 0.45 }}
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-tomato-600"
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="size-5" />
              <span className="hidden sm:inline">Cart</span>
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-primary"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </header>
    </>
  );
}
