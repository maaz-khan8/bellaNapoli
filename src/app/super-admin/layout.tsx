import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import { StaffIntlProvider } from "@/components/staff-intl-provider";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Super Admin · Bella Napoli", template: "%s · Super Admin" },
  robots: { index: false, follow: false },
};

export default function SuperAdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StaffIntlProvider>
          <Providers>{children}</Providers>
        </StaffIntlProvider>
      </body>
    </html>
  );
}
