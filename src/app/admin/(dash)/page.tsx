import Link from "next/link";
import { BookingsTable } from "@/components/admin/BookingsTable";
import { Icon } from "@/components/icons/Icon";
import { addDays, eachNight, todayISO } from "@/lib/dates";
import { db } from "@/lib/db";
import { naira } from "@/lib/pricing";

export default async function AdminOverview() {
  const [bookings, apartments, enquiries] = await Promise.all([db.list("bookings"), db.list("apartments"), db.list("enquiries")]);
  const today = todayISO();
  const live = bookings.filter((b) => b.status !== "cancelled");
  const revenue = live.filter((b) => b.payment.paid).reduce((s, b) => s + b.quote.total - b.quote.cautionDeposit, 0);
  const awaiting = bookings.filter((b) => b.status === "awaiting_transfer").length;
  const arrivals = live.filter((b) => b.stay && b.stay.checkIn >= today && b.stay.checkIn <= addDays(today, 7));

  // Occupancy over the next 30 nights across all published apartments.
  const window = eachNight(today, addDays(today, 30));
  const booked = live.reduce((n, b) => n + (b.stay ? eachNight(b.stay.checkIn, b.stay.checkOut).filter((d) => window.includes(d)).length : 0), 0);
  const capacity = apartments.filter((a) => a.published).length * window.length || 1;

  const stats = [
    { label: "Revenue (paid, excl. deposits)", value: naira(revenue), icon: "tag" },
    { label: "Occupancy, next 30 nights", value: `${Math.round((booked / capacity) * 100)}%`, icon: "bed" },
    { label: "Arrivals this week", value: arrivals.length, icon: "plane" },
    { label: "Awaiting bank transfer", value: awaiting, icon: "clock" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-bronze">Overview</p>
          <h1 className="mt-2 font-serif text-5xl">Good day</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/apartments/new" className="btn-ink">
            <Icon name="plus" className="h-4 w-4" /> Apartment
          </Link>
          <Link href="/admin/cars/new" className="btn-ghost">
            <Icon name="plus" className="h-4 w-4" /> Car
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <Icon name={s.icon} className="h-5 w-5 text-bronze" />
            <p className="mt-4 font-serif text-4xl">{s.value}</p>
            <p className="mt-1 text-xs text-stone">{s.label}</p>
          </div>
        ))}
      </div>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-3xl">Latest bookings</h2>
          <Link href="/admin/bookings" className="text-sm text-bronze underline">
            All bookings
          </Link>
        </div>
        <BookingsTable bookings={bookings.slice(0, 8)} compact />
      </section>
      {enquiries.some((e) => !e.handled) && (
        <Link href="/admin/inbox" className="flex items-center justify-between rounded-2xl border border-gold bg-gold/10 p-5">
          <span>
            <span className="font-medium">{enquiries.filter((e) => !e.handled).length} new enquiries</span>
            <span className="block text-sm text-stone">Concierge requests and contact messages</span>
          </span>
          <Icon name="arrow" className="h-5 w-5" />
        </Link>
      )}
    </div>
  );
}
