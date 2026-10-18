"use client";
/** Editorial photo grid with a keyboard-friendly full-screen lightbox. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo as PhotoT } from "@/lib/types";
import { Icon } from "./icons/Icon";
import { Photo } from "./Photo";

export function Gallery({ photos, name }: { photos: PhotoT[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const touchX = useRef<number | null>(null);
  // Swipe left/right in the lightbox.
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, go]);

  const tile = (i: number, cls: string, sizes: string, priority = false) =>
    photos[i] && (
      <button type="button" onClick={() => setOpen(i)} className={`group relative overflow-hidden bg-cream ${cls}`} aria-label={`Open photo ${i + 1} of ${photos.length}: ${photos[i].alt}`}>
        <Photo src={photos[i].src} alt={photos[i].alt} fill priority={priority} sizes={sizes} className="object-cover transition duration-[1.2s] group-hover:scale-105" />
      </button>
    );

  return (
    <>
      {/* Phones: swipeable full-width carousel of every photo */}
      <div className="relative sm:hidden">
        <div
          className="no-scrollbar flex aspect-[4/3.4] snap-x snap-mandatory overflow-x-auto rounded-2xl"
          onScroll={(e) => setSlide(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {photos.map((p, i) => (
            <button key={p.src + i} type="button" onClick={() => setOpen(i)} className="relative h-full w-full shrink-0 snap-center bg-cream" aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.alt}`}>
              <Photo src={p.src} alt={p.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs text-ivory backdrop-blur" aria-live="polite">
          {slide + 1} / {photos.length}
        </span>
        <span className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden="true">
          {photos.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-5 bg-ivory" : "w-1.5 bg-ivory/50"}`} />
          ))}
        </span>
      </div>

      <div className="relative hidden h-[58vh] min-h-[340px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:grid sm:h-[68vh]">
        {tile(0, "col-span-2 row-span-2", "(min-width:640px) 50vw, 100vw", true)}
        {tile(1, "hidden sm:block", "25vw")}
        {tile(2, "hidden sm:block", "25vw")}
        {tile(3, "hidden sm:block", "25vw")}
        {tile(4, "hidden sm:block", "25vw")}
        <button type="button" onClick={() => setOpen(0)} className="btn absolute bottom-4 right-4 bg-ivory/95 text-ink shadow-lg hover:bg-white">
          <Icon name="grid" className="h-4 w-4" /> All {photos.length} photos
        </button>
      </div>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${name} photos`} className="fixed inset-0 z-[70] flex flex-col bg-ink/97 text-ivory animate-fade">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <p className="text-sm tracking-[0.2em] text-ivory/70">
              {open + 1} / {photos.length}
            </p>
            <button type="button" onClick={() => setOpen(null)} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 hover:border-gold" aria-label="Close gallery">
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <Photo key={open} src={photos[open].src} alt={photos[open].alt} fill sizes="100vw" className="object-contain animate-fade" />
            <button type="button" onClick={() => go(-1)} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-ink/60 hover:bg-ink" aria-label="Previous photo">
              <Icon name="arrow-left" className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-ink/60 hover:bg-ink" aria-label="Next photo">
              <Icon name="arrow" className="h-5 w-5" />
            </button>
          </div>
          <p className="p-4 text-center text-sm text-ivory/70 sm:p-6">{photos[open].alt}</p>
        </div>
      )}
    </>
  );
}
