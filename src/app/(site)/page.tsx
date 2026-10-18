import Link from "next/link";
import { amenityLabels } from "@/components/amenities";
import { ApartmentCard } from "@/components/ApartmentCard";
import { Price } from "@/components/Currency";
import { Icon, WhatsAppIcon } from "@/components/icons/Icon";
import { JsonLd } from "@/components/JsonLd";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Reviews } from "@/components/Reviews";
import { ScrollHero } from "@/components/ScrollHero";
import { SectionHeading } from "@/components/SectionHeading";
import { getApartments, getCars } from "@/lib/db";
import { instagramPhotos, reviews } from "@/lib/seed";
import { heroStatement, instagramLink, locations, site, whatsappLink } from "@/lib/site";
import type { AmenityKey } from "@/lib/types";

export const revalidate = 300;

const heroSlides = [
  { src: "photo-1600210492486-724fe5c67fb0", alt: "Sunlit living room with cream sofas in a Lumière apartment" },
  { src: "photo-1618773928121-c32242e63f39", alt: "Hotel-style bedroom with soft lighting" },
  { src: "photo-1571896349842-33c89424de2d", alt: "Residents' pool glowing at dusk" },
];

const amenityStrip: AmenityKey[] = ["power", "security", "wifi", "netflix", "housekeeping", "pool", "gym", "parking"];

const steps = [
  { title: "Choose your home", text: "Pick an apartment in Ikoyi or Lekki and see live availability for your dates." },
  { title: "Add a car", text: "Chauffeur or self-drive, by the hour, day or week. Airport pickup at MMIA in one click." },
  { title: "Pay securely", text: "Card or bank via Paystack or Flutterwave, or by direct transfer. Instant confirmation." },
  { title: "Arrive to a waiting driver", text: "We track your flight, meet you at arrivals and hand you the keys to a home that's ready." },
];

