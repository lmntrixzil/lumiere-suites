"use client";
/**
 * Booking card on the apartment page: dates (with booked nights blocked), guests,
 * an optional car and a live price breakdown. "Reserve" hands everything to the
 * checkout via the URL.
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { rangeIsFreeClient } from "@/lib/availability-client";
import { diffDays } from "@/lib/dates";
import { buildQuote } from "@/lib/pricing";
import type { Apartment, Car, CarSelection, DriveMode, Settings } from "@/lib/types";
import { Price, useMoney } from "./Currency";
import { DateRangeField, type RangeValue } from "./DateRangePicker";
import { Icon } from "./icons/Icon";

export function BookingCard({ apt, cars, settings, blocked }: { apt: Apartment; cars: Car[]; settings: Settings; blocked: string[] }) {
  const params = useSearchParams();
  const money = useMoney();
  const initial: RangeValue = { from: params.get("checkIn") ?? undefined, to: params.get("checkOut") ?? undefined };
  // Drop a pre-filled range that is no longer free.
  const [dates, setDates] = useState<RangeValue>(initial.from && initial.to && rangeIsFreeClient(initial.from, initial.to, blocked) ? initial : {});
  const [guests, setGuests] = useState(Math.min(apt.maxGuests, Number(params.get("guests") || 2)));
  const [withCar, setWithCar] = useState(params.get("car") === "1");
  const [carId, setCarId] = useState(cars[0]?.id ?? "");
  const [mode, setMode] = useState<DriveMode>("chauffeur");
  const [pickup, setPickup] = useState(true);

  const car = cars.find((c) => c.id === carId) ?? null;
  const nights = dates.from && dates.to ? diffDays(dates.from, dates.to) : 0;

  const carSel: CarSelection | null =
    withCar && car && dates.from
      ? { carId: car.id, mode: car.selfDrive ? mode : "chauffeur", rateType: "daily", start: dates.from, units: Math.max(1, nights), airportPickup: pickup, airportDropoff: false }
      : null;

  const quote = buildQuote({ settings, apartment: apt, checkIn: dates.from, checkOut: dates.to, car, carSel }); // cheap enough to run every render

  const href = (() => {
    const q = new URLSearchParams({ apt: apt.slug, guests: String(guests) });
    if (dates.from) q.set("checkIn", dates.from);
    if (dates.to) q.set("checkOut", dates.to);
    if (carSel && car) {
      q.set("car", car.slug);
      q.set("mode", carSel.mode);
      q.set("units", String(carSel.units));
      if (pickup) q.set("pickup", "1");
    }
    return `/book?${q}`;
  })();

  const ready = nights >= apt.minNights;

  return (
    <div id="book" className="card scroll-mt-28 p-6 shadow-[0_30px_70px_-40px_rgba(14,17,22,0.4)]">
      <p className="flex items-baseline gap-1.5">
        <Price ngn={apt.nightlyRate} className="font-serif text-4xl" />
        <span className="text-sm text-stone">/ night</span>
      </p>
      <p className="mt-1 flex items-center gap-1 text-sm text-stone">
        <Icon name="star" className="h-3.5 w-3.5 fill-gold text-gold" /> {apt.rating.toFixed(2)} · {apt.reviewCount} reviews
      </p>

      <div className="mt-6 rounded-xl border border-line">
        <DateRangeField value={dates} onChange={setDates} blocked={blocked} minNights={apt.minNights} className="border-b border-line p-4" />
        <div className="flex items-center justify-between p-4">
          <span>
            <span className="block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-stone">Guests</span>
            <span className="mt-1 block">
              {guests} of {apt.maxGuests}
            </span>
          </span>
          <span className="flex gap-1.5">
            <button type="button" aria-label="Fewer guests" onClick={() => setGuests(Math.max(1, guests - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-ink">
              <Icon name="minus" className="h-3.5 w-3.5" />
            </button>
            <button type="button" aria-label="More guests" onClick={() => setGuests(Math.min(apt.maxGuests, guests + 1))} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-ink">
              <Icon name="plus" className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
      </div>

      {/* Car add-on */}
      <div className={`mt-4 rounded-xl border p-4 transition ${withCar ? "border-gold bg-gold/5" : "border-line"}`}>
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            <Icon name="car" className="h-6 w-6 text-bronze" />
            <span>
              <span className="block font-medium">Add a car</span>
              <span className="text-xs text-stone">For every day of your stay</span>
            </span>
          </span>
          <input type="checkbox" checked={withCar} onChange={(e) => setWithCar(e.target.checked)} className="peer sr-only" />
          <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-line transition peer-checked:bg-ink peer-focus-visible:ring-2 peer-focus-visible:ring-gold after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
        </label>
        {withCar && (
          <div className="mt-4 space-y-3 animate-fade">
            <select value={carId} onChange={(e) => setCarId(e.target.value)} className="field-box" aria-label="Choose a car">
              {cars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {money(c.rates.daily)}/day
                </option>
              ))}
            </select>
            {car?.selfDrive ? (
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Driving">
                {(["chauffeur", "self"] as const).map((m) => (
                  <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)} className={`rounded-lg border px-3 py-2 text-sm ${mode === m ? "border-ink bg-ink text-ivory" : "border-line bg-white"}`}>
                    {m === "chauffeur" ? "With chauffeur" : "Self-drive"}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-stone">This car is chauffeur-driven only.</p>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className="h-4 w-4 accent-[#0E1116]" />
              Airport pickup at MMIA (+{money(settings.airportTransferFee)})
            </label>
          </div>
        )}
      </div>

      {/* Live breakdown */}
      {nights > 0 && (
        <dl className="mt-6 space-y-2.5 text-sm" aria-live="polite">
          {quote.lines.map((l) => (
            <div key={l.label} className="flex justify-between gap-4">
              <dt className={l.kind === "discount" ? "text-bronze" : "text-stone"}>
                {l.label}
                {l.note && <span className="block text-xs text-mist">{l.note}</span>}
              </dt>
              <dd className={l.kind === "discount" ? "text-bronze" : ""}>
                {l.amount < 0 ? "−" : ""}
                {money(Math.abs(l.amount))}
              </dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3 font-serif text-2xl">
            <dt>Total</dt>
            <dd>{money(quote.total)}</dd>
          </div>
        </dl>
      )}

      {ready ? (
        <Link href={href} className="btn-gold mt-6 w-full py-4">
          Reserve
        </Link>
      ) : (
        <button type="button" disabled className="btn-gold mt-6 w-full py-4">
          {nights > 0 ? `Minimum ${apt.minNights} nights` : "Choose your dates"}
        </button>
      )}
      <p className="mt-3 text-center text-xs text-stone">You won&apos;t be charged until the next step.</p>
      {nights > 0 && nights < 7 && settings.weeklyDiscountPct > 0 && (
        <p className="mt-4 rounded-lg bg-cream px-3 py-2 text-center text-xs text-ink">
          Stay 7+ nights and save {settings.weeklyDiscountPct}%. 28+ nights saves {settings.monthlyDiscountPct}%.
        </p>
      )}
    </div>
  );
}
