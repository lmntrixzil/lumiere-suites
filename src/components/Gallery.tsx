"use client";
/** Editorial photo grid with a keyboard-friendly full-screen lightbox. */
import { useCallback, useEffect, useState } from "react";
import type { Photo as PhotoT } from "@/lib/types";
import { Icon } from "./icons/Icon";
import { Photo } from "./Photo";

export function Gallery({ photos, name }: { photos: PhotoT[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
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
      <div className="relative grid h-[58vh] min-h-[340px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl sm:h-[68vh]">
        {tile(0, "col-span-4 row-span-2 sm:col-span-2", "(min-width:640px) 50vw, 100vw", true)}
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
          <div className="relative flex-1">
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