export default async function HomePage() {
  const [apartments, cars] = await Promise.all([getApartments(), getCars()]);
  const featured = apartments.filter((a) => a.featured).slice(0, 3);
  const fromRate = Math.min(...apartments.map((a) => a.nightlyRate));
  const carFrom = Math.min(...cars.map((c) => c.rates.daily));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LodgingBusiness",
          name: site.name,
          description: site.description,
          url: site.url,
          telephone: site.phone,
          email: site.email,
          image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200",
          priceRange: "₦₦₦",
          address: { "@type": "PostalAddress", addressLocality: "Lagos", addressRegion: "Lagos", addressCountry: "NG" },
          areaServed: ["Ikoyi", "Lekki", "Victoria Island", "Lagos"],
          amenityFeature: amenityStrip.map((k) => ({ "@type": "LocationFeatureSpecification", name: amenityLabels[k], value: true })),
          aggregateRating: { "@type": "AggregateRating", ratingValue: 4.96, reviewCount: apartments.reduce((s, a) => s + a.reviewCount, 0) },
          sameAs: [instagramLink],
        }}
      />

      {/* ------------------------------ HERO (pinned scroll sequence) ------------------------------ */}
      <ScrollHero slides={heroSlides} />

      {/* ------------------------------ INTRO ------------------------------ */}
      <section className="grid-lines py-24 sm:py-36">
        <div className="container-x grid grid-cols-1 gap-14 lg:grid-cols-[0.8fr_1.6fr]">
          <Reveal>
            <p className="eyebrow text-bronze">The Lumière way</p>
            <span className="gold-rule mt-5" />
          </Reveal>
          <div>
            <Reveal>
              {/* The scroll hero reveals this line; shown here only when motion is reduced */}
              <p className="hidden font-serif text-3xl font-light leading-[1.2] motion-reduce:block sm:text-[2.75rem]">{heroStatement}</p>
              <h2 className="font-serif text-3xl font-light leading-[1.2] motion-reduce:hidden sm:text-[2.75rem]">Lagos, elevated. Every detail handled, so the city is yours to enjoy.</h2>
            </Reveal>
            <Reveal delay={150}>
              <dl className="mt-14 grid grid-cols-2 gap-8 border-t border-line pt-10 sm:grid-cols-4">
                {[
                  ["24/7", "Power, never a flicker"],
                  ["4.96", "Average guest rating"],
                  ["15 min", "To Victoria Island"],
                  ["1", "Booking for stay & car"],
                ].map(([n, l]) => (
                  <div key={l}>
                    <dt className="sr-only">{l}</dt>
                    <dd className="font-serif text-5xl font-light text-ink">{n}</dd>
                    <dd className="mt-2 text-sm text-stone">{l}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------ FEATURED ------------------------------ */}
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Featured residences"
              title={
                <>
                  Homes worth <em className="text-bronze">coming back</em> to
                </>
              }
              intro={
                <>
                  From one-bedroom hideaways to a four-bedroom penthouse. Nightly rates from <Price ngn={fromRate} />.
                </>
              }
            />
            <Link href="/apartments" className="btn-ghost">
              All apartments <Icon name="arrow" className="h-4 w-4" />
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 mt-14 flex snap-x snap-mandatory scroll-px-4 gap-5 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0">
            {featured.map((a, i) => (
              <Reveal key={a.id} delay={i * 120} className="w-[82vw] shrink-0 snap-start md:w-auto">
                <ApartmentCard apt={a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ LOCATIONS ------------------------------ */}
      <section className="bg-cream/60 py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading eyebrow="Our locations" title="Two neighbourhoods. One standard." align="center" />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {Object.values(locations).map((l, i) => {
              const count = apartments.filter((a) => a.location === l.slug).length;
              return (
                <Reveal key={l.slug} delay={i * 150}>
                  <Link href={`/locations/${l.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-ink text-ivory sm:aspect-[5/6]">
                    <Photo src={l.image} alt={`${l.name}, Lagos`} fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover opacity-80 transition-transform duration-[2s] group-hover:scale-105" />
                    <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
                    <span className="absolute left-6 top-6 text-[0.68rem] tracking-[0.3em] text-ivory/80">[ {l.coords} ]</span>
                    <span className="absolute inset-x-6 bottom-6 sm:inset-x-10 sm:bottom-10">
                      <span className="eyebrow text-gold">{count} residences</span>
                      <span className="display mt-3 block text-6xl sm:text-8xl">{l.name}</span>
                      <span className="mt-4 block max-w-md text-sm leading-relaxed text-ivory/80">{l.blurb}</span>
                      <span className="mt-6 inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.25em] text-gold">
                        Explore {l.name} <Icon name="arrow" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------ CAR TEASER ------------------------------ */}
      <section className="relative overflow-hidden bg-ink py-24 text-ivory sm:py-32">
        <div className="container-x grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              tone="dark"
              eyebrow="Lumière Drive"
              title={
                <>
                  Your ride <em className="text-gold">is ready</em>
                </>
              }
              intro="Add a car to any stay, or book one on its own. Uniformed chauffeurs who know the island, or the keys for a self-drive. From airport arrivals to a late dinner in VI."
            />
            <Reveal delay={150}>
              <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  ["plane", "MMIA airport pickup", "We track your flight; delays cost you nothing."],
                  ["chauffeur", "Chauffeur or self-drive", "Vetted, uniformed and discreet drivers."],
                  ["clock", "Hourly, daily, weekly", "Weekly rates apply automatically."],
                  ["shield", "Fully insured fleet", "Serviced every month, spotless every trip."],
                ].map(([icon, t, d]) => (
                  <li key={t} className="flex gap-4 border-t border-white/10 pt-4">
                    <Icon name={icon} className="h-6 w-6 shrink-0 text-gold" />
                    <span>
                      <span className="block font-serif text-xl">{t}</span>
                      <span className="text-sm text-ivory/60">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/cars" className="btn-gold">
                  View the fleet
                </Link>
                <p className="text-sm text-ivory/60">
                  From <Price ngn={carFrom} className="text-ivory" /> a day
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[5/4] lg:aspect-[4/5]">
              <Photo src="photo-1669234226129-8ede05b40eff" alt="A white Mercedes-Benz GLE waiting on a city street" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 left-4 right-4 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-ink/80 p-3 backdrop-blur-xl sm:left-auto sm:right-6 sm:w-96">
              {cars.slice(0, 3).map((c) => (
                <Link key={c.id} href="/cars" className="group text-center">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-lg">
                    <Photo src={c.photo.src} alt={c.photo.alt} fill sizes="120px" className="object-cover transition group-hover:scale-110" />
                  </span>
                  <span className="mt-1.5 block truncate text-[0.7rem] text-ivory/80">{c.name.replace("Toyota Land Cruiser ", "")}</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ AMENITIES ------------------------------ */}
      <section aria-labelledby="amenities-title" className="border-b border-line bg-ivory py-16">
        <div className="container-x">
          <h2 id="amenities-title" className="eyebrow text-center text-bronze">
            In every residence
          </h2>
          <ul className="mt-10 grid grid-cols-2 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
            {amenityStrip.map((k, i) => (
              <Reveal as="li" key={k} delay={i * 60} className="flex flex-col items-center gap-3 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/50">
                  <Icon name={k} className="h-6 w-6 text-bronze" />
                </span>
                <span className="text-[0.8rem] text-ink">{amenityLabels[k]}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------ HOW IT WORKS ------------------------------ */}
      <section className="grid-lines py-24 sm:py-32">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="One booking. Everything arranged." />
          <ol className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 120} className="bg-ivory p-8">
                <span className="font-serif text-6xl font-light text-gold">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-serif text-2xl">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-stone">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------ REVIEWS ------------------------------ */}
      <section className="relative isolate overflow-hidden bg-ink py-24 text-ivory sm:py-32" aria-label="Guest reviews">
        <Photo src="photo-1582719478250-c89cae4dc85b" alt="" fill sizes="100vw" className="-z-10 object-cover opacity-20" />
        <div className="container-x">
          <Reviews reviews={reviews} />
        </div>
      </section>

      {/* ------------------------------ INSTAGRAM ------------------------------ */}
      <section className="py-24 sm:py-32">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow={`@${site.instagram}`} title="Life at Lumière" />
            <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="btn-ghost">
              <Icon name="instagram" className="h-4 w-4" /> Follow us
            </a>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {instagramPhotos.map((p, i) => (
              <Reveal as="li" key={p.src} delay={i * 70}>
                <a href={instagramLink} target="_blank" rel="noopener noreferrer" className="group relative block aspect-square overflow-hidden rounded-xl">
                  <Photo src={p.src} alt={p.alt} fill sizes="(min-width:1024px) 16vw, (min-width:640px) 33vw, 50vw" className="object-cover transition duration-700 group-hover:scale-110" />
                  <span className="absolute inset-0 grid place-items-center bg-ink/0 text-ivory opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">
                    <Icon name="instagram" className="h-7 w-7" />
                  </span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------ WHATSAPP CTA ------------------------------ */}
      <section className="pb-24 sm:pb-32">
        <div className="container-x">
          <Reveal className="relative overflow-hidden rounded-3xl bg-ink px-6 py-16 text-center text-ivory sm:px-16 sm:py-20">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
            <p className="eyebrow text-gold">Prefer to talk?</p>
            <h2 className="h-section mx-auto mt-5 max-w-2xl">Our hosts are on WhatsApp, day and night.</h2>
            <p className="mx-auto mt-5 max-w-lg text-ivory/70">
              Tell us your dates and we&apos;ll reply within minutes with availability, a car and anything else you need.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a href={whatsappLink("Hello Lumière, I'd like to check availability.")} target="_blank" rel="noopener noreferrer" className="btn bg-[#1F7A4D] text-white hover:bg-[#25915c]">
                <WhatsAppIcon className="h-4 w-4" /> Chat on WhatsApp
              </a>
              <Link href="/book" className="btn-ghost-light">
                Book online
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
