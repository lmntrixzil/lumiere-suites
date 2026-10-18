"use client";
import type { Car } from "@/lib/types";
import { Price } from "./Currency";
import { Icon } from "./icons/Icon";
import { Photo } from "./Photo";

export function CarCard({ car, rateType = "daily", action }: { car: Car; rateType?: "hourly" | "daily" | "weekly"; action?: React.ReactNode }) {
  const unit = { hourly: "hour", daily: "day", weekly: "week" }[rateType];
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-cream">
        <Photo src={car.photo.src} alt={car.photo.alt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" className="object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-ink/85 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-gold backdrop-blur">
          <Icon name="chauffeur" className="h-3.5 w-3.5" /> With chauffeur
        </span>
        {car.selfDrive && (
          <span className="absolute right-3 top-3 rounded-full bg-ivory/90 px-3 py-1.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-ink">Self-drive option</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow text-bronze">{car.category}</p>
        <h3 className="mt-2 font-serif text-[1.6rem] leading-tight">{car.name}</h3>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8rem] text-stone">
          <li className="flex items-center gap-1.5">
            <Icon name="seat" className="h-4 w-4 text-bronze" /> {car.seats} seats
          </li>
          <li className="flex items-center gap-1.5">
            <Icon name="gear" className="h-4 w-4 text-bronze" /> {car.transmission}
          </li>
        </ul>
        <ul className="mt-3 space-y-1 text-[0.8rem] text-stone">
          {car.features.slice(0, 3).map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Icon name="check" className="h-3.5 w-3.5 text-bronze" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <p>
            <span className="text-xs text-stone">From </span>
            <Price ngn={car.rates[rateType]} className="font-serif text-2xl" />
            <span className="text-xs text-stone"> / {unit}</span>
          </p>
          {action}
        </div>
      </div>
    </article>
  );
}
