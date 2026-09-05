import { getSupabase } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(req, { params }){
  const supabase = getSupabase();
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ["name", "description", "price", "image_url", "sizes", "stock", "active"];
    const update = {};
    for (const key of allowed) {
      if (key in body) update[key] = key === "price" || key === "stock" ? Number(body[key]) : body[key];
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

    const { error } = await supabase.from("products").update(update).eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin product PATCH error:", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req, { params }){
  const supabase = getSupabase();
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const { id } = await params;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin product DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
