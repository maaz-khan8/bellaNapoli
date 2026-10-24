# Bella Napoli Pizza — Interactive UI Prototype

A **frontend-only**, fully interactive prototype of a pizza ordering platform, built for client UI/UX approval.
There is **no backend, database, API, real authentication or payment**. Everything runs in the browser with
mock data, Zustand state and `localStorage`.

It contains three interfaces for one restaurant (Bella Napoli Pizza):

| Interface | Entry point | Who it's for |
|---|---|---|
| Customer website | `/` | Customers browse, customise, order and track |
| Restaurant Manager console | `/manager/login` | Bella Napoli staff run orders, menu and profile |
| Super Admin console | `/super-admin/login` | Our company (the "Crustline" platform) monitors the restaurant |

---

## Quick start

Requirements: **Node.js 20+** (tested on Node 22) and npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Other scripts: `npm run lint`.

> Food photography loads from `images.unsplash.com` and fonts from Google Fonts, so an internet
> connection is needed for the full visual experience.

## Demo credentials

| Role | Login page | Email | Password |
|---|---|---|---|
| Customer | `/login` | `customer@demo.com` | `Demo123!` |
| Restaurant Manager | `/manager/login` | `manager@demo.com` | `Demo123!` |
| Super Admin | `/super-admin/login` | `admin@demo.com` | `Demo123!` |

Every login page has a **"Use"** button that fills in and submits the demo account. Customers can also
register a new demo account at `/register`.

Each role keeps its own session, so all three can be signed in at once in the same browser, each in its own tab.

---

## Client demonstration walkthrough (~10 minutes)

**Tip:** open three tabs in the same browser: customer, manager and admin. Changes sync between tabs
instantly with no reload. Use **Reset demo data** (site footer, or Settings in either console) before presenting.

1. **Homepage** (`/`): the animated hero slider (swipe, arrows, pause button), categories, featured pizzas,
   promos, story, reviews, hours and delivery info.
2. **Menu** (`/menu`): search for "truffle", filter by category, sort by price, toggle "Available now".
   *Ricotta & Wild Greens* is shown as sold out.
3. **Customise a pizza**: open *Margherita Classica*, choose **Large**, add toppings, increase the quantity, and watch
   the pizza visual resize and the price update live. Add it to the cart.
4. **Cart**: open the cart drawer (or the sticky bottom bar on mobile). Change quantities, switch delivery/pickup,
   and apply **WELCOME10** or **PIZZA20**. The free-delivery progress bar updates as you go.
5. **Checkout requires login**: click *Checkout* and you're redirected to `/login`. Click **Use** on the demo account
   and you come straight back to checkout with the cart intact.
6. **Place the order**: details are pre-filled. Choose an address and **Cash on Delivery** (card options are shown as
   "Coming soon"), then place the order. The confirmation shows the order number, ETA and a "Demo transaction" label.
7. **Track the order**: click *Track order* and leave this tab open.
8. **Manager tab** (`/manager/login` → Use): the new order shows up in the **live kitchen queue**. If the manager tab
   is already open when an order is placed, a "New order" notification also pops up. Click **Accept order**,
   then **Start preparing**.
9. **Back to the customer tab**: the timeline now reads **Preparing**, with no refresh.
10. **Admin tab** (`/super-admin/login` → Use): **Orders** lists the same order with the same status. Open it to see the
    platform commission for that order.
