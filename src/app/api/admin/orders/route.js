import db from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function GET(req) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const orders = db
    .prepare("SELECT * FROM orders WHERE status != 'pending' ORDER BY created_at DESC")
    .all()
    .map((o) => ({ ...o, items: JSON.parse(o.items) }));
  return NextResponse.json({ orders });
}
