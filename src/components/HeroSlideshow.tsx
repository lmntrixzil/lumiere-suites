"use client";
/** Slow cross-fading hero photography with a gentle zoom (static if reduced motion). */
import { useEffect, useState } from "react";
import { Photo } from "./Photo";

export function HeroSlideshow({ slides }: { slides: { src: string; alt: string }[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);
  return (
    <div className="absolute inset-0 -z-10" aria-hidden={false}>
      {slides.map((s, n) => (
        <div key={s.src} className={`absolute inset-0 transition-opacity duration-[2000ms] ${n === i ? "opacity-100" : "opacity-0"}`}>
          <Photo
            src={s.src}
            alt={s.alt}
            fill
            priority={n === 0}
            sizes="100vw"
            className={`object-cover ${n === i ? "animate-kenburns" : ""}`}
          />
        </div>
      ))}
    </div>
  );
}
