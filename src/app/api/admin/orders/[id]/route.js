import { getSupabase } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";
import { sendShippingUpdate } from "@/lib/notify";
import { parseOrder } from "@/lib/db-helpers";

export const runtime = "nodejs";

export async function PATCH(req, { params }){
  const supabase = getSupabase();
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  try {
    const { id } = await params;
    const body = await req.json();
    const { shiprocket_tracking_id, shiprocket_courier, status } = body;
    const update = {};
    if (shiprocket_tracking_id !== undefined) update.shiprocket_tracking_id = shiprocket_tracking_id;
    if (shiprocket_courier !== undefined) update.shiprocket_courier = shiprocket_courier;
    if (status !== undefined) update.status = status;
    if (!Object.keys(update).length) return NextResponse.json({ error: "No fields to update" }, { status: 400 });

    const { error } = await supabase.from("orders").update(update).eq("id", id);
    if (error) throw error;

    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
    if (orderError) throw orderError;
    if (status === "shipped" && order) {
      sendShippingUpdate(parseOrder(order)).catch((e) => console.error("notify failed", e));
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin order PATCH error:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
