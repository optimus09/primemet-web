# Primemet Web — Project Documentation

This file is your master backup reference. If you ever lose this project folder,
give this file (plus the code zip and `supabase/full_schema.sql`) to Claude (or
any developer) and the whole site — front end, backend, database, and
integrations — can be rebuilt from scratch.

## What this is

A B2B web platform for **Primemet**, an industrial scrap-buying and spare-parts
supply business in Vadodara, Gujarat, India (info@primemet.in, GSTIN
24ABJFP4844R1ZH). Live in production at **https://primemet.in**. It has:

- A public marketing site (landing page, product catalog, "Sell Your Scrap" form)
- Customer accounts (signup/login/password reset, order history)
- A shopping cart + checkout flow for spare parts
- A "Sell Your Scrap" request form with live-ish buying rates and subscription option
- A "Bulk Pricing" request flow (pick products + quantities, get a custom quote)
- A full admin/employee backend at `/admin` (orders, products, customers, analytics,
  scrap rates, site-wide feature toggles, admin management, homepage stats)
- **AI features** (Google Gemini): a floating chatbot ("Mate AI"), AI-powered
  drawing/BOM upload → auto-quote, and natural-language catalog search — all with
  a single admin on/off switch
- Automated email notifications (new orders/signups/scrap requests/bulk quotes)
  via MSG91 (India-based SMTP)

## Tech stack

- **Next.js 16** (App Router, Server Components, Server Actions) — see
  `node_modules/next/dist/docs/` for this specific version's conventions; it uses
  `src/proxy.ts` instead of the older `middleware.ts`.
- **TypeScript**
- **Tailwind CSS v4** (CSS-variable based theme in `src/app/globals.css`)
- **Supabase** — Postgres database, Auth, Row-Level Security, REST API (via `@supabase/ssr`
  and `@supabase/supabase-js`)
- **Vercel** — hosting, GitHub-integrated auto-deploy (push to `main` → live in ~1 min)
- **GoDaddy** — DNS for `primemet.in` (points at Vercel) and for the MSG91 mail
  subdomain `mail.primemet.in`
- **MSG91** — India-based SMTP relay for admin notification emails (nodemailer)
- **Google Gemini API** — powers all AI features (chat, drawing extraction, smart search)

## Supabase project

