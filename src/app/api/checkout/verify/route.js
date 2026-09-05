import crypto from "crypto";
import { getSupabase } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendOrderConfirmation } from "@/lib/notify";
import { parseOrder } from "@/lib/db-helpers";

export const runtime = "nodejs";

export async function POST(req){
  const supabase = getSupabase();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body).digest("hex");
    if (expected !== razorpay_signature) {
      await supabase.from("orders").update({ status: "failed" }).eq("razorpay_order_id", razorpay_order_id);
      return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
    }

    const { error: updateError } = await supabase.from("orders").update({ status: "paid", razorpay_payment_id }).eq("razorpay_order_id", razorpay_order_id);
    if (updateError) throw updateError;

    const { data: order, error } = await supabase.from("orders").select("*").eq("razorpay_order_id", razorpay_order_id).maybeSingle();
    if (error) throw error;
    if (order) sendOrderConfirmation(parseOrder(order)).catch((e) => console.error("notify failed", e));

    return NextResponse.json({ success: true, order_number: order?.order_number });
  } catch (err) {
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
