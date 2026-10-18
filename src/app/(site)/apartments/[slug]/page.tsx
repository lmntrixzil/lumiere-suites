import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { amenityLabels } from "@/components/amenities";
import { ApartmentCard } from "@/components/ApartmentCard";
import { BookingCard } from "@/components/BookingCard";
import { Price } from "@/components/Currency";
import { Gallery } from "@/components/Gallery";
import { Icon } from "@/components/icons/Icon";
import { JsonLd } from "@/components/JsonLd";
import { MobileReserveBar } from "@/components/MobileReserveBar";
import { Reveal } from "@/components/Reveal";
import { unavailableNights } from "@/lib/availability";
import { getApartmentBySlug, getApartments, getCars, getSettings } from "@/lib/db";
import { imgSrc } from "@/lib/img";
import { cancellationPolicy, cautionPolicy } from "@/lib/policies";
import { naira } from "@/lib/pricing";
import { locations, site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const apt = await getApartmentBySlug((await params).slug);
  if (!apt) return {};
  const loc = locations[apt.location].name;
  return {
    title: `${apt.name}: ${apt.bedrooms}-Bedroom Shortlet in ${loc}`,
    description: `${apt.tagline}. ${apt.bedrooms}-bedroom serviced shortlet in ${loc}, Lagos for up to ${apt.maxGuests} guests, from ${naira(apt.nightlyRate)} a night. 24/7 power, security and Wi-Fi.`,
    alternates: { canonical: `/apartments/${apt.slug}` },
    openGraph: { images: [{ url: imgSrc(apt.photos[0]?.src ?? "", 1200), alt: apt.photos[0]?.alt }] },
  };
}

