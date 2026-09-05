/*
 * Import Shopify product + inventory CSV exports into the Seiszn SQLite DB.
 *
 * Usage:
 *   node scripts/import-shopify.js /path/to/products_export.csv /path/to/inventory_export.csv
 *
 * - Groups Shopify's per-variant rows by Handle into one product per handle.
 * - Combines Color/Size options into a single "sizes" selector (e.g. "Dusty Mauve / M").
 * - Sums stock across variants from the inventory export (falls back to the
 *   products export's Variant Inventory Qty if no inventory file is given).
 * - Uses the first variant's price and image as the product's price/image.
 * - Strips HTML from the description.
 * - Skips products that already exist (matched by slug) unless --overwrite is passed.
 */
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const Database = require("better-sqlite3");

const args = process.argv.slice(2);
const overwrite = args.includes("--overwrite");
const files = args.filter((a) => !a.startsWith("--"));
const [productsPath, inventoryPath] = files;

if (!productsPath) {
  console.error("Usage: node scripts/import-shopify.js <products_export.csv> [inventory_export.csv] [--overwrite]");
  process.exit(1);
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const productsCsv = fs.readFileSync(productsPath, "utf-8");
const productRows = parse(productsCsv, { columns: true, skip_empty_lines: true });

let inventoryRows = [];
if (inventoryPath && fs.existsSync(inventoryPath)) {
  const inventoryCsv = fs.readFileSync(inventoryPath, "utf-8");
  inventoryRows = parse(inventoryCsv, { columns: true, skip_empty_lines: true });
}

// Sum "Available" stock per handle from the inventory export
const stockByHandle = {};
for (const row of inventoryRows) {
  const handle = row["Handle"];
  const available = parseInt(row["Available (not editable)"], 10) || 0;
  stockByHandle[handle] = (stockByHandle[handle] || 0) + available;
}

// Group product rows by Handle
const byHandle = {};
for (const row of productRows) {
  const handle = row["Handle"];
  if (!handle) continue;
  if (!byHandle[handle]) byHandle[handle] = [];
  byHandle[handle].push(row);
}

const db = new Database(path.join(process.cwd(), "data", "seiszn.db"));

const insertStmt = db.prepare(
  `INSERT INTO products (slug, name, description, price, image_url, sizes, stock, active)
   VALUES (@slug, @name, @description, @price, @image_url, @sizes, @stock, @active)`
);
const updateStmt = db.prepare(
  `UPDATE products SET name=@name, description=@description, price=@price, image_url=@image_url, sizes=@sizes, stock=@stock, active=@active WHERE slug=@slug`
);
const existsStmt = db.prepare("SELECT id FROM products WHERE slug = ?");

let created = 0;
let updated = 0;
let skipped = 0;
const multiPriceWarnings = [];

for (const [handle, rows] of Object.entries(byHandle)) {
  const first = rows.find((r) => r["Title"]) || rows[0];
  const name = first["Title"];
  if (!name) {
    skipped++;
    continue;
  }
  const slug = slugify(handle);
  const description = stripHtml(first["Body (HTML)"]);

  // Collect option labels across all variant rows for this handle
  const labels = rows
    .map((r) => {
      const parts = [r["Option1 Value"], r["Option2 Value"], r["Option3 Value"]].filter(
        (v) => v && v.trim()
      );
      return parts.join(" / ");
    })
    .filter((v) => v);
  const sizes = [...new Set(labels)];
  if (sizes.length === 0) sizes.push("Default");

  // Price: use the first non-empty variant price found; warn if variants differ
  const prices = [...new Set(rows.map((r) => r["Variant Price"]).filter((p) => p))];
  if (prices.length > 1) {
    multiPriceWarnings.push(`${slug} (prices: ${prices.join(", ")}) — used ${prices[0]}, review in admin`);
  }
  const price = Math.round(parseFloat(prices[0] || "0") * 100);

  // Image: first row with a non-empty Image Src
  const imageRow = rows.find((r) => r["Image Src"]);
  const image_url = imageRow ? imageRow["Image Src"] : "";

  // Stock: prefer inventory export sum, fall back to summed Variant Inventory Qty
  const stock =
    stockByHandle[handle] !== undefined
      ? stockByHandle[handle]
      : rows.reduce((sum, r) => sum + (parseInt(r["Variant Inventory Qty"], 10) || 0), 0);

  const active = (first["Status"] || "").toLowerCase() === "active" ? 1 : 0;

  const record = { slug, name, description, price, image_url, sizes: JSON.stringify(sizes), stock, active };

  const existing = existsStmt.get(slug);
  if (existing) {
    if (overwrite) {
      updateStmt.run(record);
      updated++;
    } else {
      skipped++;
    }
  } else {
    insertStmt.run(record);
    created++;
  }
}

console.log(`\nImport complete: ${created} created, ${updated} updated, ${skipped} skipped.`);
if (multiPriceWarnings.length) {
  console.log(`\n${multiPriceWarnings.length} product(s) had variants with different prices — only the first price was used, review these in /admin:`);
  multiPriceWarnings.forEach((w) => console.log(`  - ${w}`));
}
console.log("\nDone. Restart the app (or refresh) to see the imported products.");
