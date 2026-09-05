import db, { hashPw } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { username, password } = await req.json();
  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
  if (!admin || admin.password_hash !== hashPw(password || "")) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = signSession(username);
  const res = NextResponse.json({ success: true });
  res.cookies.set("seiszn_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
