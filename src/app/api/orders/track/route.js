import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { order_number, phone } = await req.json();
  if (!order_number || !phone) {
    return NextResponse.json({ error: "Order ID and phone required" }, { status: 400 });
  }
  const order = db
    .prepare("SELECT * FROM orders WHERE order_number = ? AND phone = ?")
    .get(order_number.trim(), phone.trim());

  if (!order) {
    return NextResponse.json({ error: "No order found with those details" }, { status: 404 });
  }

  return NextResponse.json({
    order: {
      order_number: order.order_number,
      status: order.status,
      items: JSON.parse(order.items),
      subtotal: order.subtotal,
      shiprocket_tracking_id: order.shiprocket_tracking_id,
      shiprocket_courier: order.shiprocket_courier,
      created_at: order.created_at,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
    },
  });
}
