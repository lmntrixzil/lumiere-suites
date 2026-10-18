"use client";
/** Phone-only price bar on the apartment page. Steps aside while the booking card is on screen. */
import { useEffect, useState } from "react";
import { Price } from "./Currency";

export function MobileReserveBar({ nightlyRate }: { nightlyRate: number }) {
  const [cardVisible, setCardVisible] = useState(false);
  useEffect(() => {
    const card = document.getElementById("book");
    if (!card) return;
    const io = new IntersectionObserver(([e]) => setCardVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(card);
    return () => io.disconnect();
  }, []);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition duration-300 lg:hidden ${
        cardVisible ? "pointer-events-none translate-y-full opacity-0" : ""
      }`}
    >
      <p>
        <Price ngn={nightlyRate} className="font-serif text-2xl" />
        <span className="text-xs text-stone"> / night</span>
      </p>
      <a href="#book" className="btn-gold">
        Check dates
      </a>
    </div>
  );
}
