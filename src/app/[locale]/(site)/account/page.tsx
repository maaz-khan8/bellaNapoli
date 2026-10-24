"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useFormat } from "@/hooks/use-format";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CalendarDays, Package, Receipt, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { OrderCard } from "@/components/site/order-card";
import { useCurrentCustomer } from "@/hooks/use-session";
import { useDataStore } from "@/store/data-store";
import { useAuthStore } from "@/store/auth-store";
import { profileSchema, type ProfileValues } from "@/lib/validation";
import { ACTIVE_STATUSES } from "@/lib/order-status";
import { isRevenueOrder } from "@/lib/metrics";

function ProfileForm({ initial, onSave }: { initial: ProfileValues; onSave: (v: ProfileValues) => void }) {
  const { register, handleSubmit, reset, formState: { errors, isDirty, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });
  const t = useTranslations("account.profile");
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (v) => {
        await new Promise((r) => setTimeout(r, 400));
        onSave(v);
        reset(v);
      })}
      className="grid gap-4 sm:grid-cols-2"
    >
      <FormField label={t("name")} required error={errors.name?.message} className="sm:col-span-2">
        <Input autoComplete="name" className="h-11 rounded-xl" {...register("name")} />
      </FormField>
      <FormField label={t("email")} required error={errors.email?.message}>
        <Input type="email" autoComplete="email" className="h-11 rounded-xl" {...register("email")} />
      </FormField>
      <FormField label={t("phone")} required error={errors.phone?.message}>
        <Input type="tel" autoComplete="tel" className="h-11 rounded-xl" {...register("phone")} />
      </FormField>
      <div className="flex justify-end sm:col-span-2">
        <Button type="submit" disabled={!isDirty || isSubmitting} className="h-11 rounded-full px-6"><Save /> {t("save")}</Button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  const customer = useCurrentCustomer();
  const allOrders = useDataStore((s) => s.orders);
  const updateCustomer = useDataStore((s) => s.updateCustomer);
  const updateSessionName = useAuthStore((s) => s.updateSessionName);
  const t = useTranslations("account");
  const f = useFormat();

  const orders = useMemo(
    () => allOrders.filter((o) => o.customerId === customer?.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [allOrders, customer?.id],
  );
  if (!customer) return null;

  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const spent = orders.filter(isRevenueOrder).reduce((s, o) => s + o.total, 0);
  const stats = [
    { icon: Package, label: t("stats.orders"), value: f.number(orders.length) },
    { icon: Receipt, label: t("stats.spent"), value: f.currency(spent) },
    { icon: CalendarDays, label: t("stats.since"), value: f.date(customer.joinedAt, { month: "short", year: "numeric" }) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
            <s.icon className="size-5 text-primary" aria-hidden="true" />
            <p className="mt-3 text-2xl font-bold tracking-tight">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <section aria-labelledby="active-heading">
          <h2 id="active-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative size-2.5 rounded-full bg-primary" /></span>
            {t("active", { count: active.length })}
          </h2>
          <div className="grid gap-4">{active.map((o) => <OrderCard key={o.id} order={o} />)}</div>
        </section>
      )}

      <section aria-labelledby="profile-heading" className="rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border sm:p-7">
        <h2 id="profile-heading" className="text-lg font-semibold">{t("personal")}</h2>
        <p className="mb-6 text-sm text-muted-foreground">{t("personalHint")}</p>
        <ProfileForm
          key={customer.id}
          initial={{ name: customer.name, email: customer.email, phone: customer.phone }}
          onSave={(v) => {
            updateCustomer(customer.id, v);
            updateSessionName("customer", v.name, v.email);
            toast.success(t("updated"));
          }}
        />
      </section>

      <section aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-heading" className="text-lg font-semibold">{t("recent")}</h2>
          <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{t("viewAll")} <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {orders.length ? (
          <div className="grid gap-4">{orders.filter((o) => !ACTIVE_STATUSES.includes(o.status)).slice(0, 2).map((o) => <OrderCard key={o.id} order={o} />)}</div>
        ) : (
          <p className="rounded-3xl bg-card p-8 text-center text-sm text-muted-foreground ring-1 ring-border">{t.rich("noOrders", { link: (c) => <Link href="/menu" className="font-semibold text-primary">{c}</Link> })}</p>
        )}
      </section>
    </div>
  );
}
