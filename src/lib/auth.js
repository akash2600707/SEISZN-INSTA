import crypto from "crypto";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Missing ADMIN_SESSION_SECRET environment variable");
  return secret;
}

export function signSession(username) {
  const payload = `${username}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySession(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [username, ts, sig] = parts;
  if (!/^\d+$/.test(ts) || !/^[a-f0-9]{64}$/i.test(sig)) return null;
  const payload = `${username}.${ts}`;
  const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex"))) return null;
  if (Date.now() - Number(ts) > 7 * 24 * 60 * 60 * 1000) return null;
  return { username };
}
