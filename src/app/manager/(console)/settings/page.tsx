"use client";

import { PageHeader } from "@/components/dashboard/primitives";
import { AccountPanel, DemoDataPanel, PreferencesPanel } from "@/components/dashboard/settings-sections";

export default function ManagerSettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your account, notifications and demo controls." />
      <div className="grid max-w-4xl gap-6">
        <AccountPanel role="manager" roleLabel="Restaurant Manager" />
        <PreferencesPanel
          items={[
            { id: "new-order", label: "New order alerts", hint: "Pop-up and sound when an order arrives", defaultOn: true },
            { id: "sms", label: "SMS for orders waiting 5+ minutes", hint: "Text the manager on duty", defaultOn: false },
            { id: "daily", label: "Daily sales summary email", hint: "Sent at closing time", defaultOn: true },
          ]}
        />
        <DemoDataPanel />
      </div>
    </>
  );
}
