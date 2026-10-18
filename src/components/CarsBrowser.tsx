"use client";
import Link from "next/link";
import { useState } from "react";
import type { Car, CarRateType, DriveMode } from "@/lib/types";
import { CarCard } from "./CarCard";
import { CurrencyToggle } from "./Currency";

/** Fleet grid with chauffeur/self-drive and hourly/daily/weekly switches. */
export function CarsBrowser({ cars }: { cars: Car[] }) {
  const [mode, setMode] = useState<DriveMode>("chauffeur");
  const [rate, setRate] = useState<CarRateType>("daily");
  const effectiveMode = rate === "hourly" ? "chauffeur" : mode;
  const list = effectiveMode === "self" ? cars.filter((c) => c.selfDrive) : cars;

  const seg = (active: boolean) => `rounded-full px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition ${active ? "bg-ink text-ivory" : "text-stone hover:text-ink"}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <div role="radiogroup" aria-label="Driving" className="inline-flex rounded-full border border-line bg-white p-1">
            {(["chauffeur", "self"] as const).map((m) => (
              <button key={m} type="button" role="radio" aria-checked={effectiveMode === m} disabled={m === "self" && rate === "hourly"} onClick={() => setMode(m)} className={`${seg(effectiveMode === m)} disabled:opacity-40`}>
                {m === "chauffeur" ? "With chauffeur" : "Self-drive"}
              </button>
            ))}
          </div>
          <div role="radiogroup" aria-label="Rate" className="inline-flex rounded-full border border-line bg-white p-1">
            {(["hourly", "daily", "weekly"] as const).map((r) => (
              <button key={r} type="button" role="radio" aria-checked={rate === r} onClick={() => setRate(r)} className={seg(rate === r)}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <CurrencyToggle tone="dark" />
      </div>
      <p className="mt-4 text-sm text-stone">
        {rate === "hourly"
          ? "Hourly hire is always chauffeur-driven, with a 4-hour minimum."
          : effectiveMode === "chauffeur"
            ? "Chauffeur fee is added per day at checkout. Fuel within Lagos is included."
            : "Self-drive requires a valid driver's licence, aged 25+, and a refundable deposit."}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <CarCard
            key={c.id}
            car={c}
            rateType={rate}
            action={
              <Link href={`/book?car=${c.slug}&mode=${effectiveMode}&rate=${rate}`} className="btn-ink px-5 py-2.5">
                Book
              </Link>
            }
          />
        ))}
      </div>
    </>
  );
}