11. **Manager**: **Send out for delivery** → **Mark completed**. The customer tab and the admin list both show
    **Completed**, and dashboard metrics (today's revenue, completed count, best-sellers) update.
12. **Menu sync**: in *Manager → Menu*, switch a product off. It shows "Sold out today" on the customer site.
    Edit a price or add a product, and it appears on the menu immediately.
13. **Platform control**: in *Admin → Restaurant*, deactivate Bella Napoli. The customer site banner and checkout
    block it, and the manager console shows a deactivation notice. Reactivate it afterwards.
14. **Commission**: in *Admin → Commissions*, change the rate (e.g. 15%). All dashboards and reports recalculate. Export a CSV
    from *Reports*.

---

## What's implemented

### Customer website
Home (hero slider, categories, featured, promos, best-sellers carousel, story, how it works, testimonials,
hours/delivery/contact) · menu with search/filter/sort/availability · product page with size, crust, toppings,
add-ons, quantity, notes and live pricing · cart drawer, cart page and sticky mobile cart · promo codes ·
login-gated checkout with validation · order confirmation · live order tracking with cancel (while pending) and reorder ·
account profile, saved addresses (CRUD, default address) and order history · register, login and forgot password.

### Restaurant Manager (`/manager/*`)
Dashboard (today's KPIs vs yesterday, 14-day sales chart, live kanban kitchen queue, recent orders, best-sellers,
store status) · order management (status tabs, search, type/date filters, details sheet, accept/reject with reason,
advance status, cancel) · menu management (product CRUD with sizes, toppings, add-ons, image library or upload,
featured/bestseller/availability, duplicate; toppings and add-ons CRUD) · category management (CRUD, reorder,
show/hide) · restaurant profile (details, logo/cover, contact, opening hours, delivery and pickup settings,
accepting-orders toggle) · sales analytics (daily/weekly/monthly, date ranges, best-sellers, busiest hours,
category revenue, delivery vs pickup, CSV export) · settings.

### Super Admin (`/super-admin/*`)
Platform overview (customers, orders, GMV, commission, restaurant earnings, active customers, sales split chart,
customer activity, restaurant performance, recent orders) · restaurant management (profile, operational, approval
and platform status, activate/deactivate, sales performance, order summary) · customers (search, filter,
details with order history, activate/deactivate, CSV) · all orders (read-only details with commission) ·
commission management (configurable rate with preview, split chart, period summary) · reports (sales, orders,
customers, commission, with CSV export) · settings.

### Rules that keep every screen consistent
- **Revenue / GMV** = the sum of order totals for every order that is not cancelled or rejected.
- **Platform commission** = GMV × commission rate (default 12%). **Restaurant earnings** = GMV − commission.
- Cart, checkout, order creation and seed data all use one `computeTotals()` in `src/lib/pricing.ts`.
- All dashboards use the shared functions in `src/lib/metrics.ts`.

---

## Architecture

```
src/
  app/
    (site)/            Customer website (shared header, footer, cart drawer)
    (auth)/            Customer login / register / forgot password (split-screen layout)
    manager/login      Manager login (no sidebar)
    manager/(console)/ Manager console (RoleGuard + sidebar shell)
    super-admin/login  Super Admin login (no sidebar)
    super-admin/(console)/
  components/
    ui/                shadcn/ui primitives (Radix)
    site/              Customer-facing components
    dashboard/         Shared dashboard system: shell, KPI cards, charts, orders table, sheets
    shared/            Cross-cutting: status badge, timeline, form field, empty states…
    auth/              RoleGuard, login form, demo credentials helper
  lib/
    types.ts           Domain models (User, Customer, Restaurant, Product, Order, Promotion, Commission…)
    config/restaurant  Single restaurant branding and business configuration
    mock/              Catalog and deterministic seed generator (30 customers, ~90 days of orders)
    pricing.ts         Single source of truth for prices and totals
    metrics.ts         Single source of truth for analytics
    validation.ts      Zod schemas
  store/
    data-store.ts      Restaurant, menu, customers, orders, platform settings (persisted)
    auth-store.ts      Simulated per-role sessions (persisted)
    cart-store.ts      Cart (persisted)
    ui-store.ts        Ephemeral UI state (hydration flag, cart drawer)
  hooks/               useSession, useCartTotals, useCatalog, useAddToCart, useReorder, useNow…
```

**State and persistence.** Zustand stores persist to `localStorage` under the keys `bella-napoli:data`,
`bella-napoli:auth` and `bella-napoli:cart`. Stores use `skipHydration`. `<Providers>` rehydrates them after mount,
so the server render and the first client render match, which avoids hydration mismatches. A `storage` event
listener re-hydrates when another tab writes, which is what makes the cross-tab demo live.

**Always-current demo data.** Seed orders are generated relative to "now". When the prototype is opened more
than 6 hours after seeding, the timeline shifts forward, so "today" always has activity.

**Laravel integration later.** Screens read and write only through the store actions (`createOrder`,
`updateOrderStatus`, `saveProduct`, …) and the typed models in `lib/types.ts`. To integrate a real backend, swap
those actions for API calls (e.g. via TanStack Query) and replace `auth-store` with real auth (e.g. Sanctum).
The UI components shouldn't need to change.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict) · Tailwind CSS v4 ·
shadcn/ui (Radix) · Motion · Lucide · Zustand · React Hook Form + Zod · Recharts · next-intl.

## Languages (i18n)

The customer website is available in **German (default), English and Turkish**, built with
[next-intl](https://next-intl.dev). Switch languages from the dropdown at the top right of the header (also on
the sign-in pages and in the footer).

| Language | URL | Notes |
|---|---|---|
| Deutsch (default) | `/`, `/menu`, `/checkout` … | Always the default — browser language is not auto-detected |
| English | `/en`, `/en/menu` … | |
| Türkçe | `/tr`, `/tr/menu` … | |

`/de/...` redirects to the clean root URL. Each language page sets `<html lang>`, a translated `<title>`
and `hreflang` alternates, and is pre-rendered statically. Switching languages keeps you on the same page
(including filters such as `?category=deals`) and keeps your cart and sign-in.

The **Restaurant Manager and Super Admin consoles stay in English** (internal tools); they are excluded
from locale routing.

**Where things live**

```
messages/de.json, en.json, tr.json   UI text, one file per language (en.json is the type source)
src/i18n/routing.ts                  locales, default locale, URL strategy
src/i18n/navigation.ts               locale-aware Link / useRouter / usePathname
src/i18n/request.ts                  loads the right messages per request
src/proxy.ts                         locale routing (Next 16 "proxy", formerly middleware)
src/hooks/use-format.ts              prices, numbers and dates in the active language
src/hooks/use-content.ts             translated menu content (see below)
```

- **Type-safe keys:** `messages/en.json` types every `t("…")` call, so a missing or misspelled key fails
  `tsc`. German and Turkish must contain exactly the same keys.
- **Menu content** (dish names and descriptions, categories, crusts, toppings, promos, reviews) is
  translated under the `content` section of `de.json` / `tr.json`. If the manager edits an item in the
  dashboard, the edited text is shown as written in every language. With a real backend, this content
  would come per language from the API instead.
- **Validation messages** in Zod schemas are translation keys (e.g. `validation.emailInvalid`), resolved by
  `<FormField>`.

**Adding a language:** add its code to `locales` in `src/i18n/routing.ts` (plus a label in
`LOCALE_LABELS`), copy `messages/en.json` to `messages/<code>.json` and translate it, add a `content`
section for menu items, and add the locale tag in `src/hooks/use-format.ts`.

## Accessibility and responsiveness

Built toward WCAG 2.2 AA: semantic landmarks and skip link, labelled forms with announced errors
(`aria-invalid` / `aria-describedby`), keyboard-operable controls with visible focus, touch targets of 44px or more on the
customer site, status shown as icon plus text (never colour alone), a hero slider with a pause control and
`prefers-reduced-motion` support (no autoplay, reduced animation), and screen-reader data tables behind every chart.
Layouts were checked for horizontal overflow at 375, 768, 1024 and 1440px.

## Prototype limitations (by design)

- Data lives in one browser's `localStorage`. Other browsers and devices don't share it.
- Authentication and role protection are UI simulations, not security. Demo passwords exist only in source code.
  Self-registered accounts store a non-reversible demo hash, never the password.
- Payments, emails, SMS and notifications are not sent. Preview-only features are labelled "Preview" or "Coming soon".
- Uploaded images are resized and stored as data URLs in `localStorage` (keep them small).
