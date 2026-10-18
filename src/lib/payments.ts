/**
 * Server-side payment verification for Paystack and Flutterwave.
 * A booking is only marked paid after the provider confirms the exact amount.
 * When the secret key for a provider is not set, the site runs in demo mode and
 * accepts a simulated payment so the whole flow can be tried end to end.
 */
import type { Booking } from "./types";

export const paymentMode = {
  paystack: process.env.PAYSTACK_SECRET_KEY ? "live" : "demo",
  flutterwave: process.env.FLW_SECRET_KEY ? "live" : "demo",
} as const;

type Result = { ok: true; demo?: boolean } | { ok: false; error: string };

export async function verifyPayment(booking: Booking, provider: "paystack" | "flutterwave", reference: string, transactionId?: string): Promise<Result> {
  const kobo = Math.round(booking.quote.total * 100);

  if (provider === "paystack") {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return { ok: true, demo: true };
    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const json = await res.json();
    const d = json?.data;
    if (!res.ok || d?.status !== "success") return { ok: false, error: "Paystack could not confirm this payment." };
    if (d.amount < kobo || d.currency !== "NGN") return { ok: false, error: "Payment amount does not match the booking." };
    return { ok: true };
  }

  const key = process.env.FLW_SECRET_KEY;
  if (!key) return { ok: true, demo: true };
  if (!transactionId) return { ok: false, error: "Missing Flutterwave transaction id." };
  const res = await fetch(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  const json = await res.json();
  const d = json?.data;
  if (!res.ok || d?.status !== "successful") return { ok: false, error: "Flutterwave could not confirm this payment." };
  if (d.tx_ref !== reference || d.amount < booking.quote.total || d.currency !== "NGN") {
    return { ok: false, error: "Payment details do not match the booking." };
  }
  return { ok: true };
}
