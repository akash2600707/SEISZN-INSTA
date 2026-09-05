import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { slug } = await params;
  const product = db
    .prepare("SELECT * FROM products WHERE slug = ? AND active = 1")
    .get(slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ product: { ...product, sizes: JSON.parse(product.sizes) } });
}
