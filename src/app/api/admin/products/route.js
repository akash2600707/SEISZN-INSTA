import db from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function GET(req) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const products = db.prepare("SELECT * FROM products ORDER BY created_at DESC").all();
  return NextResponse.json({ products });
}

export async function POST(req) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const body = await req.json();
  const { slug, name, description, price, image_url, sizes, stock } = body;
  if (!slug || !name || !price) {
    return NextResponse.json({ error: "slug, name, price required" }, { status: 400 });
  }
  try {
    db.prepare(
      `INSERT INTO products (slug, name, description, price, image_url, sizes, stock)
       VALUES (@slug, @name, @description, @price, @image_url, @sizes, @stock)`
    ).run({
      slug,
      name,
      description: description || "",
      price: Math.round(Number(price)),
      image_url: image_url || "",
      sizes: JSON.stringify(sizes || ["S", "M", "L"]),
      stock: stock ?? 100,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Slug already exists or invalid data" }, { status: 400 });
  }
}
