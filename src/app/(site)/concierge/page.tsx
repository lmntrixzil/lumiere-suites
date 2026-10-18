import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { experiences } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Concierge & Experiences in Lagos",
  description: "Airport transfers, private chefs, event setups, city tours, grocery stocking and in-suite wellness, arranged by the Lumière Suites concierge in Lagos.",
  alternates: { canonical: "/concierge" },
};

export default function ConciergePage() {
  return (
    <>
      <PageHero
        eyebrow="Concierge & experiences"
        title={
          <>
            Anything you need, <em className="text-gold">already arranged</em>
          </>
        }
        intro="Our concierge knows Lagos inside out. Tell us what would make your stay perfect and consider it done."
        image="photo-1414235077428-338989a2e8c0"
        alt="A chef finishing a plated dish"
      />
      <section className="grid-lines py-20 sm:py-28">
        <div className="container-x grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {experiences.map((x, i) => (
            <Reveal key={x.slug} delay={(i % 3) * 120} as="article">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Photo src={x.photo.src} alt={x.photo.alt} fill sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" className="object-cover transition duration-1000 hover:scale-105" />
              </div>
              <p className="mt-6 font-serif text-5xl font-light text-gold">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 font-serif text-3xl">{x.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-stone">{x.text}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <section id="request" className="bg-cream/60 py-20 sm:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <SectionHeading eyebrow="Make a request" title="Tell us what you have in mind" intro="Requests are confirmed with a quote before anything is booked. Already staying with us? Include your booking reference." />
          <EnquiryForm kind="concierge" services={experiences.map((x) => x.title)} />
        </div>
      </section>
    </>
  );
}
