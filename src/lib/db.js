import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "seiszn.db");

if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- in paise
  image_url TEXT,
  sizes TEXT DEFAULT '["S","M","L"]', -- JSON array
  stock INTEGER DEFAULT 100,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON array of {slug, name, price, size, qty}
  subtotal INTEGER NOT NULL,
  status TEXT DEFAULT 'pending', -- pending -> paid -> shipped -> delivered / failed
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  shiprocket_tracking_id TEXT,
  shiprocket_courier TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
`);

// Seed a default admin (username: admin / password: change-me-123) if none exists
import crypto from "crypto";
function hashPassword(pw) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}
const adminCount = db.prepare("SELECT COUNT(*) as c FROM admins").get().c;
if (adminCount === 0) {
  db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(
    "admin",
    hashPassword("change-me-123")
  );
}

// Seed sample products if none exist
const productCount = db.prepare("SELECT COUNT(*) as c FROM products").get().c;
if (productCount === 0) {
  const sample = [
    {
      slug: "aurora-wrap-dress",
      name: "Aurora Wrap Dress",
      description: "Flowy wrap dress in soft crepe, perfect for evenings out.",
      price: 249900,
      image_url: "/products/placeholder1.svg",
    },
    {
      slug: "noor-linen-set",
      name: "Noor Linen Co-ord Set",
      description: "Breathable linen co-ord set for effortless daywear.",
      price: 319900,
      image_url: "/products/placeholder2.svg",
    },
    {
      slug: "velez-satin-slip",
      name: "Velez Satin Slip Dress",
      description: "Bias-cut satin slip dress with a fluid, luxe drape.",
      price: 289900,
      image_url: "/products/placeholder3.svg",
    },
  ];
  const insert = db.prepare(
    `INSERT INTO products (slug, name, description, price, image_url) VALUES (@slug, @name, @description, @price, @image_url)`
  );
  for (const p of sample) insert.run(p);
}

export function hashPw(pw) {
  return hashPassword(pw);
}

export default db;
