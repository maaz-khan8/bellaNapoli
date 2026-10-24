"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDemoData } from "@/lib/demo";

export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" role="alert" className="flex min-h-svh flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">{t("body")}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button className="h-11 rounded-full px-6" onClick={reset}>{t("retry")}</Button>
        <Button
          variant="outline"
          className="h-11 rounded-full px-6"
          onClick={() => {
            resetDemoData();
            reset();
          }}
        >
          <RotateCcw /> {t("reset")}
        </Button>
      </div>
    </main>
  );
}
