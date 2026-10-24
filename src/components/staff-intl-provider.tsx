"use client";

import { NextIntlClientProvider } from "next-intl";
import messages from "../../messages/en.json";

/** The staff portals are English-only; shared components still read translations. */
export function StaffIntlProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages} timeZone="Europe/Berlin">
      {children}
    </NextIntlClientProvider>
  );
}
