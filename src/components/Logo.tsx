import Link from "next/link";

/** Wordmark: a small sun-ray mark above LUMIÈRE, with SUITES · LAGOS beneath. */
export function Logo({ tone = "light", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const color = tone === "light" ? "text-white" : "text-ink";
  return (
    <Link href="/" aria-label="Lumière Suites, home" className={`group inline-flex flex-col items-center leading-none ${color} ${className}`}>
      <svg viewBox="0 0 40 14" className="mb-1 h-3 w-9 text-gold transition-transform duration-700 group-hover:-translate-y-0.5" aria-hidden="true">
        <path d="M6 13a14 14 0 0 1 28 0" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M20 1v4M10.5 4.5l2 3M29.5 4.5l-2 3M3 9.5l3.5 1.5M37 9.5 33.5 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
      <span className="font-serif text-[1.55rem] font-normal tracking-[0.28em] sm:text-[1.7rem]">LUMIÈRE</span>
      <span className="mt-1 text-[0.52rem] font-medium tracking-[0.5em] opacity-80">SUITES · LAGOS</span>
    </Link>
  );
}
