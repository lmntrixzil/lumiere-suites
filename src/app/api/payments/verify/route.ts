import { NextResponse } from "next/server";
import { getBookingByRef } from "@/lib/bookings";
import { db } from "@/lib/db";
import { bookingSummaryText, sendBookingEmail, sendNotification } from "@/lib/email";
import { verifyPayment } from "@/lib/payments";

/** POST /api/payments/verify { ref, provider, reference, transactionId? } */
export async function POST(req: Request) {
  const { ref, provider, reference, transactionId } = await req.json();
  const booking = await getBookingByRef(ref);
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.payment.paid) return NextResponse.json({ booking: { id: booking.id, ref: booking.ref } });
  if (provider !== "paystack" && provider !== "flutterwave") return NextResponse.json({ error: "Unknown provider" }, { status: 400 });

  const result = await verifyPayment(booking, provider, reference || booking.ref, transactionId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 402 });

  booking.status = "confirmed";
  booking.payment = { method: provider, reference: reference || booking.ref, paid: true, demo: result.demo };
  await db.put("bookings", booking);
  await sendBookingEmail(booking);
  await sendNotification(`New confirmed booking ${booking.ref}`, bookingSummaryText(booking));
  return NextResponse.json({ booking: { id: booking.id, ref: booking.ref } });
}
