"use client";
import { useEffect, useState } from "react";
import { Icon } from "./icons/Icon";

type Review = { name: string; from: string; stay: string; text: string };

/** One large editorial quote at a time, like the founder quote on white-desert.com. */
export function Reviews({ reviews }: { reviews: Review[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % reviews.length), 8000);
    return () => clearInterval(t);
  }, [paused, reviews.length]);
  const r = reviews[i];
  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} className="mx-auto max-w-4xl text-center">
      <p aria-hidden="true" className="font-serif text-8xl leading-none text-gold">“</p>
      <figure key={i} className="animate-fade" aria-live="polite">
        <blockquote className="font-serif text-[1.7rem] font-light leading-snug sm:text-4xl lg:text-[2.6rem]">{r.text}</blockquote>
        <figcaption className="mt-8">
          <span className="mx-auto mb-4 block h-px w-10 bg-gold" />
          <span className="block text-sm font-medium uppercase tracking-[0.25em]">{r.name}</span>
          <span className="mt-1 block text-sm text-ivory/60">
            {r.from} · stayed at {r.stay}
          </span>
          <span className="mt-3 flex justify-center gap-0.5" aria-label="Rated 5 out of 5">
            {Array.from({ length: 5 }, (_, n) => (
              <Icon key={n} name="star" className="h-3.5 w-3.5 fill-gold text-gold" />
            ))}
          </span>
        </figcaption>
      </figure>
      <div className="mt-10 flex items-center justify-center gap-3">
        {reviews.map((_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => setI(n)}
            aria-label={`Show review ${n + 1}`}
            aria-current={n === i}
            className={`h-1.5 rounded-full transition-all ${n === i ? "w-8 bg-gold" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
