# Seiszn — E-commerce Site

Next.js app with SQLite. Products → Cart → Razorpay checkout → order tracking,
no mandatory signup — matches the Instagram-first flow (link in bio → browse →
buy → SMS/email + track by order ID).

## Setup

```bash
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — get these from
  https://dashboard.razorpay.com/app/keys (use test keys first)
- `ADMIN_SESSION_SECRET` — any long random string

```bash
npm run dev
```

Visit http://localhost:3000. A SQLite DB is created automatically at
`data/seiszn.db` with 3 sample products and one admin account seeded:

- **Admin login**: http://localhost:3000/admin — username `admin`, password
  `change-me-123`. Change this immediately (see below).

## Day-to-day use

- **Add/edit products**: `/admin` → Products tab. Set slug, name, price (in ₹),
  description, image URL.
- **Fulfil an order**: `/admin` → Orders tab. Once you've shipped via
  Shiprocket, paste the tracking ID + courier and hit "Save & Mark Shipped" —
  this flips the order to "shipped" and is where you'd trigger the SMS/email
  (see below). Mark "Delivered" once Shiprocket confirms delivery.
- **Customer tracks their order**: `/track-order` — order ID + phone number,
  no login.

## Wiring up SMS/email notifications

Right now `src/lib/notify.js` just logs to the console when an order is paid
or shipped. To send real messages, pick a provider and fill in the commented
example code there:

- **Email**: Resend (https://resend.com) is the simplest to set up — sign up,
  verify your domain, add `RESEND_API_KEY` to `.env.local`, uncomment the
  Resend block in `notify.js`.
- **SMS**: MSG91 (https://msg91.com) or Twilio both work well for Indian
  numbers — add your key, uncomment the matching block.

## Changing / resetting the admin password

If login isn't working (e.g. "Invalid credentials" even with the default),
reset it directly:

```bash
node scripts/reset-admin.js admin your-new-password
```

Run this from the project root, with the app stopped or running (both fine).
It updates the password in `data/seiszn.db` — or creates the admin account if
it doesn't exist yet. Restart the app after.

## Importing your Shopify product export

If you're migrating from Shopify, you can bulk-import your existing catalog
from a Shopify products export CSV (and optionally an inventory export CSV
for stock counts):

```bash
node scripts/import-shopify.js /path/to/products_export.csv /path/to/inventory_export.csv
```

What it does:
- Groups Shopify's per-variant rows into one product per Handle
- Combines Color/Size variant options into a single selector (e.g.
  "Dusty Mauve / M")
- Uses the first variant's price and main image for the product
- Sums stock from the inventory export (or from the products export if you
  don't pass an inventory file)
- Strips HTML from the description
- Skips products that already exist (matched by slug) — pass `--overwrite`
  to update them instead

Run this **before** starting the app for the first time on a fresh database,
otherwise 3 sample placeholder products will already be seeded — if that
happens, just delete them from `/admin` → Products afterward.

If a product had different prices across its variants (e.g. price varies by
size), the import uses the first price it finds and prints a warning listing
which products to double check in `/admin`.

## Deploying

This is a plain Next.js app — deploys to Vercel, Netlify, or any Node host.

**Important**: SQLite writes to a local file (`data/seiszn.db`), which does
**not** persist on serverless platforms like Vercel (each request may hit a
fresh, ephemeral filesystem). For production:

- Easiest: deploy to a platform with a persistent disk (e.g. a small VPS,
  Railway, Render with a persistent volume) — SQLite works fine there.
- Or: swap SQLite for a hosted Postgres (Vercel Postgres, Neon, Supabase) if
  you want to deploy to Vercel — this means changing `src/lib/db.js` to use
  a Postgres client instead of `better-sqlite3`, but the rest of the app
  (API routes, pages) stays the same.

## Payments note

Order totals are always recalculated server-side from the database at
checkout — the app never trusts a price sent from the browser, so someone
can't tamper with the price before paying.

## What's not included

- Real email/SMS sending (needs your provider keys — see above)
- Automatic Shiprocket API integration (tracking ID is entered manually in
  admin for now — Shiprocket does have an API if you want to automate this
  later)
- Discount codes, inventory alerts, analytics — happy to add any of these
  next if useful
