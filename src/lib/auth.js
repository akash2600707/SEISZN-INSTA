import crypto from "crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me";

export function signSession(username) {
  const payload = `${username}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySession(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, ts, sig] = parts;
  const payload = `${username}.${ts}`;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  if (expected !== sig) return null;
  // 7 day expiry
  if (Date.now() - Number(ts) > 7 * 24 * 60 * 60 * 1000) return null;
  return { username };
}
