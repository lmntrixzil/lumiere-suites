import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword, adminToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!adminPassword() || password !== adminPassword()) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, await adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
