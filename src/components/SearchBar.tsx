"use client";
/**
 * Hero search: location, dates, guests, "Add a car" and Check Availability.
 * Sends the visitor to /apartments with the search in the URL, where results are
 * filtered to apartments that are free for those dates.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DateRangeField, type RangeValue } from "./DateRangePicker";
import { Icon } from "./icons/Icon";

export function SearchBar() {
  const router = useRouter();
  const [location, setLocation] = useState<"" | "ikoyi" | "lekki">("");
  const [dates, setDates] = useState<RangeValue>({});
  const [guests, setGuests] = useState(2);
  const [car, setCar] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (location) q.set("location", location);
    if (dates.from) q.set("checkIn", dates.from);
    if (dates.to) q.set("checkOut", dates.to);
    q.set("guests", String(guests));
    if (car) q.set("car", "1");
    router.push(`/apartments?${q.toString()}#results`);
  };

  // Two columns on phones so the whole search fits inside the pinned hero.
  const cell = "px-4 py-3 sm:px-5 lg:py-4";
  const line = "border-white/10";
  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Check availability"
      className="grid w-full grid-cols-2 rounded-3xl border border-white/15 bg-ink/55 text-ivory shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] backdrop-blur-xl lg:grid-cols-[1fr_1.6fr_0.9fr_auto_auto] lg:rounded-full"
    >
      <label className={`${cell} border-b border-r ${line} lg:border-b-0 lg:pl-8`}>
        <span className="block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-ivory/60">Location</span>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value as typeof location)}
          className="mt-1 w-full cursor-pointer appearance-none bg-transparent text-[0.95rem] focus:outline-none [&>option]:text-ink"
        >
          <option value="">Ikoyi or Lekki</option>
          <option value="ikoyi">Ikoyi</option>
          <option value="lekki">Lekki</option>
        </select>
      </label>

      <DateRangeField value={dates} onChange={setDates} tone="dark" placement="top" className={`${cell} order-first col-span-2 border-b ${line} lg:order-none lg:col-span-1 lg:border-b-0 lg:border-r`} />

      <div className={`${cell} flex items-center justify-between gap-2 border-b ${line} lg:border-b-0 lg:border-r`}>
        <span>
          <span className="block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-ivory/60">Guests</span>
          <span className="mt-1 block text-[0.95rem]" aria-live="polite">
            {guests}
            <span className="hidden sm:inline"> guest{guests > 1 ? "s" : ""}</span>
          </span>
        </span>
        <span className="flex gap-1.5">
          <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="grid h-8 w-8 place-items-center rounded-full border border-white/25 hover:border-gold">
            <Icon name="minus" className="h-3.5 w-3.5" />
          </button>
          <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(12, g + 1))} className="grid h-8 w-8 place-items-center rounded-full border border-white/25 hover:border-gold">
            <Icon name="plus" className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      <label className={`${cell} flex cursor-pointer items-center justify-between gap-3`}>
        <span>
          <span className="block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-ivory/60">Add a car</span>
          <span className="mt-1 block text-[0.95rem]">{car ? "Yes" : "No car"}</span>
        </span>
        <input type="checkbox" checked={car} onChange={(e) => setCar(e.target.checked)} className="peer sr-only" />
        <span aria-hidden="true" className="relative h-6 w-11 shrink-0 rounded-full bg-white/20 transition peer-checked:bg-gold peer-focus-visible:ring-2 peer-focus-visible:ring-gold after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      </label>

      <div className="p-2 lg:p-2.5">
        <button type="submit" className="btn-gold h-full w-full rounded-2xl px-3 py-3.5 lg:rounded-full lg:px-8">
          <span className="lg:hidden">Search</span>
          <span className="hidden lg:inline">Check availability</span>
        </button>
      </div>
    </form>
  );
}
