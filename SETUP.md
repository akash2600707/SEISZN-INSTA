# SEISZN setup

The production version uses **Supabase PostgreSQL** for persistent data and **Vercel** for the Next.js app.

See `SUPABASE_SETUP.md` for the exact production setup steps.

For local development:

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Run `supabase/schema.sql` once in the Supabase SQL Editor before logging in or adding products.
