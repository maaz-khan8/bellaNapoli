"use client";

import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { resetDemoData } from "@/lib/demo";

export function ResetDemoButton({
  variant = "outline",
  className,
  label,
}: {
  variant?: React.ComponentProps<typeof Button>["variant"];
  className?: string;
  label?: string;
}) {
  const t = useTranslations("demo");
  return (
    <ConfirmDialog
      trigger={
        <Button variant={variant} className={className}>
          <RotateCcw /> {label ?? t("reset")}
        </Button>
      }
      title={t("confirmTitle")}
      description={t("confirmBody")}
      confirmLabel={t("confirm")}
      destructive
      onConfirm={() => {
        resetDemoData();
        toast.success(t("done"), { description: t("doneBody") });
      }}
    />
  );
}
