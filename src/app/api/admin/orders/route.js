import { getSupabase } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { parseOrder } from "@/lib/db-helpers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req){
  const supabase = getSupabase();
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .neq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ orders: (data || []).map(parseOrder) });
  } catch (err) {
    console.error("Admin orders GET error:", err);
    return NextResponse.json({ error: "Failed to load orders" }, { status: 500 });
  }
}
