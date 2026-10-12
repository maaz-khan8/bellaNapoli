import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { PageLoader } from "@/components/shared/page-loader";

export const metadata: Metadata = { title: "Sign in" };

export default function CustomerLoginPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Sign in to order, track deliveries and reorder your favourites.</p>
      <Suspense fallback={<PageLoader className="min-h-60" />}>
        <LoginForm role="customer" forgotHref="/forgot-password" />
      </Suspense>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to Bella Napoli?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">Create an account</Link>
      </p>
    </>
  );
}
