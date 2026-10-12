"use client";

import { useState } from "react";
import Link from "next/link";
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  return (
    <AnimatePresence mode="wait">
      {sentTo ? (
        <motion.div key="sent" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center" role="status">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-basil-50 text-basil-600"><MailCheck className="size-8" aria-hidden="true" /></span>
          <h1 className="mt-6 font-display text-3xl font-semibold">Check your inbox</h1>
          <p className="mt-3 text-muted-foreground">If an account exists for <strong className="text-foreground">{sentTo}</strong>, we&apos;d send a reset link.</p>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Demo mode: no email is actually sent. Use the demo password <code className="font-semibold">Demo123!</code> to sign in.</p>
          <Button asChild className="mt-8 h-12 w-full rounded-xl"><Link href="/login">Back to sign in</Link></Button>
        </motion.div>
      ) : (
        <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          <Link href="/login" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" /> Back to sign in
          </Link>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Forgot your password?</h1>
          <p className="mt-2 mb-8 text-muted-foreground">Enter the email you signed up with and we&apos;ll send you a reset link.</p>
          <form
            noValidate
            className="space-y-4"
            onSubmit={handleSubmit(async ({ email }) => {
              await new Promise((r) => setTimeout(r, 700));
              setSentTo(email);
            })}
          >
            <FormField label="Email address" required error={errors.email?.message}>
              <Input type="email" autoComplete="email" placeholder="you@example.com" className="h-12 rounded-xl" {...register("email")} />
            </FormField>
            <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-xl text-base font-semibold">
              {isSubmitting ? <><Loader2 className="animate-spin" /> Sending…</> : "Send reset link"}
            </Button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
