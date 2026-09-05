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

## Changing the admin password

The default admin password is `change-me-123`. To change it, open
`data/seiszn.db` with any SQLite tool (e.g. `sqlite3 data/seiszn.db` or
DB Browser for SQLite) and run:

```sql
UPDATE admins SET password_hash = '<sha256 hex of new password>' WHERE username = 'admin';
```

Or ask Claude to add a "change password" admin page if you'd rather do it
through the UI.

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
