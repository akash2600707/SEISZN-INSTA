/*
 * Reset (or create) an admin login for the Seiszn app.
 *
 * Usage:
 *   node scripts/reset-admin.js <username> <new-password>
 *
 * Example:
 *   node scripts/reset-admin.js admin my-new-password-123
 */
const path = require("path");
const crypto = require("crypto");
const Database = require("better-sqlite3");

const [username, password] = process.argv.slice(2);

if (!username || !password) {
  console.error("Usage: node scripts/reset-admin.js <username> <new-password>");
  process.exit(1);
}

function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

const db = new Database(path.join(process.cwd(), "data", "seiszn.db"));
db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
`);

const existing = db.prepare("SELECT id FROM admins WHERE username = ?").get(username);
const hash = hashPassword(password);

if (existing) {
  db.prepare("UPDATE admins SET password_hash = ? WHERE username = ?").run(hash, username);
  console.log(`Password updated for admin "${username}".`);
} else {
  db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(username, hash);
  console.log(`Admin "${username}" created.`);
}
