import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const products = db
    .prepare("SELECT * FROM products WHERE active = 1 ORDER BY created_at DESC")
    .all()
    .map((p) => ({ ...p, sizes: JSON.parse(p.sizes) }));
  return NextResponse.json({ products });
}
