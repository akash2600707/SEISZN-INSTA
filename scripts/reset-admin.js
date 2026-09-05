const crypto = require("crypto");

async function main() {
  const [username, password] = process.argv.slice(2);
  if (!username || !password) {
    console.error("Usage: node scripts/reset-admin.js <username> <new-password>");
    process.exit(1);
  }
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  const password_hash = `scrypt:${salt}:${derived}`;
  const { data: existing, error: lookupError } = await supabase.from("admins").select("id").eq("username", username).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) {
    const { error } = await supabase.from("admins").update({ password_hash }).eq("id", existing.id);
    if (error) throw error;
    console.log(`Password updated for admin "${username}".`);
  } else {
    const { error } = await supabase.from("admins").insert({ username, password_hash });
    if (error) throw error;
    console.log(`Admin "${username}" created.`);
  }
}
main().catch((err) => { console.error(err); process.exit(1); });
