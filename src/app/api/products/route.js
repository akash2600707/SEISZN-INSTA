import { getSupabase } from "@/lib/db";
import { parseProduct } from "@/lib/db-helpers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(){
  const supabase = getSupabase();
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ products: (data || []).map(parseProduct) });
  } catch (err) {
    console.error("Products GET error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
