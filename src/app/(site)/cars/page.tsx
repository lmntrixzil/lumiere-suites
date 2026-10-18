import type { Metadata } from "next";
import Link from "next/link";
import { CarsBrowser } from "@/components/CarsBrowser";
import { Price } from "@/components/Currency";
import { Icon } from "@/components/icons/Icon";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { getCars, getSettings } from "@/lib/db";
import { site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Luxury Car Rental in Lagos with Chauffeur | Airport Pickup MMIA",
  description:
    "Rent a Toyota Prado, Lexus RX, Mercedes GLE, Range Rover or Toyota Hiace in Lagos. Chauffeur-driven or self-drive, hourly, daily or weekly, with MMIA airport pickup. Book alone or with your stay.",
  alternates: { canonical: "/cars" },
};

export default async function CarsPage() {
  const [cars, settings] = await Promise.all([getCars(), getSettings()]);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AutoRental",
          name: `${site.name} Drive`,
          url: `${site.url}/cars`,
          telephone: site.phone,
          areaServed: "Lagos, Nigeria",
          address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
          makesOffer: cars.map((c) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Car", name: c.name, seatingCapacity: c.seats, vehicleTransmission: c.transmission },
            priceSpecification: { "@type": "UnitPriceSpecification", price: c.rates.daily, priceCurrency: "NGN", unitText: "DAY" },
          })),
        }}
      />
      <PageHero
        eyebrow="Lumière Drive · Car rental in Lagos"
        title={
          <>
            Your ride <em className="text-gold">is ready</em>
          </>
        }
        intro="Chauffeur-driven or self-drive. Book a car on its own, or add one to your stay and we'll have it waiting at arrivals."
        image="photo-1669221817458-63a3da4ddecb"
        alt="A white Mercedes-Benz GLE, front view"
        size="md"
      />

      <section className="container-x py-14 sm:py-20">
        <CarsBrowser cars={cars} />
      </section>

      <section className="bg-ink py-20 text-ivory sm:py-28">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <SectionHeading
            tone="dark"
            eyebrow="Airport transfers"
            title="Met at MMIA, every time"
            intro="Your chauffeur tracks your flight, waits at arrivals with a name board and helps with luggage. Delays never cost extra."
          />
          <Reveal delay={150} className="grid gap-4 sm:grid-cols-2">
            {[
              ["plane", "Pickup or drop-off", <>Flat <Price key="p" ngn={settings.airportTransferFee} /> each way, any car in the fleet</>],
              ["clock", "Flight tracking", <>Add your flight number at checkout and we&apos;ll adjust to your landing time</>],
              ["users", "Groups", <>The Toyota Hiace seats 12 with room for luggage</>],
              ["shield", "Safe & insured", <>Comprehensive insurance and vetted, uniformed drivers</>],
            ].map(([icon, t, d], i) => (
              <div key={i} className="rounded-2xl border border-white/10 p-6">
                <Icon name={icon as string} className="h-6 w-6 text-gold" />
                <p className="mt-4 font-serif text-2xl">{t}</p>
                <p className="mt-2 text-sm text-ivory/65">{d}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="container-x grid gap-10 py-20 sm:py-28 lg:grid-cols-2">
        <Reveal className="card p-8 sm:p-10">
          <p className="eyebrow text-bronze">Staying with us?</p>
          <h2 className="mt-4 font-serif text-4xl">Add a car to your apartment booking</h2>
          <p className="mt-4 text-stone">One checkout, one payment. Weekly rates apply automatically, and the car is ready the day you arrive.</p>
          <Link href="/apartments?car=1" className="btn-ink mt-8">
            Find an apartment
          </Link>
        </Reveal>
        <Reveal delay={120} className="card p-8 sm:p-10">
          <p className="eyebrow text-bronze">Rental rules</p>
          <ul className="mt-5 space-y-3 text-sm text-stone">
            {[
              "Self-drive: aged 25+, full licence held for 3+ years, refundable deposit",
              "Chauffeur hours: up to 12 hours a day; overtime billed hourly",
              "Fuel within Lagos included with a chauffeur; self-drive returns full",
              "Trips outside Lagos State by prior arrangement",
              "No smoking in any vehicle",
            ].map((r) => (
              <li key={r} className="flex gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-bronze" />
                {r}
              </li>
            ))}
          </ul>
          <Link href="/faq#cars" className="mt-6 inline-block text-sm text-bronze underline underline-offset-4">
            Read the full car rental FAQ
          </Link>
        </Reveal>
      </section>
    </>
  );
}
