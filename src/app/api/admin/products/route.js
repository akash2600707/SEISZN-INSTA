import { getSupabase } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { parseProduct } from "@/lib/db-helpers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req){
  const supabase = getSupabase();
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ products: (data || []).map(parseProduct) });
  } catch (err) {
    console.error("Admin products GET error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

export async function POST(req){
  const supabase = getSupabase();
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const body = await req.json();
    const { slug, name, description, price, image_url, sizes, stock } = body;
    if (!slug || !name || price === undefined || price === "") {
      return NextResponse.json({ error: "slug, name, price required" }, { status: 400 });
    }

    const { error } = await supabase.from("products").insert({
      slug: slug.trim(),
      name: name.trim(),
      description: description || "",
      price: Math.round(Number(price)),
      image_url: image_url || "",
      sizes: sizes || ["S", "M", "L"],
      stock: Math.max(0, Number(stock ?? 100)),
      active: true,
    });
    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin product POST error:", err);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}
