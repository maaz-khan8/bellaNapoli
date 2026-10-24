"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetDemoData } from "@/lib/demo";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" role="alert" className="flex min-h-svh flex-1 flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        An unexpected error occurred in the prototype. Try again — if it keeps happening, resetting the demo data usually fixes it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button className="h-11 rounded-full px-6" onClick={reset}>Try again</Button>
        <Button
          variant="outline"
          className="h-11 rounded-full px-6"
          onClick={() => {
            resetDemoData();
            reset();
          }}
        >
          <RotateCcw /> Reset demo data
        </Button>
      </div>
    </main>
  );
}
