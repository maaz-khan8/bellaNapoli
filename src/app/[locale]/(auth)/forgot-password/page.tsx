"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { forgotSchema } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const t = useTranslations("auth.forgot");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  return (
    <AnimatePresence mode="wait">
      {sentTo ? (
        <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center" role="status">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-basil-50 text-basil-600"><MailCheck className="size-8" aria-hidden="true" /></span>
          <h1 className="mt-6 font-display text-3xl font-semibold">{t("sentTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t.rich("sentBody", { email: sentTo, strong: (c) => <strong className="text-foreground">{c}</strong> })}</p>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{t.rich("demoNote", { code: (c) => <code className="font-semibold">{c}</code> })}</p>
          <Button asChild className="mt-8 h-12 w-full rounded-xl"><Link href="/login">{t("back")}</Link></Button>
        </motion.div>
      ) : (
        <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> {t("back")}
          </Link>
          <h1 className="font-display text-4xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 mb-8 text-muted-foreground">{t("subtitle")}</p>
          <form
            noValidate
            className="space-y-4"
            onSubmit={handleSubmit(async ({ email }) => {
              await new Promise((r) => setTimeout(r, 700));
              setSentTo(email);
            })}
          >
            <FormField label={t("email")} required error={errors.email?.message}>
              <Input type="email" autoComplete="email" placeholder="you@example.com" className="h-12 rounded-xl" {...register("email")} />
            </FormField>
            <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl text-base font-semibold">
              {isSubmitting ? <><Loader2 className="animate-spin" /> {t("sending")}</> : t("submit")}
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
