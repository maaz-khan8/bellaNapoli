"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { AuthErrorCode } from "@/store/auth-store";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { useAuthStore } from "@/store/auth-store";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { cn } from "@/lib/utils";

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  return score;
}
const STRENGTH = ["tooShort", "weak", "fair", "good", "strong"] as const;
const STRENGTH_COLOR = ["bg-charcoal-200", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-basil-500"];

function RegisterForm() {
  const router = useRouter();
  const t = useTranslations("auth.register");
  const tl = useTranslations("auth.login");
  const tv = useTranslations();
  const searchParams = useSearchParams();
  const registerAccount = useAuthStore((s) => s.register);
  const [error, setError] = useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const redirect = searchParams.get("redirect");

  const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", password: "", confirm: "", terms: false },
  });
  const password = useWatch({ control, name: "password" });
  const score = strength(password ?? "");

  const onSubmit = async (values: RegisterValues) => {
    setError(null);
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    const result = registerAccount(values);
    setSubmitting(false);
    if (!result.ok) return setError(result.code);
    toast.success(t("welcome", { name: values.name.split(" ")[0]! }), { description: t("welcomeBody") });
    router.replace(redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/account");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <FormField label={t("name")} required error={errors.name?.message}>
        <Input autoComplete="name" placeholder={t("namePlaceholder")} className="h-12 rounded-xl" {...register("name")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("email")} required error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@example.com" className="h-12 rounded-xl" {...register("email")} />
        </FormField>
        <FormField label={t("phone")} required error={errors.phone?.message}>
          <Input type="tel" autoComplete="tel" placeholder="(212) 555-0123" className="h-12 rounded-xl" {...register("phone")} />
        </FormField>
      </div>
      <FormField label={t("password")} required error={errors.password?.message} hint={t("passwordHint")}>
        <PasswordInput autoComplete="new-password" className="h-12 rounded-xl" {...register("password")} />
      </FormField>
      {password && (
        <div className="-mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= score ? STRENGTH_COLOR[score] : "bg-charcoal-100")} />)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t.rich("strength", { level: t(`strengthLevels.${STRENGTH[score]!}`), strong: (c) => <strong>{c}</strong> })}</p>
        </div>
      )}
      <FormField label={t("confirm")} required error={errors.confirm?.message}>
        <PasswordInput autoComplete="new-password" className="h-12 rounded-xl" {...register("confirm")} />
      </FormField>
      <div>
        <div className="flex items-start gap-2.5">
          <Checkbox id="terms" className="mt-0.5" aria-invalid={!!errors.terms} aria-describedby={errors.terms ? "terms-error" : undefined} onCheckedChange={(v) => setValue("terms", v === true, { shouldValidate: true })} />
          <Label htmlFor="terms" className="text-sm leading-snug font-normal text-muted-foreground">
            {t("terms")}
          </Label>
        </div>
        {errors.terms && <p id="terms-error" role="alert" className="mt-1.5 text-xs font-medium text-destructive">{tv(errors.terms.message as "validation.termsRequired")}</p>}
      </div>
      {error && (
        <p role="alert" className="flex gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {tl(`errors.${error}`)}
        </p>
      )}
      <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl text-base font-semibold">
        {submitting ? <><Loader2 className="animate-spin" /> {t("creating")}</> : t("submit")}
      </Button>
    </form>
  );
}

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      <div className="mt-5 mb-7 flex items-center gap-3 rounded-2xl bg-basil-50 p-3.5 text-sm text-basil-700">
        <Gift className="size-5 shrink-0" aria-hidden="true" /> {t.rich("perk", { strong: (c) => <strong>{c}</strong> })}
      </div>
      <Suspense>
        <RegisterForm />
      </Suspense>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        {t("already")} <Link href="/login" className="font-semibold text-primary hover:underline">{t("signIn")}</Link>
      </p>
    </>
  );
}
