import { NextResponse } from "next/server";
import { BookingError, createBooking } from "@/lib/bookings";
import { sendBookingEmail, sendNotification, bookingSummaryText } from "@/lib/email";

/** POST /api/bookings → creates a pending booking with a server-calculated quote. */
export async function POST(req: Request) {
  try {
    const booking = await createBooking(await req.json());
    // Bank transfers are confirmed manually, so email the instructions straight away.
    if (booking.payment.method === "transfer") {
      await sendBookingEmail(booking);
      await sendNotification(`New booking (bank transfer) ${booking.ref}`, bookingSummaryText(booking));
    }
    return NextResponse.json({ booking });
  } catch (e) {
    if (e instanceof BookingError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error(e);
    return NextResponse.json({ error: "Something went wrong. Please try again or WhatsApp us." }, { status: 500 });
  }
}
