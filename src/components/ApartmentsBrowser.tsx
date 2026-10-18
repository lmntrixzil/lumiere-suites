"use client";
/**
 * Apartment grid with filters: location, bedrooms, price and amenities, plus
 * the dates/guests from the hero search (apartments booked on those nights are hidden).
 * Filters live in the URL so a filtered view can be shared.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { rangeIsFreeClient } from "@/lib/availability-client";
import { locations } from "@/lib/site";
import type { AmenityKey, Apartment } from "@/lib/types";
import { amenityLabels } from "./amenities";
import { ApartmentCard } from "./ApartmentCard";
import { CurrencyToggle, useMoney } from "./Currency";
import { DateRangeField, type RangeValue } from "./DateRangePicker";
import { Icon } from "./icons/Icon";

const FILTER_AMENITIES: AmenityKey[] = ["pool", "gym", "workspace", "balcony", "washer", "view", "parking", "concierge"];

export function ApartmentsBrowser({ apartments, blocked, fixedLocation }: { apartments: Apartment[]; blocked: Record<string, string[]>; fixedLocation?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const money = useMoney();

  const maxRate = Math.max(...apartments.map((a) => a.nightlyRate));
  const [location, setLocation] = useState(fixedLocation ?? params.get("location") ?? "");
  const [beds, setBeds] = useState(Number(params.get("beds") || 0));
  const [price, setPrice] = useState(Number(params.get("price") || maxRate));
  const [amenities, setAmenities] = useState<AmenityKey[]>((params.get("amenities")?.split(",").filter(Boolean) as AmenityKey[]) ?? []);
  const [dates, setDates] = useState<RangeValue>({ from: params.get("checkIn") ?? undefined, to: params.get("checkOut") ?? undefined });
  const [guests, setGuests] = useState(Number(params.get("guests") || 1));
  const [sort, setSort] = useState(params.get("sort") ?? "featured");
  const [showFilters, setShowFilters] = useState(false);
  const wantsCar = params.get("car") === "1";

  const results = useMemo(() => {
    const list = apartments.filter(
      (a) =>
        (!location || a.location === location) &&
        a.bedrooms >= beds &&
        a.nightlyRate <= price &&
        a.maxGuests >= guests &&
        amenities.every((k) => a.amenities.includes(k)) &&
        (!dates.from || !dates.to || rangeIsFreeClient(dates.from, dates.to, blocked[a.id] ?? [])),
    );
    const by: Record<string, (a: Apartment, b: Apartment) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating,
      "price-asc": (a, b) => a.nightlyRate - b.nightlyRate,
      "price-desc": (a, b) => b.nightlyRate - a.nightlyRate,
      size: (a, b) => b.bedrooms - a.bedrooms,
    };
    return list.sort(by[sort]);
  }, [apartments, location, beds, price, guests, amenities, dates, blocked, sort]);

  // Keep the URL in sync (without scrolling) so the view is shareable.
  const sync = (next: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v === undefined || v === "" || v === 0 ? q.delete(k) : q.set(k, String(v))));
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const toggleAmenity = (k: AmenityKey) => {
    const next = amenities.includes(k) ? amenities.filter((x) => x !== k) : [...amenities, k];
    setAmenities(next);
    sync({ amenities: next.join(",") });
  };

  const reset = () => {
    setLocation(fixedLocation ?? "");
    setBeds(0);
    setPrice(maxRate);
    setAmenities([]);
    setDates({});
    setGuests(1);
    router.replace(pathname, { scroll: false });
  };

  // Carry the search into each apartment link so the booking card is pre-filled.
  const carry = new URLSearchParams();
  if (dates.from) carry.set("checkIn", dates.from);
  if (dates.to) carry.set("checkOut", dates.to);
  if (guests > 1) carry.set("guests", String(guests));
  if (wantsCar) carry.set("car", "1");
  const query = carry.toString() ? `?${carry}` : "";

  const pill = (active: boolean) =>
    `rounded-full border px-4 py-2 text-[0.78rem] transition ${active ? "border-ink bg-ink text-ivory" : "border-line bg-white text-ink hover:border-ink/50"}`;

  const filters = (
    <div className="space-y-8">
      {!fixedLocation && (
        <fieldset>
          <legend className="label">Location</legend>
          <div className="flex flex-wrap gap-2">
            {[{ slug: "", name: "All" }, ...Object.values(locations)].map((l) => (
              <button key={l.slug} type="button" aria-pressed={location === l.slug} className={pill(location === l.slug)} onClick={() => (setLocation(l.slug), sync({ location: l.slug }))}>
                {l.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="label">Bedrooms</legend>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4].map((n) => (
            <button key={n} type="button" aria-pressed={beds === n} className={pill(beds === n)} onClick={() => (setBeds(n), sync({ beds: n }))}>
              {n === 0 ? "Any" : `${n}+`}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="price" className="label flex justify-between">
          <span>Max per night</span>
          <span className="normal-case tracking-normal text-ink">{money(price)}</span>
        </label>
        <input
          id="price"
          type="range"
          min={100000}
          max={maxRate}
          step={5000}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          onMouseUp={() => sync({ price: price === maxRate ? undefined : price })}
          onTouchEnd={() => sync({ price: price === maxRate ? undefined : price })}
          className="w-full accent-[#8A6A32]"
        />
      </div>
      <fieldset>
        <legend className="label">Amenities</legend>
        <div className="grid grid-cols-2 gap-2">
          {FILTER_AMENITIES.map((k) => (
            <label key={k} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={amenities.includes(k)} onChange={() => toggleAmenity(k)} className="h-4 w-4 accent-[#0E1116]" />
              {amenityLabels[k]}
            </label>
          ))}
        </div>
      </fieldset>
      <button type="button" onClick={reset} className="text-xs uppercase tracking-[0.2em] text-stone underline underline-offset-4 hover:text-ink">
        Reset filters
      </button>
    </div>
  );

  return (
    <div id="results" className="scroll-mt-24">
      {/* Search strip */}
      <div className="card grid gap-4 p-4 sm:grid-cols-[1.6fr_1fr_auto] sm:items-center sm:p-5">
        <DateRangeField value={dates} onChange={(v) => (setDates(v), (v.to || !v.from) && sync({ checkIn: v.from, checkOut: v.to }))} />
        <div className="flex items-center justify-between gap-3 sm:border-l sm:border-line sm:pl-5">
          <span>
            <span className="block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-stone">Guests</span>
            <span className="mt-1 block text-[0.95rem]">
              {guests} guest{guests > 1 ? "s" : ""}
            </span>
          </span>
          <span className="flex gap-1.5">
            <button type="button" aria-label="Fewer guests" onClick={() => (setGuests(Math.max(1, guests - 1)), sync({ guests: Math.max(1, guests - 1) }))} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-ink">
              <Icon name="minus" className="h-3.5 w-3.5" />
            </button>
            <button type="button" aria-label="More guests" onClick={() => (setGuests(Math.min(12, guests + 1)), sync({ guests: Math.min(12, guests + 1) }))} className="grid h-8 w-8 place-items-center rounded-full border border-line hover:border-ink">
              <Icon name="plus" className="h-3.5 w-3.5" />
            </button>
          </span>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <CurrencyToggle tone="dark" />
          <button type="button" onClick={() => setShowFilters(true)} className="btn-ghost px-4 py-2.5 lg:hidden">
            <Icon name="settings" className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-28">{filters}</div>
        </aside>

        {/* Mobile filter sheet */}
        {showFilters && (
          <div className="fixed inset-0 z-[60] bg-ink/50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div role="dialog" aria-modal="true" aria-label="Filters" className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-ivory p-6 animate-fade" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <p className="font-serif text-2xl">Filters</p>
                <button type="button" onClick={() => setShowFilters(false)} aria-label="Close filters">
                  <Icon name="close" className="h-5 w-5" />
                </button>
              </div>
              {filters}
              <button type="button" onClick={() => setShowFilters(false)} className="btn-ink mt-8 w-full">
                Show {results.length} apartment{results.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone" aria-live="polite">
              {results.length} residence{results.length === 1 ? "" : "s"}
              {dates.from && dates.to ? " available for your dates" : ""}
            </p>
            <label className="flex items-center gap-2 text-sm text-stone">
              Sort
              <select value={sort} onChange={(e) => (setSort(e.target.value), sync({ sort: e.target.value === "featured" ? undefined : e.target.value }))} className="rounded-full border border-line bg-white px-3 py-1.5 text-ink">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="size">Most bedrooms</option>
              </select>
            </label>
          </div>
          {results.length ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((a, i) => (
                <ApartmentCard key={a.id} apt={a} query={query} priority={i < 2} />
              ))}
            </div>
          ) : (
            <div className="card px-6 py-16 text-center">
              <p className="font-serif text-3xl">Nothing matches just yet</p>
              <p className="mx-auto mt-3 max-w-md text-stone">Try different dates or fewer filters, or message us: we often have availability that isn&apos;t listed.</p>
              <button type="button" onClick={reset} className="btn-ink mt-6">
                Reset filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