export default async function ApartmentPage({ params }: Props) {
  const apt = await getApartmentBySlug((await params).slug);
  if (!apt) notFound();
  const [cars, settings, blocked, all] = await Promise.all([getCars(), getSettings(), unavailableNights(apt.id), getApartments()]);
  const loc = locations[apt.location];
  const similar = all.filter((a) => a.id !== apt.id).sort((a, b) => Number(b.location === apt.location) - Number(a.location === apt.location)).slice(0, 3);
  const bbox = [loc.lng - 0.014, loc.lat - 0.009, loc.lng + 0.014, loc.lat + 0.009].join(",");

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Apartment",
            name: apt.name,
            description: apt.description,
            url: `${site.url}/apartments/${apt.slug}`,
            image: apt.photos.map((p) => imgSrc(p.src, 1200)),
            numberOfRooms: apt.bedrooms,
            numberOfBedrooms: apt.bedrooms,
            numberOfBathroomsTotal: apt.bathrooms,
            occupancy: { "@type": "QuantitativeValue", maxValue: apt.maxGuests },
            floorSize: { "@type": "QuantitativeValue", value: apt.sizeSqm, unitCode: "MTK" },
            amenityFeature: apt.amenities.map((k) => ({ "@type": "LocationFeatureSpecification", name: amenityLabels[k], value: true })),
            address: { "@type": "PostalAddress", addressLocality: loc.name, addressRegion: "Lagos", addressCountry: "NG" },
            geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng },
            aggregateRating: { "@type": "AggregateRating", ratingValue: apt.rating, reviewCount: apt.reviewCount },
            containedInPlace: { "@type": "LodgingBusiness", name: site.name, url: site.url },
            offers: { "@type": "Offer", price: apt.nightlyRate, priceCurrency: "NGN", unitText: "night", availability: "https://schema.org/InStock" },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: site.url },
              { "@type": "ListItem", position: 2, name: `Shortlets in ${loc.name}`, item: `${site.url}/locations/${loc.slug}` },
              { "@type": "ListItem", position: 3, name: apt.name, item: `${site.url}/apartments/${apt.slug}` },
            ],
          },
        ]}
      />

      {/* Dark band so the transparent header stays legible */}
      <div className="h-24 bg-ink sm:h-28" />

      <div className="container-x pt-6">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs uppercase tracking-[0.2em] text-stone">
          <Link href="/apartments" className="hover:text-ink">
            Apartments
          </Link>
          <span className="mx-2 text-gold">/</span>
          <Link href={`/locations/${loc.slug}`} className="hover:text-ink">
            {loc.name}
          </Link>
          <span className="mx-2 text-gold">/</span>
          <span className="text-ink">{apt.name}</span>
        </nav>
        <Gallery photos={apt.photos} name={apt.name} />
      </div>

      <div className="container-x grid grid-cols-1 gap-14 pb-24 pt-12 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0">
          <p className="eyebrow text-bronze">
            {loc.name} · {apt.area}
          </p>
          <h1 className="display mt-4 text-5xl sm:text-7xl">{apt.name}</h1>
          <p className="mt-4 font-serif text-2xl italic text-stone">{apt.tagline}</p>

          <ul className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-6 sm:grid-cols-4">
            {[
              ["bed", `${apt.bedrooms} bedroom${apt.bedrooms > 1 ? "s" : ""}`],
              ["bath", `${apt.bathrooms} bathrooms`],
              ["users", `Up to ${apt.maxGuests} guests`],
              ["area", `${apt.sizeSqm} m²`],
            ].map(([icon, label]) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <Icon name={icon} className="h-6 w-6 text-bronze" />
                {label}
              </li>
            ))}
          </ul>

          <Reveal>
            <p className="mt-10 text-[1.05rem] leading-[1.85] text-ink/85">{apt.description}</p>
          </Reveal>

          {/* Amenities */}
          <section className="mt-16" aria-labelledby="amenities">
            <h2 id="amenities" className="font-serif text-4xl">
              What&apos;s included
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {apt.amenities.map((k) => (
                <li key={k} className="flex items-center gap-3 text-sm">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50">
                    <Icon name={k} className="h-5 w-5 text-bronze" />
                  </span>
                  {amenityLabels[k]}
                </li>
              ))}
            </ul>
          </section>

          {/* Stay details */}
          <section className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2" aria-label="Stay details">
            <div className="card p-6">
              <Icon name="clock" className="h-6 w-6 text-bronze" />
              <h3 className="mt-4 font-serif text-2xl">Check-in &amp; out</h3>
              <dl className="mt-3 space-y-1.5 text-sm text-stone">
                <div className="flex justify-between">
                  <dt>Check-in</dt>
                  <dd className="text-ink">from {apt.checkIn}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Check-out</dt>
                  <dd className="text-ink">by {apt.checkOut}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Minimum stay</dt>
                  <dd className="text-ink">
                    {apt.minNights} night{apt.minNights > 1 ? "s" : ""}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-stone">Early check-in and late check-out on request, subject to availability.</p>
            </div>
            <div className="card p-6">
              <Icon name="key" className="h-6 w-6 text-bronze" />
              <h3 className="mt-4 font-serif text-2xl">Caution fee</h3>
              <p className="mt-3 font-serif text-3xl">
                <Price ngn={apt.cautionFee} />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone">{cautionPolicy}</p>
            </div>
            <div className="card p-6">
              <Icon name="shield" className="h-6 w-6 text-bronze" />
              <h3 className="mt-4 font-serif text-2xl">House rules</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                {apt.houseRules.map((r) => (
                  <li key={r} className="flex gap-2">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <Icon name="calendar" className="h-6 w-6 text-bronze" />
              <h3 className="mt-4 font-serif text-2xl">Cancellation</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                {cancellationPolicy.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Map */}
          <section className="mt-16" aria-labelledby="where">
            <h2 id="where" className="font-serif text-4xl">
              Where you&apos;ll be
            </h2>
            <p className="mt-3 text-stone">
              {apt.area}. {loc.blurb}
            </p>
            <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-cream sm:aspect-[16/8]">
              <iframe
                title={`Map of the ${loc.name} area`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`}
                className="absolute inset-0 h-full w-full grayscale-[0.6] sepia-[0.15]"
                loading="lazy"
              />
              {/* Approximate area, never the exact building */}
              <span className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold bg-gold/20" />
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-stone">
              <Icon name="pin" className="h-4 w-4 text-bronze" /> For your privacy and security, the exact address is shared after booking.
            </p>
          </section>
        </div>

        <aside className="lg:pt-2">
          <div className="lg:sticky lg:top-28">
            <Suspense>
              <BookingCard apt={apt} cars={cars} settings={settings} blocked={blocked} />
            </Suspense>
          </div>
        </aside>
      </div>

      {/* Mobile reserve bar */}
      <MobileReserveBar nightlyRate={apt.nightlyRate} />

      <section className="border-t border-line bg-cream/50 py-20">
        <div className="container-x">
          <h2 className="h-section">You may also like</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((a) => (
              <ApartmentCard key={a.id} apt={a} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