- Project URL: `https://bhrnpuaucdxiadbgicvk.supabase.co`
- Publishable (anon) key: in `.env.local` / Vercel env as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  (safe to be public — it's the client-side key, protected by Row-Level Security)
- **To recreate the database from scratch**: run `supabase/full_schema.sql` in the
  Supabase SQL Editor. It's idempotent (safe to re-run) and creates every table,
  policy, function, and default settings row currently in production, in the
  right order.
- Product catalog data (78 real products) is in `supabase/products_data.json`,
  extracted from the client's `PRODUCT MASTER LIST.xlsm`. Re-import via the admin
  Products page, or write a small script that POSTs each row to
  `/rest/v1/products` with the admin's auth token.

## Deployment (Vercel + GoDaddy)

- GitHub repo: `optimus09/primemet-web`, branch `main` — every push auto-deploys
  to production via Vercel's GitHub integration.
- Vercel project: `primemet-web` under team `optimus09s-projects`.
- Domain: `primemet.in` (apex) and `www.primemet.in`, both pointed at Vercel via
  GoDaddy DNS (A/CNAME records). Vercel redirects apex → `www` by convention.
- Supabase Auth → URL Configuration → Redirect URLs must include
  `https://primemet.in/**` **and** `https://www.primemet.in/**` (password
  reset links use whichever host the request came from).
- To add/change a production environment variable when the Vercel dashboard UI
  is being unreliable, call its internal API directly from an authenticated
  browser session:
  ```js
  fetch('https://vercel.com/api/v10/projects/<projectId>/env?teamId=<teamId>', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value, type: 'sensitive', target: ['production','preview'] })
  })
  ```

## Environment variables (`.env.local` and Vercel)

```
NEXT_PUBLIC_SUPABASE_URL=https://bhrnpuaucdxiadbgicvk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...

# MSG91 SMTP — admin email notifications (India-based, per business requirement)
SMTP_HOST=smtp.mailer91.com
SMTP_PORT=587
SMTP_USER=emailer@mail.primemet.in
SMTP_PASS=...
ADMIN_NOTIFY_EMAIL=info@primemet.in

# Google Gemini — powers Mate AI chatbot, AI Quote extraction, smart search
GEMINI_API_KEY=...
```

Never commit `.env.local` — it's gitignored. Keep a copy of these values
somewhere safe (e.g. a password manager) since they're needed to reconnect
the code to the database and integrations.

**Important constraint**: this business is India-only. All infrastructure
(hosting region, email/SMS providers) should stay India-based where possible —
this is why MSG91 (Indian SaaS) is used for email instead of a US-based
provider like Resend, even though MSG91 has occasionally had IP-blocklist
delivery hiccups that a global provider wouldn't.

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
    page.tsx                 — homepage (hero with rotating stats circle)
    catalog/                 — spare parts catalog (customer-facing) + AI smart search
    cart/                    — cart + checkout
    sell-scrap/               — scrap sell request form (+ live rates, material photos)
    bulk-quote/               — bulk pricing request (product picker + qty)
    ai-quote/                 — AI-powered drawing/BOM upload → auto-extracted quote
    chat/                     — Mate AI chatbot server action (Gemini)
    login/, signup/, forgot-password/, reset-password/, account/
    orders/                  — customer's own order history
    admin/                   — the entire employee backend
      page.tsx                — dashboard
      analytics/               — top products/materials, page views
      orders/                  — manage all orders/quotes
      products/                — product CRUD
      customers/                — customer list + block/unblock
      admins/                  — admin management, invites, signup codes
      settings/                — all site-wide on/off toggles, scrap rates,
                                   categories, homepage stats (add/edit/remove)
    api/admin/export/         — CSV / Zoho-format export endpoints
  components/                — Header, Footer, ProductCard, CategoryIcon,
                                 StatusBadge, Chatbot (Mate AI widget)
  lib/
    supabase/                — client.ts (browser), server.ts (server), middleware.ts
    settings.ts               — reads site_settings/category_settings with safe defaults
    cart.tsx                  — client-side cart (localStorage-backed React context)
    checkBlocked.ts           — shared "is this customer blocked" check
    notify.ts                 — MSG91/nodemailer admin email notifications
    gemini.ts                 — Google Gemini API wrapper (text, JSON, multimodal)
  proxy.ts                   — Next.js 16's replacement for middleware.ts; handles
                                 auth session refresh + lightweight page-view logging
public/
  primemet-logo-icon.png     — properly-padded transparent badge mark (use this
                                 for any new icon/avatar placement — it's the one
                                 that isn't cropped at the edges)
  photos/                     — Unsplash-sourced site photography (product,
                                 material, hero images)
supabase/
  full_schema.sql            — canonical, run-from-scratch database schema (USE THIS)
  products_data.json         — extracted real product catalog
  *.sql (other files)        — historical migration scripts, kept for reference;
                                 full_schema.sql supersedes all of them
```

## AI features (Google Gemini)

All three features share one admin toggle: **Admin → Settings → "Enable AI
Quote (drawing/BOM upload)"** (`site_settings.enable_ai_features`, default on).
When off: the AI Quote nav link/page disappear, Mate AI stops rendering, and
smart search silently falls back to normal category browsing. This lets you
pause AI usage/cost instantly without a deploy.

1. **Mate AI** (`src/components/Chatbot.tsx`, `src/app/chat/actions.ts`) — a
   floating chat widget, bottom-right on every page, branded with the Primemet
   logo. Shows clickable quick-question chips on open. Answers questions about
   what Primemet does, services, and how to get in touch, using a system prompt
   describing the business (`SYSTEM_CONTEXT` in `chat/actions.ts`).
2. **AI Quote** (`/ai-quote`, `src/app/ai-quote/`) — customer uploads a
   drawing/BOM/photo, Gemini extracts a parts list (multimodal + JSON mode) and
   matches it against the live product catalog, then pre-fills a bulk quote
   request for the customer to review/edit before submitting.
3. **Smart search** (`src/app/catalog/smartSearch.ts`) — natural-language
   product search on the catalog page (e.g. "something to cut a 4 inch steel
   pipe"), sends the query + catalog to Gemini, returns ranked matching product IDs.

**Gemini implementation notes** (`src/lib/gemini.ts`) if you ever touch this:
- Model in use: `gemini-3.5-flash` (older `gemini-2.5-*` models were
  deprecated/removed from new-user access; `gemini-flash-latest` was flaky for
  image+JSON combined requests).
- JSON-mode calls **must** set `thinkingConfig: { thinkingBudget: 0 }` —
  without it, "thinking" models can silently truncate the visible JSON output
  because they spend the token budget on invisible reasoning first.
- There's a defensive `parseJsonLoosely()` fallback parser (strips markdown
  fences, extracts the first balanced JSON block) in case a response still
  isn't clean JSON.

## Email notifications (MSG91)

`src/lib/notify.ts` sends an email to `ADMIN_NOTIFY_EMAIL` via MSG91 SMTP
(nodemailer) whenever a new order, signup, scrap request, or bulk quote is
created (wired into each relevant `actions.ts`). MSG91 was chosen over
Resend/Twilio/Gupshup specifically because **this business requires
India-based infrastructure** — do not swap this for a non-Indian provider
without checking with the business owner first. Known limitation: MSG91's
sending IPs have occasionally landed on the Spamhaus blocklist, causing
intermittent delivery failures to Outlook-hosted addresses — a support ticket
is open with MSG91 about this; it's a disclosed, accepted tradeoff for staying
India-based.

## Design system

Colors are CSS variables in `src/app/globals.css` under `:root`, mapped into
Tailwind via `@theme inline`. White background, navy (`--foreground`,
`--emerald-deep`), green (`--emerald-highlight`, `--teal-active`), and a muted
gold/bronze accent (`--gold`) — no black anywhere by design. Category icons
(`src/components/CategoryIcon.tsx`) are hand-drawn SVGs, not photos (avoids any
copyright risk from scraping competitor product photos). Site photography
under `public/photos/` is Unsplash-sourced with proper licensing — never
scraped/copyrighted content.

The homepage hero has a rotating stats display: one primary stat fixed in the
centre of a decorative ring, and up to 4 more stats slowly orbiting around it
(text stays upright throughout — implemented via a CSS counter-rotation trick
in `src/app/page.tsx`, using precomputed absolute SVG coordinates rather than
nested `transform` attributes, since mixing an SVG `transform` attribute with
a CSS animation on the same element causes browsers to drop the attribute
entirely). Manage these stats at **Admin → Settings → Homepage stats**
(add/edit/remove, up to 5 total).

## Known limitations / not yet done

1. **MSG91 delivery reliability** — see "Email notifications" above; a support
   ticket is open, no further code-side fix planned (switching providers would
   break the India-only infrastructure requirement).
2. **Zoho integration is CSV-only** — "Export to Zoho" produces a correctly
   formatted CSV for manual import. A live, automatic two-way sync would need
   a Zoho Developer Console app (OAuth credentials) that only the account owner
   can create.
3. **Supplier/customer master data** from the original Excel file were never
   imported (only the product catalog was) — ask if that's still wanted.
4. **GST certificate**: the footer GSTIN links to the official government
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
4. Your Supabase project URL + anon key, and (if continuing AI/email features)
   the `GEMINI_API_KEY` and MSG91 `SMTP_*` values — from `.env.local` or Vercel

That's everything needed to either continue developing the existing project,
or rebuild it from zero on a new Supabase project + Vercel deployment if the
original is ever lost.
