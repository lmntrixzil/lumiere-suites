"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { locations, nav, site, whatsappLink } from "@/lib/site";
import { CurrencyToggle } from "./Currency";
import { Icon } from "./icons/Icon";
import { Logo } from "./Logo";

/**
 * Transparent over the dark hero at the top of every page, then a solid ivory
 * bar once you scroll. Outlined pill controls echo white-desert.com.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on navigation and lock page scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const solid = scrolled && !open;
  const pill = solid
    ? "border-ink/15 text-ink hover:border-ink"
    : "border-white/35 text-white hover:border-gold hover:text-gold";

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid ? "bg-ivory/90 py-2.5 shadow-[0_1px_0_rgba(14,17,22,0.08)] backdrop-blur-md" : "py-4 sm:py-5"
        }`}
      >
        <div className="container-x grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Left */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] transition ${
                open ? "border-white/35 text-white" : pill
              }`}
            >
              <Icon name={open ? "close" : "menu"} className="h-4 w-4" />
              <span className="hidden sm:inline">{open ? "Close" : "Menu"}</span>
            </button>
            <nav aria-label="Quick links" className="hidden items-center gap-2 lg:flex">
              {[
                { href: "/apartments", label: "Stays" },
                { href: "/cars", label: "Cars" },
                { href: "/concierge", label: "Concierge" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`inline-flex h-10 items-center rounded-full border px-4 text-[0.68rem] font-medium uppercase tracking-[0.22em] transition ${pill} ${
                    pathname.startsWith(l.href) ? (solid ? "border-ink" : "border-gold text-gold") : ""
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Centre */}
          <Logo tone={solid ? "dark" : "light"} className={solid ? "scale-90 transition-transform" : "transition-transform"} />

          {/* Right */}
          <div className="flex items-center justify-end gap-2">
            <div className="hidden md:block">
              <CurrencyToggle tone={solid ? "dark" : "light"} />
            </div>
            <Link href="/book" className="btn-gold h-10 px-4 sm:px-6">
              Book<span className="hidden sm:inline"> now</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Full-screen menu */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-ink text-ivory animate-fade"
      >
        <div className="container-x grid grid-cols-1 min-h-full gap-12 pb-16 pt-32 lg:grid-cols-[1.4fr_1fr] lg:pt-40">
          <nav aria-label="Main">
            <ul className="space-y-1">
              {[{ href: "/", label: "Home" }, ...nav, { href: "/book", label: "Book now" }].map((l, i) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-baseline gap-5 py-1 font-serif text-4xl font-light transition hover:text-gold sm:text-6xl"
                  >
                    <span className="w-8 font-sans text-[0.65rem] tracking-[0.3em] text-gold/70">{String(i + 1).padStart(2, "0")}</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-10 lg:pt-4">
            {Object.values(locations).map((l) => (
              <Link key={l.slug} href={`/locations/${l.slug}`} className="block border-t border-white/10 pt-5 hover:text-gold">
                <p className="eyebrow text-gold">[ {l.coords} ]</p>
                <p className="mt-2 font-serif text-3xl">Shortlets in {l.name}</p>
              </Link>
            ))}
            <div className="border-t border-white/10 pt-5 text-sm text-ivory/70">
              <p>{site.phone}</p>
              <p>{site.email}</p>
              <a href={whatsappLink("Hello Lumière, I'd like to make a booking.")} className="mt-3 inline-block text-gold underline-offset-4 hover:underline">
                Chat on WhatsApp
              </a>
            </div>
            <div className="md:hidden">
              <CurrencyToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
