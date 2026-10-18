"use client";
/**
 * Home hero as a pinned scroll sequence (300vh tall, the stage sticks for 200vh):
 *
 *   0.00 – 0.25  headline + search fade up and away
 *   0.00 – 0.40  the full-bleed photo shrinks into a framed "window"
 *                (a nod to the aircraft-window shot on white-desert.com)
 *                while the giant LUMIÈRE wordmark spreads out and fades
 *   0.38 – 0.90  the intro statement lights up word by word over the frame
 *
 * Everything is driven by the --p variable from <ScrollVars>. With reduced
 * motion the hero is a normal static screen and the statement shows below it.
 */
import Link from "next/link";
import { heroStatement as STATEMENT, locations } from "@/lib/site";
import { HeroSlideshow } from "./HeroSlideshow";
import { Icon } from "./icons/Icon";
import { ScrollVars, wordOpacity } from "./ScrollVars";
import { SearchBar } from "./SearchBar";

export function ScrollHero({ slides }: { slides: { src: string; alt: string }[] }) {
  const words = STATEMENT.split(" ");
  return (
    <ScrollVars as="section" mode="pin" split={0.22} className="relative h-[300vh] bg-ink text-ivory motion-reduce:h-auto" aria-label="Welcome to Lumière Suites">
      <div className="sticky top-0 h-[100svh] overflow-x-clip motion-reduce:relative">
        {/* --- Photo, shrinking into a framed window --- */}
        <div
          className="absolute inset-0 overflow-hidden will-change-[clip-path]"
          style={{
            clipPath:
              "inset(calc(min(var(--p) * 2.5, 1) * 13vh) calc(min(var(--p) * 2.5, 1) * 7vw) calc(min(var(--p) * 2.5, 1) * 13vh) calc(min(var(--p) * 2.5, 1) * 7vw) round calc(min(var(--p) * 2.5, 1) * 28px))",
          }}
        >
          <div className="absolute inset-0" style={{ transform: "scale(calc(1.18 - min(var(--p) * 2.5, 1) * 0.18))" }}>
            <HeroSlideshow slides={slides} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/15 to-ink/90" />
          {/* Darkens as the statement appears, keeping it legible */}
          <div className="absolute inset-0 bg-ink" style={{ opacity: "clamp(0, calc((var(--p) - 0.3) * 1.6), 0.62)" }} />
        </div>

        {/* --- Giant wordmark (white-desert.com's ANTARCTICA motif) --- */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-[-0.12em] select-none whitespace-nowrap text-center font-serif text-[23vw] font-light leading-none text-white/[0.13] max-[700px]:hidden [@media(max-height:700px)]:hidden"
          style={{ letterSpacing: "calc(0.02em + var(--p) * 0.5em)", opacity: "calc(1 - var(--p) * 2.4)" }}
        >
          LUMIÈRE
        </p>

        {/* --- Stage A: headline + search --- */}
        <div
          className="relative z-10 flex h-full flex-col justify-end pb-6 pt-28 group-data-[stage=b]/scroll:pointer-events-none sm:pb-10"
          style={{ opacity: "calc(1 - var(--p) * 4.2)" }}
        >
          <div className="container-x">
            <div style={{ transform: "translateY(calc(var(--p) * -140px))" }}>
              <p className="max-w-[16rem] text-sm leading-relaxed text-ivory/80 animate-fade max-sm:hidden">Serviced residences and private cars in the most sought-after corners of Lagos.</p>
              <h1 className="display mt-5 text-[3.1rem] sm:text-8xl lg:text-[8.5rem]">
                <span className="block animate-fade">Stay in the light.</span>
                <span className="block italic text-gold animate-fade [animation-delay:400ms]">Move in style.</span>
              </h1>
            </div>
            {/* No transform on this wrapper: it would trap the calendar's fixed mobile sheet */}
            <div className="mt-8 animate-fade [animation-delay:700ms] sm:mt-10">
              <SearchBar />
            </div>
            <div className="mt-5 hidden items-center justify-between text-[0.68rem] tracking-[0.3em] text-ivory/60 sm:flex">
              <span>[ {locations.ikoyi.coords} ] IKOYI</span>
              <span className="flex items-center gap-2">
                SCROLL <span className="h-8 w-px animate-pulse bg-gold" />
              </span>
              <span>LEKKI [ {locations.lekki.coords} ]</span>
            </div>
          </div>
        </div>

        {/* --- Stage B: statement lights up word by word --- */}
        <div
          className="pointer-events-none absolute inset-0 z-10 flex items-center motion-reduce:hidden group-data-[stage=b]/scroll:pointer-events-auto"
          style={{ opacity: "clamp(0, calc((var(--p) - 0.34) * 8), 1)" }}
        >
          <div className="container-x">
            <div className="mx-auto max-w-4xl px-2 text-center sm:px-10">
              <p className="eyebrow text-gold">The Lumière way</p>
              <p className="mt-6 font-serif text-[1.9rem] font-light leading-[1.2] sm:text-5xl lg:text-[3.6rem]">
                {words.map((w, i) => (
                  <span key={i} style={{ opacity: wordOpacity(i, words.length, 0.4, 0.86) }}>
                    {w}{" "}
                  </span>
                ))}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3" style={{ opacity: "clamp(0, calc((var(--p) - 0.86) * 10), 1)" }}>
                <Link href="/apartments" className="btn-gold">
                  Explore the residences
                </Link>
                <Link href="/cars" className="btn-ghost-light">
                  Meet the fleet <Icon name="arrow" className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
          {/* Frame corner coordinates */}
          <span className="absolute left-[9vw] top-[15vh] hidden text-[0.65rem] tracking-[0.3em] text-ivory/60 sm:block">[ {locations.ikoyi.coords} ]</span>
          <span className="absolute bottom-[15vh] right-[9vw] hidden text-[0.65rem] tracking-[0.3em] text-ivory/60 sm:block">[ {locations.lekki.coords} ]</span>
        </div>

        {/* Progress rail */}
        <span aria-hidden="true" className="absolute bottom-0 left-0 z-20 h-px bg-gold motion-reduce:hidden" style={{ width: "calc(var(--p) * 100%)" }} />
      </div>
    </ScrollVars>
  );
}

