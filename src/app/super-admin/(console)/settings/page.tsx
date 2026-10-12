"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Panel } from "@/components/dashboard/primitives";
import { AccountPanel, DemoDataPanel, PreferencesPanel } from "@/components/dashboard/settings-sections";
import { FormField } from "@/components/shared/form-field";
import { useDataStore } from "@/store/data-store";

const schema = z.object({
  platformName: z.string().trim().min(2, "Enter a platform name"),
  supportEmail: z.string().trim().email("Enter a valid email"),
});
type Values = z.infer<typeof schema>;

function PlatformForm() {
  const platform = useDataStore((s) => s.platform);
  const updatePlatform = useDataStore((s) => s.updatePlatform);
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { platformName: platform.platformName, supportEmail: platform.supportEmail },
  });
  return (
    <Panel title="Platform settings">
      <form
        noValidate
        onSubmit={handleSubmit((v) => {
          updatePlatform(v);
          reset(v);
          toast.success("Platform settings saved");
        })}
        className="grid gap-4 sm:grid-cols-2"
      >
        <FormField label="Platform name" required error={errors.platformName?.message}><Input className="h-10" {...register("platformName")} /></FormField>
        <FormField label="Support email" required error={errors.supportEmail?.message}><Input type="email" className="h-10" {...register("supportEmail")} /></FormField>
        <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
          <Link href="/super-admin/commissions" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Commission rate: {platform.commissionRate}% <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Button type="submit" disabled={!isDirty} className="h-10"><Save /> Save</Button>
        </div>
      </form>
    </Panel>
  );
}

export default function AdminSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Platform configuration, your account and demo controls." />
      <div className="grid max-w-4xl gap-6">
        <AccountPanel role="admin" roleLabel="Super Admin" />
        <PlatformForm />
        <PreferencesPanel
          items={[
            { id: "new-restaurant", label: "Restaurant onboarding requests", hint: "Email when a restaurant applies to join", defaultOn: true },
            { id: "weekly", label: "Weekly platform report", hint: "Sales, commission and customer growth", defaultOn: true },
            { id: "alerts", label: "High cancellation alerts", hint: "When a restaurant cancels more than 10% of orders", defaultOn: false },
          ]}
        />
        <DemoDataPanel />
      </div>
    </>
  );
}
