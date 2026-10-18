/**
 * Booking emails via Resend (https://resend.com). Set RESEND_API_KEY and
 * EMAIL_FROM to send for real; without them the email is logged to the server
 * console so the flow still works in development.
 */
import { formatDate } from "./dates";
import { naira } from "./pricing";
import { site, whatsappLink } from "./site";
import type { Booking } from "./types";

export function bookingSummaryText(b: Booking) {
  const rows: string[] = [`Lumière Suites booking ${b.ref}`, `Guest: ${b.guest.name}`];
  if (b.stay) {
    rows.push(`Stay: ${b.stay.apartmentName}`, `Dates: ${formatDate(b.stay.checkIn)} → ${formatDate(b.stay.checkOut)} (${b.quote.nights} nights)`, `Guests: ${b.stay.guests}`);
  }
  if (b.car) {
    const unit = b.car.rateType === "hourly" ? "hrs" : "days";
    rows.push(
      `Car: ${b.car.carName} (${b.car.mode === "chauffeur" || b.car.rateType === "hourly" ? "with chauffeur" : "self-drive"})`,
      `From: ${formatDate(b.car.start)} · ${b.car.units} ${unit}`,
    );
    if (b.car.airportPickup) rows.push(`Airport pickup at MMIA${b.guest.flightNumber ? ` · flight ${b.guest.flightNumber}` : ""}`);
    if (b.car.airportDropoff) rows.push("Airport drop-off at MMIA");
  }
  rows.push(`Total: ${naira(b.quote.total)} (incl. ${naira(b.quote.cautionDeposit)} refundable deposit)`);
  rows.push(`Payment: ${b.payment.method === "transfer" ? "Bank transfer" : b.payment.method}${b.payment.paid ? " · paid" : " · pending"}`);
  return rows.join("\n");
}

function bookingHtml(b: Booking) {
  const lines = b.quote.lines
    .map((l) => `<tr><td style="padding:6px 0;color:#555">${l.label}</td><td style="padding:6px 0;text-align:right">${l.amount < 0 ? "−" : ""}${naira(Math.abs(l.amount))}</td></tr>`)
    .join("");
  const transfer =
    b.payment.method === "transfer" && !b.payment.paid
      ? `<p style="background:#F7F3EC;padding:16px;border-left:3px solid #C9A96E">Please transfer <b>${naira(b.quote.total)}</b> to<br>${site.bank.bankName}<br>${site.bank.accountName}<br><b>${site.bank.accountNumber}</b><br>Reference: <b>${b.ref}</b><br>Your dates are held for 12 hours.</p>`
      : "";
  return `<div style="font-family:Georgia,serif;max-width:560px;margin:auto;color:#0E1116">
  <p style="letter-spacing:.3em;font-size:12px;color:#C9A96E">LUMIÈRE SUITES</p>
  <h1 style="font-weight:400">${b.payment.paid ? "Your booking is confirmed" : "We have your booking request"}</h1>
  <p>Dear ${b.guest.name.split(" ")[0]}, thank you for choosing Lumière. Your reference is <b>${b.ref}</b>.</p>
  <pre style="font-family:inherit;white-space:pre-wrap;background:#F7F3EC;padding:16px">${bookingSummaryText(b)}</pre>
  <table style="width:100%;font-family:Arial,sans-serif;font-size:14px">${lines}<tr><td style="padding-top:10px;border-top:1px solid #ddd"><b>Total</b></td><td style="padding-top:10px;border-top:1px solid #ddd;text-align:right"><b>${naira(b.quote.total)}</b></td></tr></table>
  ${transfer}
  <p>The exact address and access details are sent 24 hours before check-in. Questions? <a href="${whatsappLink(`Hello, my booking reference is ${b.ref}`)}">WhatsApp us</a> any time.</p>
</div>`;
}

export async function sendBookingEmail(b: Booking) {
  const key = process.env.RESEND_API_KEY;
  const subject = `${b.payment.paid ? "Confirmed" : "Booking received"} · ${b.ref} · Lumière Suites`;
  if (!key) {
    console.info(`[email:demo] To ${b.guest.email}: ${subject}\n${bookingSummaryText(b)}`);
    return { sent: false };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || `Lumière Suites <bookings@${new URL(site.url).hostname}>`,
      to: [b.guest.email],
      bcc: process.env.BOOKINGS_INBOX ? [process.env.BOOKINGS_INBOX] : undefined,
      subject,
      html: bookingHtml(b),
      text: bookingSummaryText(b),
    }),
  });
  if (!res.ok) console.error("[email] Resend error", res.status, await res.text());
  return { sent: res.ok };
}

export async function sendNotification(subject: string, text: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKINGS_INBOX;
  if (!key || !to) {
    console.info(`[email:demo] ${subject}\n${text}`);
    return;
  }
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "Lumière Suites <hello@lumieresuites.ng>", to: [to], subject, text }),
  });
}
