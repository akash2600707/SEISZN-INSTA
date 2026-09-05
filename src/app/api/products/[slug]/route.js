import { getProductBySlug, parseProduct } from "@/lib/db-helpers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug, true);
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ product: parseProduct(product) });
  } catch (err) {
    console.error("Product GET error:", err);
    return NextResponse.json({ error: "Failed to load product" }, { status: 500 });
  }
}
