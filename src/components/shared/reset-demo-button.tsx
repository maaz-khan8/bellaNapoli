"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { resetDemoData } from "@/lib/demo";

export function ResetDemoButton({
  variant = "outline",
  className,
  label = "Reset demo data",
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
  label?: string;
}) {
  return (
    <ConfirmDialog
      trigger={
        <Button variant={variant} className={className}>
          <RotateCcw /> {label}
        </Button>
      }
      title="Reset all demo data?"
      description="This restores the original menu, restaurant profile, customers and order history, clears the cart and removes demo registrations. Built-in demo logins stay signed in."
      confirmLabel="Reset demo"
      destructive
      onConfirm={() => {
        resetDemoData();
        toast.success("Demo data restored", { description: "Everything is back to its original state." });
      }}
    />
  );
}
