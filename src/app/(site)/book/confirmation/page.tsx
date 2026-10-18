import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon, WhatsAppIcon } from "@/components/icons/Icon";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { bookingSummaryText } from "@/lib/email";
import { naira } from "@/lib/pricing";
import { site, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Booking confirmed", robots: { index: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  // Looked up by the unguessable booking id, not the short reference.
  const { id } = await searchParams;
  const b = id ? await db.get("bookings", id) : null;
  if (!b) notFound();
  const paid = b.payment.paid;
  const wa = whatsappLink(`Hello Lumière Suites! Here is my booking:\n\n${bookingSummaryText(b)}`);

  return (
    <>
      <div className="h-24 bg-ink sm:h-28" />
      <section className="container-x max-w-3xl py-16 sm:py-24">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold">
            <Icon name="check" className="h-7 w-7 text-bronze" />
          </span>
          <p className="eyebrow mt-8 text-bronze">Reference {b.ref}</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl">{paid ? "You're all set." : "Almost there."}</h1>
          <p className="mx-auto mt-5 max-w-lg text-stone">
            {paid
              ? `Thank you, ${b.guest.name.split(" ")[0]}. Your booking is confirmed and a copy is on its way to ${b.guest.email}.`
              : `Thank you, ${b.guest.name.split(" ")[0]}. We're holding your booking for 12 hours. Transfer the total below using your reference ${b.ref} and we'll confirm the moment it arrives.`}
          </p>
          {b.payment.demo && <p className="mx-auto mt-4 max-w-md rounded-full bg-cream px-4 py-2 text-xs text-bronze">Demo mode: no real payment was taken. Add Paystack / Flutterwave keys to go live.</p>}
        </div>

        <div className="card mt-12 divide-y divide-line">
          {b.stay && (
            <div className="p-6">
              <p className="label">Stay</p>
              <p className="font-serif text-2xl">{b.stay.apartmentName}</p>
              <p className="mt-1 text-sm text-stone">
                {formatDate(b.stay.checkIn, { weekday: "short", day: "numeric", month: "long" })} → {formatDate(b.stay.checkOut, { weekday: "short", day: "numeric", month: "long", year: "numeric" })} · {b.quote.nights} nights · {b.stay.guests} guests
              </p>
            </div>
          )}
          {b.car && (
            <div className="p-6">
              <p className="label">Car</p>
              <p className="font-serif text-2xl">{b.car.carName}</p>
              <p className="mt-1 text-sm text-stone">
                From {formatDate(b.car.start, { weekday: "short", day: "numeric", month: "long" })} · {b.car.units} {b.car.rateType === "hourly" ? "hours" : "days"} ·{" "}
                {b.car.mode === "chauffeur" || b.car.rateType === "hourly" ? "with chauffeur" : "self-drive"}
                {b.car.airportPickup && ` · MMIA pickup${b.guest.flightNumber ? ` (${b.guest.flightNumber})` : ""}`}
              </p>
            </div>
          )}
          <dl className="space-y-2 p-6 text-sm">
            {b.quote.lines.map((l) => (
              <div key={l.label} className="flex justify-between gap-4">
                <dt className="text-stone">{l.label}</dt>
                <dd>
                  {l.amount < 0 ? "−" : ""}
                  {naira(Math.abs(l.amount))}
                </dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-line pt-3 font-serif text-2xl">
              <dt>{paid ? "Paid" : "To pay"}</dt>
              <dd>{naira(b.quote.total)}</dd>
            </div>
          </dl>
          {!paid && b.payment.method === "transfer" && (
            <div className="bg-ink p-6 text-ivory">
              <p className="eyebrow text-gold">Bank transfer details</p>
              <p className="mt-3 font-serif text-xl">
                {site.bank.bankName} · {site.bank.accountName}
              </p>
              <p className="font-serif text-3xl tracking-wider">{site.bank.accountNumber}</p>
              <p className="mt-2 text-sm text-ivory/70">Narration: {b.ref}</p>
            </div>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="btn bg-[#1F7A4D] text-white hover:bg-[#25915c]">
            <WhatsAppIcon className="h-4 w-4" /> Send booking to WhatsApp
          </a>
          <p className="max-w-md text-sm text-stone">Sending us your summary on WhatsApp gets you a direct line to your host. The exact address and access details are shared 24 hours before check-in.</p>
          <Link href="/concierge" className="text-sm text-bronze underline underline-offset-4">
            Add a chef, groceries or a city tour
          </Link>
        </div>
      </section>
    </>
  );
}
