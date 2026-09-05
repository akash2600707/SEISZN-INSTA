import { getSupabase } from "@/lib/db";
import { parseOrder } from "@/lib/db-helpers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req){
  const supabase = getSupabase();
  try {
    const { order_number, phone } = await req.json();
    if (!order_number || !phone) return NextResponse.json({ error: "Order ID and phone are required" }, { status: 400 });

    const { data: order, error } = await supabase
      .from("orders")
      .select("order_number,customer_name,phone,email,address,city,state,pincode,items,subtotal,status,shiprocket_tracking_id,shiprocket_courier,created_at")
      .eq("order_number", order_number.trim())
      .eq("phone", phone.trim())
      .maybeSingle();
    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order: parseOrder(order) });
  } catch (err) {
    console.error("Order tracking error:", err);
    return NextResponse.json({ error: "Failed to track order" }, { status: 500 });
  }
}
