import { ensureAdminFromEnv, getSupabase, verifyPw } from "@/lib/db";
import { signSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const supabase = getSupabase();
    const { username, password } = await req.json();
    const cleanUsername = (username || "").trim();
    const cleanPassword = password || "";

    if (!cleanUsername || !cleanPassword) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    // On a fresh production database, create the configured admin once.
    await ensureAdminFromEnv();

    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, password_hash")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (error) throw error;
    if (!admin || !verifyPw(cleanPassword, admin.password_hash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signSession(admin.username);
    const res = NextResponse.json({ success: true });
    res.cookies.set("seiszn_admin", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
    return res;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Server error while signing in" }, { status: 500 });
  }
}
