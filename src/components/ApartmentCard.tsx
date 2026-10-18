"use client";
import Link from "next/link";
import { locations } from "@/lib/site";
import type { Apartment } from "@/lib/types";
import { Price } from "./Currency";
import { Icon } from "./icons/Icon";
import { Photo } from "./Photo";

export function ApartmentCard({ apt, query = "", priority = false }: { apt: Apartment; query?: string; priority?: boolean }) {
  const href = `/apartments/${apt.slug}${query}`;
  return (
    <article className="group relative flex h-full flex-col">
      <Link href={href} className="relative block aspect-[4/5] overflow-hidden rounded-2xl bg-cream" aria-label={`${apt.name}, view apartment`}>
        <Photo
          src={apt.photos[0]?.src}
          alt={apt.photos[0]?.alt ?? apt.name}
          fill
          priority={priority}
          sizes="(min-width:1280px) 30vw, (min-width:768px) 45vw, 92vw"
          className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.05]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-ivory/90 px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.22em] text-ink backdrop-blur">
          {locations[apt.location].name}
        </span>
        <span className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-ivory">
          <span className="flex items-center gap-1 text-sm">
            <Icon name="star" className="h-3.5 w-3.5 fill-gold text-gold" />
            {apt.rating.toFixed(2)} <span className="text-ivory/70">({apt.reviewCount})</span>
          </span>
          <span className="text-right">
            <Price ngn={apt.nightlyRate} className="font-serif text-2xl" />
            <span className="text-xs text-ivory/75"> / night</span>
          </span>
        </span>
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="font-serif text-[1.7rem] leading-tight">
          <Link href={href} className="hover:text-bronze">
            {apt.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-stone">{apt.area}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem] text-stone">
          <li className="flex items-center gap-1.5">
            <Icon name="bed" className="h-4 w-4 text-bronze" />
            {apt.bedrooms} bedroom{apt.bedrooms > 1 ? "s" : ""}
          </li>
          <li className="flex items-center gap-1.5">
            <Icon name="users" className="h-4 w-4 text-bronze" />
            Up to {apt.maxGuests} guests
          </li>
          <li className="flex items-center gap-1.5">
            <Icon name="area" className="h-4 w-4 text-bronze" />
            {apt.sizeSqm} m²
          </li>
        </ul>
        <div className="mt-auto pt-5">
          <Link href={href} className="btn-ghost w-full">
            View apartment <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
