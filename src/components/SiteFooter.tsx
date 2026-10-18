import Link from "next/link";
import { instagramLink, locations, nav, site, whatsappLink } from "@/lib/site";
import { Icon, WhatsAppIcon } from "./icons/Icon";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink pb-28 pt-20 text-ivory md:pb-10">
      <div className="container-x">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs font-serif text-2xl font-light italic text-ivory/85">{site.tagline}</p>
            <div className="mt-6 flex gap-2">
              <a href={whatsappLink()} aria-label="WhatsApp" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:border-gold hover:text-gold">
                <WhatsAppIcon className="h-4 w-4" />
              </a>
              <a href={instagramLink} aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:border-gold hover:text-gold">
                <Icon name="instagram" className="h-4 w-4" />
              </a>
              <a href={`mailto:${site.email}`} aria-label="Email" className="grid h-10 w-10 place-items-center rounded-full border border-white/20 hover:border-gold hover:text-gold">
                <Icon name="mail" className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div>
            <p className="eyebrow text-gold">Explore</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/75">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-gold">Locations</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/75">
              {Object.values(locations).map((l) => (
                <li key={l.slug}>
                  <Link href={`/locations/${l.slug}`} className="hover:text-gold">
                    Shortlet apartments in {l.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cars" className="hover:text-gold">
                  Car rental in Lagos
                </Link>
              </li>
              <li>
                <Link href="/concierge" className="hover:text-gold">
                  Airport transfers (MMIA)
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-gold">Contact</p>
            <ul className="mt-5 space-y-2.5 text-sm text-ivory/75">
              <li>
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-gold">
                  {site.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="hover:text-gold">
                  {site.email}
                </a>
              </li>
              <li>{site.officeAddress}</li>
              <li className="pt-2 text-ivory/55">Guest line open 24/7</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-4 pt-8 text-xs text-ivory/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Lumière Suites Ltd. All rights reserved.</p>
          <p className="tracking-[0.25em]">
            [ {locations.ikoyi.coords} ] · [ {locations.lekki.coords} ]
          </p>
        </div>
      </div>
      {/* Oversized wordmark, cropped by the footer edge */}
      <p aria-hidden="true" className="pointer-events-none mt-10 select-none text-center font-serif text-[22vw] font-light leading-[0.75] tracking-[0.05em] text-white/[0.04]">
        LUMIÈRE
      </p>
    </footer>
  );
}
