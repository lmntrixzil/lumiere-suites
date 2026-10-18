import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendBookingEmail } from "@/lib/email";
import type { Booking } from "@/lib/types";

// Collections the dashboard may edit. (Protected by middleware.ts.)
const EDITABLE = ["apartments", "cars", "discounts", "settings", "bookings", "enquiries"] as const;
type Editable = (typeof EDITABLE)[number];

const check = (c: unknown): c is Editable => EDITABLE.includes(c as Editable);

/** POST { collection, item } → create or update a record. */
export async function POST(req: Request) {
  const { collection, item } = await req.json();
  if (!check(collection) || !item?.id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  // Email the guest when a bank-transfer booking is marked as confirmed.
  if (collection === "bookings") {
    const before = (await db.get("bookings", item.id)) as Booking | null;
    if (before && before.status !== "confirmed" && item.status === "confirmed") await sendBookingEmail(item as Booking);
  }
  await db.put(collection, item);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, item });
}

/** DELETE { collection, id } */
export async function DELETE(req: Request) {
  const { collection, id } = await req.json();
  if (!check(collection) || !id || collection === "settings") return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await db.remove(collection, id);
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
