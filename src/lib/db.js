import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: "public" },
  });
}

export function hashPw(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPw(password, storedHash) {
  if (!storedHash) return false;
  if (!storedHash.startsWith("scrypt:")) {
    return crypto.createHash("sha256").update(password).digest("hex") === storedHash;
  }
  const [, salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function ensureAdminFromEnv() {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  const supabase = getSupabase();

  const { data: existing, error: lookupError } = await supabase
    .from("admins").select("id, username, password_hash").eq("username", username).maybeSingle();
  if (lookupError) throw lookupError;
  if (existing) return existing;

  const { data, error } = await supabase
    .from("admins").insert({ username, password_hash: hashPw(password) })
    .select("id, username, password_hash").single();
  if (error) throw error;
  return data;
}
