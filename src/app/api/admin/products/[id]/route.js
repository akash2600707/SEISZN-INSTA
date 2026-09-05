import db from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const { id } = await params;
  const body = await req.json();
  const allowed = ["name", "description", "price", "image_url", "sizes", "stock", "active"];
  const fields = [];
  const values = {};
  for (const key of allowed) {
    if (key in body) {
      fields.push(`${key} = @${key}`);
      values[key] = key === "sizes" ? JSON.stringify(body[key]) : body[key];
    }
  }
  if (fields.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }
  values.id = id;
  db.prepare(`UPDATE products SET ${fields.join(", ")} WHERE id = @id`).run(values);
  return NextResponse.json({ success: true });
}

export async function DELETE(req, { params }) {
  const unauth = requireAdmin(req);
  if (unauth) return unauth;
  const { id } = await params;
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
