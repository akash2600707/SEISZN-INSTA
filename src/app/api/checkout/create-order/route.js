import Razorpay from "razorpay";
import { getSupabase } from "@/lib/db";
import { generateOrderNumber } from "@/lib/orders";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req){
  const supabase = getSupabase();
  try {
    const body = await req.json();
    const { customer_name, phone, email, address, city, state, pincode, items } = body;

    if (!customer_name || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let subtotal = 0;
    const verifiedItems = [];
    for (const item of items) {
      const { data: p, error } = await supabase.from("products").select("slug,name,price,stock,sizes").eq("slug", item.slug).eq("active", true).maybeSingle();
      if (error) throw error;
      if (!p) continue;
      const qty = Math.max(1, Math.floor(Number(item.qty) || 1));
      if (Number(p.stock) < qty) return NextResponse.json({ error: `${p.name} is out of stock` }, { status: 400 });
      subtotal += p.price * qty;
      verifiedItems.push({ slug: p.slug, name: p.name, price: p.price, size: item.size || null, qty });
    }
    if (!verifiedItems.length) return NextResponse.json({ error: "No valid items" }, { status: 400 });

    const orderNumber = generateOrderNumber();
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const rzpOrder = await razorpay.orders.create({ amount: subtotal, currency: "INR", receipt: orderNumber });

    const { error: insertError } = await supabase.from("orders").insert({
      order_number: orderNumber,
      customer_name,
      phone,
      email: email || "",
      address,
      city,
      state,
      pincode,
      items: verifiedItems,
      subtotal,
      status: "pending",
      razorpay_order_id: rzpOrder.id,
    });
    if (insertError) throw insertError;

    return NextResponse.json({ order_number: orderNumber, razorpay_order_id: rzpOrder.id, amount: subtotal, currency: "INR", key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
