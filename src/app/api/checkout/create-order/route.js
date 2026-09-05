import Razorpay from "razorpay";
import db from "@/lib/db";
import { generateOrderNumber } from "@/lib/orders";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer_name, phone, email, address, city, state, pincode, items } = body;

    if (!customer_name || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Recompute prices server-side from DB — never trust client-sent prices
    const productStmt = db.prepare("SELECT * FROM products WHERE slug = ? AND active = 1");
    let subtotal = 0;
    const verifiedItems = [];
    for (const item of items) {
      const p = productStmt.get(item.slug);
      if (!p) continue;
      const qty = Math.max(1, Number(item.qty) || 1);
      subtotal += p.price * qty;
      verifiedItems.push({ slug: p.slug, name: p.name, price: p.price, size: item.size || null, qty });
    }
    if (verifiedItems.length === 0) {
      return NextResponse.json({ error: "No valid items" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const rzpOrder = await razorpay.orders.create({
      amount: subtotal, // in paise
      currency: "INR",
      receipt: orderNumber,
    });

    db.prepare(
      `INSERT INTO orders (order_number, customer_name, phone, email, address, city, state, pincode, items, subtotal, status, razorpay_order_id)
       VALUES (@order_number, @customer_name, @phone, @email, @address, @city, @state, @pincode, @items, @subtotal, 'pending', @razorpay_order_id)`
    ).run({
      order_number: orderNumber,
      customer_name,
      phone,
      email: email || "",
      address,
      city,
      state,
      pincode,
      items: JSON.stringify(verifiedItems),
      subtotal,
      razorpay_order_id: rzpOrder.id,
    });

    return NextResponse.json({
      order_number: orderNumber,
      razorpay_order_id: rzpOrder.id,
      amount: subtotal,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
