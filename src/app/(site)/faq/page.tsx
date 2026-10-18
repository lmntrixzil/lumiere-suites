import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { faqGroups } from "@/lib/faq";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ: Caution Fee, ID, Power, Cancellation & Car Rental",
  description: "Answers about caution fees, ID requirements, party policy, 24/7 power, early check-in, cancellation and car rental at Lumière Suites in Lagos.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqGroups.flatMap((g) => g.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } }))),
        }}
      />
      <PageHero eyebrow="Good to know" title="Questions, answered" image="photo-1616486338812-3dadae4b4ace" alt="Neutral living room" size="sm" />
      <section className="container-x grid grid-cols-1 gap-12 py-16 sm:py-24 lg:grid-cols-[240px_1fr]">
        <nav aria-label="FAQ sections" className="lg:sticky lg:top-28 lg:h-fit">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-3">
            {faqGroups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="rounded-full border border-line px-4 py-2 text-sm hover:border-ink lg:border-0 lg:px-0 lg:py-0 lg:hover:text-bronze">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-16">
          {faqGroups.map((g) => (
            <section key={g.id} id={g.id} aria-labelledby={`${g.id}-h`} className="scroll-mt-28">
              <h2 id={`${g.id}-h`} className="font-serif text-4xl">
                {g.title}
              </h2>
              <div className="mt-6 divide-y divide-line border-y border-line">
                {g.items.map((i) => (
                  <details key={i.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-lg [&::-webkit-details-marker]:hidden">
                      {i.q}
                      <Icon name="plus" className="h-5 w-5 shrink-0 text-bronze transition group-open:rotate-45" />
                    </summary>
                    <p className="mt-3 max-w-3xl leading-relaxed text-stone">{i.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
          <div className="card flex flex-col items-start justify-between gap-4 p-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-serif text-2xl">Still have a question?</p>
              <p className="text-stone">We reply on WhatsApp within minutes.</p>
            </div>
            <div className="flex gap-3">
              <a href={whatsappLink("Hello, I have a question about Lumière Suites.")} className="btn-ink">
                WhatsApp us
              </a>
              <Link href="/contact" className="btn-ghost">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
