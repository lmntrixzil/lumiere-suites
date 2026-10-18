import type { Metadata } from "next";
import { Suspense } from "react";
import { Checkout } from "@/components/Checkout";
import { unavailableCarDays, unavailableNights } from "@/lib/availability";
import { getApartments, getCars, getSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Your Stay & Car",
  description: "Book a Lumière Suites apartment in Ikoyi or Lekki, add a chauffeur-driven car and airport pickup, and pay securely in one checkout.",
  alternates: { canonical: "/book" },
  robots: { index: false },
};

export default async function BookPage() {
  const [apartments, cars, settings] = await Promise.all([getApartments(), getCars(), getSettings()]);
  const [aptBlocked, carBlocked] = await Promise.all([
    Promise.all(apartments.map(async (a) => [a.id, await unavailableNights(a.id)] as const)).then(Object.fromEntries),
    Promise.all(cars.map(async (c) => [c.id, await unavailableCarDays(c.id)] as const)).then(Object.fromEntries),
  ]);
  return (
    <>
      <div className="bg-ink pb-12 pt-32 text-ivory sm:pt-40">
        <div className="container-x">
          <p className="eyebrow text-gold">Reservations</p>
          <h1 className="display mt-4 text-5xl sm:text-7xl">
            Book your stay <em className="text-gold">&amp; ride</em>
          </h1>
        </div>
      </div>
      <section className="container-x py-12 sm:py-16">
        <Suspense>
          <Checkout
            apartments={apartments}
            cars={cars}
            settings={settings}
            aptBlocked={aptBlocked}
            carBlocked={carBlocked}
            paystackKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
            flutterwaveKey={process.env.NEXT_PUBLIC_FLW_PUBLIC_KEY}
          />
        </Suspense>
      </section>
    </>
  );
}
