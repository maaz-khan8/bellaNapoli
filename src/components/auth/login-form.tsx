"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowRight, Info, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { DemoCredentials } from "@/components/auth/demo-credentials";
import { HOME_PATHS, LOGIN_PATHS, useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/ui-store";
import { useSession } from "@/hooks/use-session";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { cn } from "@/lib/utils";

const ROLE_NAMES: Record<Role, string> = { customer: "customer", manager: "Restaurant Manager", admin: "Super Admin" };

/** Only allow same-site relative redirects that belong to this portal. */
function safeRedirect(target: string | null, role: Role) {
  if (!target || !target.startsWith("/") || target.startsWith("//")) return HOME_PATHS[role];
  const portalPrefix = role === "manager" ? "/manager" : role === "admin" ? "/super-admin" : "";
  if (role === "customer" && (target.startsWith("/manager") || target.startsWith("/super-admin"))) return HOME_PATHS.customer;
  if (portalPrefix && !target.startsWith(portalPrefix)) return HOME_PATHS[role];
  return target;
}

export function LoginForm({
  role,
  tone = "light",
  submitClassName,
  forgotHref,
}: {
  role: Role;
  tone?: "light" | "dark";
  submitClassName?: string;
  forgotHref?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHydrated();
  const session = useSession(role);
  const login = useAuthStore((s) => s.login);
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const [error, setError] = useState<{ message: string; portal?: Role } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Prevents the "already signed in" redirect from racing our own post-login redirect
  const [justSignedIn, setJustSignedIn] = useState(false);

  const redirectParam = searchParams.get("redirect");
  const denied = searchParams.get("denied") as Role | null;
  const target = safeRedirect(redirectParam, role);
  const dark = tone === "dark";

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  // Already signed in for this portal → continue straight on
  useEffect(() => {
    if (hydrated && session && !justSignedIn) router.replace(target);
  }, [hydrated, session, router, target, justSignedIn]);

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 650)); // simulated auth latency
    const result = login(role, values.email, values.password, values.remember);
    setSubmitting(false);
    if (!result.ok) {
      setError({ message: result.error, portal: result.wrongPortal });
      return;
    }
    setJustSignedIn(true);
    toast.success(`Welcome back, ${result.session.name.split(" ")[0]}!`, {
      description: role === "customer" && target === "/checkout" ? "Your cart is saved — let's finish your order." : undefined,
    });
    router.replace(target);
  };

  const useDemo = (email: string, password: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    void handleSubmit(onSubmit)();
  };

  const inputClass = cn("h-12 rounded-xl", dark && "border-white/15 bg-white/5 text-white placeholder:text-white/40");

  return (
    <div className="space-y-5">
      {role === "customer" && redirectParam === "/checkout" && (
        <div role="status" className="flex gap-3 rounded-2xl bg-primary/10 p-4 text-sm text-tomato-800">
          <ShoppingBag className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <p><strong>Sign in to place your order.</strong> Your cart{cartCount ? ` (${cartCount} item${cartCount > 1 ? "s" : ""})` : ""} is saved and you&apos;ll go straight back to checkout.</p>
        </div>
      )}
      {denied && (
        <div role="alert" className={cn("flex gap-3 rounded-2xl p-4 text-sm", dark ? "bg-amber-400/10 text-amber-200" : "bg-amber-50 text-amber-900")}>
          <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>
            You&apos;re signed in as a <strong>{ROLE_NAMES[denied]}</strong>, which can&apos;t open that page.
            Sign in with a {ROLE_NAMES[role]} account to continue.
          </p>
        </div>
      )}
      {!denied && redirectParam && role !== "customer" && (
        <p role="status" className={cn("text-sm", dark ? "text-white/60" : "text-muted-foreground")}>Please sign in to continue to that page.</p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <FormField label="Email address" required error={errors.email?.message}>
          <Input type="email" autoComplete="username" placeholder="you@example.com" className={inputClass} {...register("email")} />
        </FormField>
        <FormField label="Password" required error={errors.password?.message}>
          <PasswordInput autoComplete="current-password" placeholder="••••••••" className={inputClass} {...register("password")} />
        </FormField>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id={`${role}-remember`} defaultChecked onCheckedChange={(v) => setValue("remember", v === true)} className={cn(dark && "border-white/30")} />
            <Label htmlFor={`${role}-remember`} className="text-sm font-normal">Remember me</Label>
          </div>
          {forgotHref ? (
            <Link href={forgotHref} className={cn("text-sm font-semibold hover:underline", dark ? "text-white/80" : "text-primary")}>Forgot password?</Link>
          ) : (
            <button type="button" onClick={() => toast.info("Password reset is a preview feature", { description: "In production this would email a secure reset link." })} className={cn("text-sm font-semibold hover:underline", dark ? "text-white/80" : "text-primary")}>
              Forgot password?
            </button>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} role="alert" className={cn("flex gap-2.5 overflow-hidden rounded-xl p-3 text-sm", dark ? "bg-red-500/15 text-red-200" : "bg-destructive/10 text-destructive")}>
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <div>
                <p>{error.message}</p>
                {error.portal && (
                  <Link href={LOGIN_PATHS[error.portal]} className="mt-1 inline-flex items-center gap-1 font-semibold underline-offset-4 hover:underline">
                    Go to the {ROLE_NAMES[error.portal]} sign-in <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" disabled={submitting} className={cn("h-12 w-full rounded-xl text-base font-semibold", submitClassName)}>
          {submitting ? <><Loader2 className="animate-spin" /> Signing in…</> : "Sign in"}
        </Button>
      </form>

      <DemoCredentials role={role} onUse={useDemo} tone={tone} />
    </div>
  );
}
