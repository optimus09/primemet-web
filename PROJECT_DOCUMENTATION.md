# Primemet Web — Project Documentation

This file is your master backup reference. If you ever lose this project folder,
give this file (plus the code zip and `supabase/full_schema.sql`) to Claude (or
any developer) and the whole site — front end, backend, and database — can be
rebuilt from scratch.

## What this is

A B2B web platform for **Primemet**, an industrial scrap-buying and spare-parts
supply business in Vadodara, Gujarat. It has:

- A public marketing site (landing page, product catalog, "Sell Your Scrap" form)
- Customer accounts (signup/login/password reset, order history)
- A shopping cart + checkout flow for spare parts
- A "Sell Your Scrap" request form with live-ish buying rates and subscription option
- A "Bulk Pricing" request flow (pick products + quantities, get a custom quote)
- A full admin/employee backend at `/admin` (orders, products, customers, analytics,
  scrap rates, site-wide feature toggles, admin management)

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions) — see
  `node_modules/next/dist/docs/` for this specific version's conventions; it uses
  `src/proxy.ts` instead of the older `middleware.ts`.
- **TypeScript**
- **Tailwind CSS v4** (CSS-variable based theme in `src/app/globals.css`)
- **Supabase** — Postgres database, Auth, Row-Level Security, REST API (via `@supabase/ssr`
  and `@supabase/supabase-js`)
- Deployed nowhere yet — currently runs only via `npm run dev` on localhost.

## Supabase project

- Project URL: `https://bhrnpuaucdxiadbgicvk.supabase.co`
- Publishable (anon) key: in `.env.local` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (safe to be public — it's the client-side key, protected by Row-Level Security)
- **To recreate the database from scratch**: run `supabase/full_schema.sql` in the
  Supabase SQL Editor. It's idempotent (safe to re-run) and creates every table,
  policy, and function currently in production, in the right order.
- Product catalog data (78 real products) is in `supabase/products_data.json`,
  extracted from the client's `PRODUCT MASTER LIST.xlsm`. Re-import via the admin
  Products page, or write a small script that POSTs each row to
  `/rest/v1/products` with the admin's auth token.

## Environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://bhrnpuaucdxiadbgicvk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Never commit `.env.local` — it's gitignored. Keep a copy of these two values
somewhere safe (e.g. a password manager) since they're needed to reconnect
the code to the database.

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Folder structure (key paths)

```
src/
  app/
    page.tsx                 — homepage
    catalog/                 — spare parts catalog (customer-facing)
    cart/                    — cart + checkout
    sell-scrap/               — scrap sell request form (+ live rates)
    bulk-quote/               — bulk pricing request (product picker + qty)
    login/, signup/, forgot-password/, reset-password/, account/
    orders/                  — customer's own order history
    admin/                   — the entire employee backend
      page.tsx                — dashboard
      analytics/               — top products/materials, page views
      orders/                  — manage all orders/quotes
      products/                — product CRUD
      customers/                — customer list + block/unblock
      admins/                  — admin management, invites, signup codes
      settings/                — all site-wide on/off toggles + scrap rates + categories
    api/admin/export/         — CSV / Zoho-format export endpoints
  components/                — Header, Footer, ProductCard, CategoryIcon, StatusBadge
  lib/
    supabase/                — client.ts (browser), server.ts (server), middleware.ts
    settings.ts               — reads site_settings/category_settings with safe defaults
    cart.tsx                  — client-side cart (localStorage-backed React context)
    checkBlocked.ts           — shared "is this customer blocked" check
  proxy.ts                   — Next.js 16's replacement for middleware.ts; handles
                                 auth session refresh + lightweight page-view logging
supabase/
  full_schema.sql            — canonical, run-from-scratch database schema (USE THIS)
  products_data.json         — extracted real product catalog
  *.sql (other files)        — historical migration scripts, kept for reference;
                                 full_schema.sql supersedes all of them
```

## Design system

Colors are CSS variables in `src/app/globals.css` under `:root`, mapped into
Tailwind via `@theme inline`. White background, navy (`--foreground`,
`--emerald-deep`), green (`--emerald-highlight`, `--teal-active`), and a muted
gold/bronze accent (`--gold`) — no black anywhere by design. Category icons
(`src/components/CategoryIcon.tsx`) are hand-drawn SVGs, not photos (avoids any
copyright risk from scraping competitor product photos).

## Known limitations / not yet done

1. **Not deployed** — only runs locally. Next step: deploy to Vercel, connect
   the `primemet.in` domain, add the production URL to Supabase's Auth →
   URL Configuration → Redirect URLs (same fix we needed for `localhost:3000`).
2. **No transactional email service** — password resets and signup confirmations
   use Supabase's built-in email sender, which has a very low free-tier rate
   limit (~3-4/hour). Fine for production usage patterns, but connecting Resend
   (or similar) would remove that ceiling and let signup-code emails send
   automatically instead of opening a mailto: draft.
3. **Zoho integration is CSV-only** — "Export to Zoho" produces a correctly
   formatted CSV for manual import. A live, automatic two-way sync would need
   a Zoho Developer Console app (OAuth credentials) that only the account owner
   can create.
4. **Supplier/customer master data** from the original Excel file were never
   imported (only the product catalog was) — ask if that's still wanted.
5. **GST certificate**: the footer GSTIN links to the official government
   verification portal (can't be auto-filled/auto-submitted — that page
   requires a manual CAPTCHA). If you want the actual certificate document
   shown on-site instead, send the PDF/image and it can be hosted directly.

## Admin accounts

Admin access is a `role = 'admin'` flag on a normal signed-up account — there's
no separate login system. To create the *first* admin on a fresh database,
run in the SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

(after that person has signed up normally at `/signup` at least once). Every
admin after that can be added from **Admin → Admins & Partners** without SQL —
either invite by email (auto-promotes on signup) or promote an existing
customer with one click.

## How to hand this back to an AI assistant later

Give it:
1. This file (`PROJECT_DOCUMENTATION.md`)
2. The full code zip
3. `supabase/full_schema.sql`
4. Your Supabase project URL + anon key (from `.env.local`)

That's everything needed to either continue developing the existing project,
or rebuild it from zero on a new Supabase project if the original is ever lost.
