import { NextResponse } from "next/server";
import { todayISO } from "@/lib/dates";
import { findDiscount } from "@/lib/db";
import { codeIsValid } from "@/lib/pricing";

/** GET /api/discount?code=WELCOME10 → the code if it can be used today. */
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") || "";
  const d = await findDiscount(code);
  if (!codeIsValid(d, todayISO())) return NextResponse.json({ valid: false }, { status: 404 });
  return NextResponse.json({ valid: true, discount: d });
}
