import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[80vh] flex-col items-center justify-center bg-ink px-4 text-center text-ivory">
      <p className="eyebrow text-gold">404</p>
      <h1 className="display mt-4 text-6xl sm:text-8xl">Lost in Lagos?</h1>
      <p className="mt-5 max-w-md text-ivory/70">That page has checked out. Let&apos;s get you somewhere comfortable.</p>
      <Link href="/" className="btn-gold mt-10">
        Back home
      </Link>
    </section>
  );
}
