import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About Lumière Suites",
  description: "The story behind Lumière Suites: boutique-hotel service, serviced apartments and private cars in Ikoyi and Lekki, Lagos.",
  alternates: { canonical: "/about" },
};

const pillars = [
  ["power", "Nothing left to chance", "Inverter and generator backup in every home, water treatment, and our own security on site. The basics, done properly, every night."],
  ["sparkle", "Hotel standards, home comforts", "Hotel-grade linen and toiletries, daily housekeeping, and a kitchen you can actually cook in."],
  ["car", "Stay and move as one", "The only Lagos shortlet brand with its own chauffeur fleet. Your car is part of the booking, not an afterthought."],
  ["concierge", "A host, not a helpline", "One named host for your whole stay, on WhatsApp day and night, who knows your name before you arrive."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={
          <>
            Light, space and <em className="text-gold">quiet</em>, in the heart of Lagos
          </>
        }
        image="photo-1600607687939-ce8a6c25118c"
        alt="Calm, open living room"
      />
      <section className="grid-lines py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="font-serif text-3xl font-light leading-snug sm:text-4xl">
              Lumière began with a simple frustration: arriving in Lagos to a beautiful apartment, then waiting an hour for a taxi, or losing power at midnight.
            </p>
          </Reveal>
          <Reveal delay={150} className="space-y-6 text-[1.02rem] leading-[1.85] text-stone">
            <p>
              We set out to build the stay we wanted for ourselves and our families coming home: the calm of a boutique hotel, the space and privacy of a real home, and a trusted car and driver from the moment you land.
            </p>
            <p>
              Today Lumière Suites looks after a small collection of residences in Ikoyi and Lekki, each chosen for its light, its street and its building, then furnished, powered and staffed to a single standard. We would rather have fewer homes, done properly.
            </p>
            <p>Lumière means light. It&apos;s what we look for in every apartment, and how we hope you feel when you leave.</p>
          </Reveal>
        </div>
      </section>
      <section className="bg-ink py-24 text-ivory sm:py-32">
        <div className="container-x">
          <SectionHeading tone="dark" eyebrow="What makes Lumière different" title="Four promises we keep" />
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2">
            {pillars.map(([icon, t, d], i) => (
              <Reveal key={t} delay={i * 100} className="bg-ink p-8 sm:p-10">
                <Icon name={icon} className="h-8 w-8 text-gold" />
                <h3 className="mt-6 font-serif text-3xl">{t}</h3>
                <p className="mt-3 text-ivory/65">{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="container-x grid items-center gap-12 py-24 sm:py-32 lg:grid-cols-2">
        <Reveal className="relative aspect-[4/5] overflow-hidden rounded-3xl">
          <Photo src="photo-1631049307264-da0ec9d70304" alt="Bedroom prepared for arrival" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
        </Reveal>
        <Reveal delay={150}>
          <p className="eyebrow text-bronze">Come and stay</p>
          <h2 className="h-section mt-5">We&apos;ll leave the light on.</h2>
          <p className="mt-5 max-w-md text-stone">Browse the residences, add a car, and let us take care of everything in between.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apartments" className="btn-ink">
              See the apartments
            </Link>
            <Link href="/contact" className="btn-ghost">
              Get in touch
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
