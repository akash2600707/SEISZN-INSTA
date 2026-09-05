# SEISZN — Supabase + Vercel setup

1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. Add the following Vercel environment variables for Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
3. Redeploy Vercel.
4. The first login creates the configured admin if that username does not exist.

To reset the admin later:
`node scripts/reset-admin.js admin 'your-new-password'`
with the Supabase variables available in the shell.

Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code or put it in a `NEXT_PUBLIC_*` variable.
