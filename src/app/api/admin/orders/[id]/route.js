import db from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";
import { sendShippingUpdate } from "@/lib/notify";

export async function PATCH(req, { params }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const { id } = await params;
  const body = await req.json();
  const { shiprocket_tracking_id, shiprocket_courier, status } = body;

  const fields = [];
  const values = { id };
  if (shiprocket_tracking_id !== undefined) {
    fields.push("shiprocket_tracking_id = @shiprocket_tracking_id");
    values.shiprocket_tracking_id = shiprocket_tracking_id;
  }
  if (shiprocket_courier !== undefined) {
    fields.push("shiprocket_courier = @shiprocket_courier");
    values.shiprocket_courier = shiprocket_courier;
  }
  if (status !== undefined) {
    fields.push("status = @status");
    values.status = status;
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  db.prepare(`UPDATE orders SET ${fields.join(", ")} WHERE id = @id`).run(values);

  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
  if (status === "shipped" && order) {
    sendShippingUpdate(order).catch((e) => console.error("notify failed", e));
  }

  return NextResponse.json({ success: true });
}
