import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Icon, WhatsAppIcon } from "@/components/icons/Icon";
import { PageHero } from "@/components/PageHero";
import { instagramLink, site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact Lumière Suites in Lagos by WhatsApp, phone, email or Instagram. Our guest line is open 24/7.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const channels = [
    { icon: <WhatsAppIcon className="h-5 w-5" />, label: "WhatsApp", value: "Chat with a host", href: whatsappLink("Hello Lumière Suites!") },
    { icon: <Icon name="phone" className="h-5 w-5" />, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { icon: <Icon name="mail" className="h-5 w-5" />, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: <Icon name="instagram" className="h-5 w-5" />, label: "Instagram", value: `@${site.instagram}`, href: instagramLink },
  ];
  return (
    <>
      <PageHero eyebrow="Contact" title={<>We&apos;d love to <em className="text-gold">hear from you</em></>} image="photo-1621293954908-907159247fc8" alt="Elegant lobby lounge" size="sm" />
      <section className="container-x grid gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <ul className="grid gap-3">
            {channels.map((c) => (
              <li key={c.label}>
                <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="card flex items-center gap-4 p-5 transition hover:border-ink">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/60 text-bronze">{c.icon}</span>
                  <span>
                    <span className="label mb-0">{c.label}</span>
                    <span className="block text-lg">{c.value}</span>
                  </span>
                  <Icon name="arrow" className="ml-auto h-4 w-4 text-stone" />
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <p className="eyebrow text-bronze">Office hours</p>
            <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
              {site.officeHours.map((h) => (
                <div key={h.days} className="flex justify-between py-3">
                  <dt className="text-stone">{h.days}</dt>
                  <dd>{h.hours}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-stone">{site.officeAddress}</p>
          </div>
        </div>
        <EnquiryForm kind="contact" />
      </section>
    </>
  );
}
