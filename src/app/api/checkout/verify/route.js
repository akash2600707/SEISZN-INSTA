import crypto from "crypto";
import db from "@/lib/db";
import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/notify";

export async function POST(req) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      db.prepare("UPDATE orders SET status = 'failed' WHERE razorpay_order_id = ?").run(
        razorpay_order_id
      );
      return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
    }

    db.prepare(
      "UPDATE orders SET status = 'paid', razorpay_payment_id = ? WHERE razorpay_order_id = ?"
    ).run(razorpay_payment_id, razorpay_order_id);

    const order = db
      .prepare("SELECT * FROM orders WHERE razorpay_order_id = ?")
      .get(razorpay_order_id);

    if (order) {
      sendOrderConfirmation(order).catch((e) => console.error("notify failed", e));
    }

    return NextResponse.json({ success: true, order_number: order?.order_number });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
