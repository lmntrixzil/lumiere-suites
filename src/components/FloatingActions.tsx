"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./icons/Icon";

/**
 * - Floating WhatsApp button (all screens)
 * - Vertical "Book your stay" tab on the right edge (desktop, like white-desert.com's Enquire tab)
 * - Sticky "Book now" bar at the bottom on phones
 * Hidden on the checkout itself so nothing covers the form.
 */
export function FloatingActions() {
  const pathname = usePathname();
  const onCheckout = pathname.startsWith("/book");
  const onDetail = pathname.startsWith("/apartments/");

  // On the home page the hero has its own search, so keep it uncovered until
  // the visitor scrolls past it.
  const [pastHero, setPastHero] = useState(pathname !== "/");
  useEffect(() => {
    if (pathname !== "/") return setPastHero(true);
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.35);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);
  const hideOnPhone = pastHero ? "" : "max-md:pointer-events-none max-md:translate-y-6 max-md:opacity-0";

  return (
    <>
      <a
        href={whatsappLink("Hello Lumière Suites, I'd like to ask about a stay.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#1F7A4D] text-white shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition duration-500 hover:scale-105 sm:right-6 ${hideOnPhone} ${
          onCheckout ? "bottom-24 lg:bottom-6" : "bottom-24 md:bottom-6"
        }`}
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>

      {!onCheckout && (
        <Link
          href="/book"
          className="fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 rotate-180 rounded-r-lg bg-gold px-2.5 py-5 text-[0.66rem] font-semibold uppercase tracking-[0.3em] text-ink shadow-lg transition [writing-mode:vertical-rl] hover:bg-gold-soft md:block"
        >
          Book your stay
        </Link>
      )}

      {!onCheckout && !onDetail && (
        <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-ink/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition duration-500 md:hidden ${hideOnPhone}`}>
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif text-lg leading-tight text-ivory">Stay &amp; ride, together</p>
              <p className="text-[0.7rem] text-ivory/60">Ikoyi · Lekki · Car on arrival</p>
            </div>
            <Link href="/book" className="btn-gold shrink-0 px-5">
              Book now
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
