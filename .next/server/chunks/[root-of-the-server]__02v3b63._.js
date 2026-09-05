module.exports=[85148,(e,r,t)=>{r.exports=e.x("better-sqlite3-90e2652d1716b047",()=>require("better-sqlite3-90e2652d1716b047"))},54799,(e,r,t)=>{r.exports=e.x("crypto",()=>require("crypto"))},22734,(e,r,t)=>{r.exports=e.x("fs",()=>require("fs"))},70406,(e,r,t)=>{r.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},18622,(e,r,t)=>{r.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},20635,(e,r,t)=>{r.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,r,t)=>{r.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},56704,(e,r,t)=>{r.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,r,t)=>{r.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},59043,(e,r,t)=>{r.exports=e.x("next/dist/server/runtime-reacts.external.js",()=>require("next/dist/server/runtime-reacts.external.js"))},93695,(e,r,t)=>{r.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},81111,(e,r,t)=>{r.exports=e.x("node:stream",()=>require("node:stream"))},14747,(e,r,t)=>{r.exports=e.x("path",()=>require("path"))},24361,(e,r,t)=>{r.exports=e.x("util",()=>require("util"))},79058,e=>{"use strict";var r=e.i(85148),t=e.i(14747),s=e.i(22734),a=e.i(54799);let i=t.default.join(process.cwd(),"data","seiszn.db");s.default.existsSync(t.default.dirname(i))||s.default.mkdirSync(t.default.dirname(i),{recursive:!0});let n=new r.default(i);function p(e){return a.default.createHash("sha256").update(e).digest("hex")}if(n.pragma("journal_mode = WAL"),n.exec(`
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
`),0===n.prepare("SELECT COUNT(*) as c FROM admins").get().c&&n.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run("admin",p("change-me-123")),0===n.prepare("SELECT COUNT(*) as c FROM products").get().c){let e=n.prepare("INSERT INTO products (slug, name, description, price, image_url) VALUES (@slug, @name, @description, @price, @image_url)");for(let r of[{slug:"aurora-wrap-dress",name:"Aurora Wrap Dress",description:"Flowy wrap dress in soft crepe, perfect for evenings out.",price:249900,image_url:"/products/placeholder1.svg"},{slug:"noor-linen-set",name:"Noor Linen Co-ord Set",description:"Breathable linen co-ord set for effortless daywear.",price:319900,image_url:"/products/placeholder2.svg"},{slug:"velez-satin-slip",name:"Velez Satin Slip Dress",description:"Bias-cut satin slip dress with a fluid, luxe drape.",price:289900,image_url:"/products/placeholder3.svg"}])e.run(r)}e.s(["default",0,n,"hashPw",0,function(e){return p(e)}])}];

//# sourceMappingURL=%5Broot-of-the-server%5D__02v3b63._.js.map