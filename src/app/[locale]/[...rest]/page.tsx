import { notFound } from "next/navigation";

/** Unknown paths inside a locale render the localized not-found page (with the site's <html>). */
export default function CatchAll() {
  notFound();
}
