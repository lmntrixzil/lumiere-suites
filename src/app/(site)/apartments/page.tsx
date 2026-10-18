import type { Metadata } from "next";
import { Suspense } from "react";
import { ApartmentsBrowser } from "@/components/ApartmentsBrowser";
import { PageHero } from "@/components/PageHero";
import { unavailableNights } from "@/lib/availability";
import { getApartments } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Luxury Shortlet Apartments in Ikoyi & Lekki",
  description:
    "Browse serviced shortlet apartments in Ikoyi and Lekki, Lagos: 24/7 power, security, fibre Wi-Fi, pools and daily housekeeping. Live availability and instant booking.",
  alternates: { canonical: "/apartments" },
};

export default async function ApartmentsPage() {
  const apartments = await getApartments();
  const blocked = Object.fromEntries(await Promise.all(apartments.map(async (a) => [a.id, await unavailableNights(a.id)] as const)));
  return (
    <>
      <PageHero
        eyebrow="The residences"
        title={
          <>
            Shortlet apartments in <em className="text-gold">Ikoyi</em> &amp; <em className="text-gold">Lekki</em>
          </>
        }
        intro="Every home is serviced daily, powered around the clock and watched over by our own security team."
        image="photo-1598928506311-c55ded91a20c"
        alt="Double-height living room in white and oak"
        size="sm"
      />
      <section className="container-x py-12 sm:py-16">
        <Suspense>
          <ApartmentsBrowser apartments={apartments} blocked={blocked} />
        </Suspense>
      </section>
    </>
  );
}
