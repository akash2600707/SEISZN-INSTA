/*
 * Import Shopify product + inventory CSV exports into Supabase.
 * Usage:
 *   node scripts/import-shopify.js products_export.csv [inventory_export.csv] [--overwrite]
 *
 * Requires SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.
 */
const fs = require("fs");
const { parse } = require("csv-parse/sync");

async function main() {
  const args = process.argv.slice(2);
  const overwrite = args.includes("--overwrite");
  const files = args.filter((a) => !a.startsWith("--"));
  const [productsPath, inventoryPath] = files;
  if (!productsPath) {
    console.error("Usage: node scripts/import-shopify.js <products_export.csv> [inventory_export.csv] [--overwrite]");
    process.exit(1);
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
  const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const productRows = parse(fs.readFileSync(productsPath, "utf-8"), { columns: true, skip_empty_lines: true });
  const inventoryRows = inventoryPath && fs.existsSync(inventoryPath) ? parse(fs.readFileSync(inventoryPath, "utf-8"), { columns: true, skip_empty_lines: true }) : [];

  const stockByHandle = {};
  for (const row of inventoryRows) {
    const handle = row["Handle"];
    const available = parseInt(row["Available (not editable)"], 10) || 0;
    stockByHandle[handle] = (stockByHandle[handle] || 0) + available;
  }
  const byHandle = {};
  for (const row of productRows) {
    if (!row["Handle"]) continue;
    (byHandle[row["Handle"]] ||= []).push(row);
  }

  let created = 0, updated = 0, skipped = 0;
  const warnings = [];
  for (const [handle, rows] of Object.entries(byHandle)) {
    const first = rows.find((r) => r["Title"]) || rows[0];
    if (!first["Title"]) { skipped++; continue; }
    const labels = [...new Set(rows.map((r) => [r["Option1 Value"], r["Option2 Value"], r["Option3 Value"]].filter((v) => v && v.trim()).join(" / ")).filter(Boolean))];
    if (!labels.length) labels.push("Default");
    const prices = [...new Set(rows.map((r) => r["Variant Price"]).filter(Boolean))];
    if (prices.length > 1) warnings.push(`${slugify(handle)} has variant prices: ${prices.join(", ")}`);
    const imageRow = rows.find((r) => r["Image Src"]);
    const record = {
      slug: slugify(handle), name: first["Title"], description: stripHtml(first["Body (HTML)"]),
      price: Math.round(parseFloat(prices[0] || "0") * 100), image_url: imageRow ? imageRow["Image Src"] : "",
      sizes: labels, stock: stockByHandle[handle] !== undefined ? stockByHandle[handle] : rows.reduce((s, r) => s + (parseInt(r["Variant Inventory Qty"], 10) || 0), 0),
      active: (first["Status"] || "").toLowerCase() === "active",
    };

    const { data: existing, error: lookupError } = await supabase.from("products").select("id").eq("slug", record.slug).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
      if (overwrite) {
        const { error } = await supabase.from("products").update(record).eq("id", existing.id);
        if (error) throw error;
        updated++;
      } else skipped++;
    } else {
      const { error } = await supabase.from("products").insert(record);
      if (error) throw error;
      created++;
    }
  }

  console.log(`Import complete: ${created} created, ${updated} updated, ${skipped} skipped.`);
  if (warnings.length) console.log(`\nReview variant pricing:\n- ${warnings.join("\n- ")}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
