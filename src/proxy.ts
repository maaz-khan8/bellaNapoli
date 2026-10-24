import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Localize the customer website only — skip Next internals, files with an extension
  // (images, favicon…) and the English-only staff portals.
  matcher: ["/((?!api|_next|_vercel|manager|super-admin|.*\\..*).*)"],
};
