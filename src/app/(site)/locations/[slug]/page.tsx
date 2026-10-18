import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ApartmentsBrowser } from "@/components/ApartmentsBrowser";
import { Icon } from "@/components/icons/Icon";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { unavailableNights } from "@/lib/availability";
import { getApartments } from "@/lib/db";
import { naira } from "@/lib/pricing";
import { locations, site, type LocationSlug } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(locations).map((slug) => ({ slug }));
}

const intros: Record<LocationSlug, string> = {
  ikoyi:
    "Looking for a shortlet in Ikoyi? Our serviced apartments sit on quiet, leafy streets minutes from Victoria Island, the best restaurants on the island and the embassies. Every home has 24/7 power, security, fibre Wi-Fi and daily housekeeping, and a chauffeur-driven car can be waiting when you land.",
  lekki:
    "Looking for a shortlet in Lekki? Our Lekki Phase 1, Oniru and Chevron residences put you close to the beach clubs, rooftop bars and Lekki–Ikoyi Link Bridge, with the space of a home and the service of a boutique hotel. Add a car and airport pickup in the same booking.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug as LocationSlug;
  const loc = locations[slug];
  if (!loc) return {};
  return {
    title: `Shortlet Apartments in ${loc.name}, Lagos | Luxury Serviced Stays`,
    description: `Luxury shortlet apartments in ${loc.name}, Lagos with 24/7 power, security, Wi-Fi, Netflix and housekeeping. Add a chauffeur-driven car and MMIA airport pickup. Book online.`,
    alternates: { canonical: `/locations/${slug}` },
  };
}

export default async function LocationPage({ params }: Props) {
  const slug = (await params).slug as LocationSlug;
  const loc = locations[slug];
  if (!loc) notFound();
  const apartments = (await getApartments()).filter((a) => a.location === slug);
  const blocked = Object.fromEntries(await Promise.all(apartments.map(async (a) => [a.id, await unavailableNights(a.id)] as const)));
  const from = apartments.length ? Math.min(...apartments.map((a) => a.nightlyRate)) : 0;
  const other = Object.values(locations).find((l) => l.slug !== slug)!;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Shortlet apartments in ${loc.name}`,
          itemListElement: apartments.map((a, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/apartments/${a.slug}`, name: a.name })),
        }}
      />
      <PageHero
        eyebrow={`Shortlets in ${loc.name}, Lagos`}
        title={<>{loc.name}</>}
        intro={loc.blurb}
        image={loc.image}
        alt={`${loc.name}, Lagos`}
        coords={loc.coords}
        size="md"
      >
        <ul className="mt-8 flex flex-wrap gap-2">
          {loc.highlights.map((h) => (
            <li key={h} className="rounded-full border border-white/25 px-4 py-2 text-xs text-ivory/85">
              {h}
            </li>
          ))}
        </ul>
      </PageHero>
      <section className="container-x py-14">
        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
          <p className="text-[1.05rem] leading-[1.85] text-stone">{intros[slug]}</p>
          {from > 0 && (
            <p className="lg:text-right">
              <span className="eyebrow text-bronze">Nightly from</span>
              <span className="mt-2 block font-serif text-5xl">{naira(from)}</span>
            </p>
          )}
        </div>
        <Suspense>
          <ApartmentsBrowser apartments={apartments} blocked={blocked} fixedLocation={slug} />
        </Suspense>
        <Link href={`/locations/${other.slug}`} className="card mt-16 flex items-center justify-between p-8 transition hover:border-ink">
          <span>
            <span className="eyebrow text-bronze">Also explore</span>
            <span className="mt-2 block font-serif text-3xl">Shortlets in {other.name}</span>
          </span>
          <Icon name="arrow" className="h-6 w-6" />
        </Link>
      </section>
    </>
  );
}
