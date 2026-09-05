import { verifySession } from "@/lib/auth";
import { NextResponse } from "next/server";

export function requireAdmin(req) {
  const token = req.cookies.get("seiszn_admin")?.value;
  const session = verifySession(token);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
