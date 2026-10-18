import { Photo } from "./Photo";
import { ScrollVars } from "./ScrollVars";

/**
 * Dark photographic band at the top of inner pages. Scroll-driven: as it leaves
 * the screen the photo drifts down and zooms (parallax) while the title lifts and
 * fades. The title also rises out of a mask on load.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  alt,
  coords,
  size = "md",
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  image: string;
  alt: string;
  coords?: string;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}) {
  const h = { sm: "min-h-[50vh]", md: "min-h-[66vh]", lg: "min-h-[82vh]" }[size];
  return (
    <ScrollVars as="section" mode="exit" className={`relative isolate flex ${h} items-end overflow-hidden bg-ink pb-14 pt-36 text-ivory`}>
      <div className="absolute inset-0 -z-10" style={{ transform: "translate3d(0, calc(var(--p) * 30%), 0) scale(calc(1 + var(--p) * 0.12))" }}>
        <Photo src={image} alt={alt} fill priority sizes="100vw" className="object-cover opacity-70 animate-kenburns" />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink/70 via-ink/30 to-ink/85" />
      <div className="container-x" style={{ transform: "translate3d(0, calc(var(--p) * -90px), 0)", opacity: "calc(1 - var(--p) * 1.7)" }}>
        <p className="eyebrow text-gold animate-fade">{eyebrow}</p>
        <h1 className="display mt-4 max-w-4xl overflow-hidden pb-[0.08em] text-5xl sm:text-7xl lg:text-[5.5rem]">
          <span className="block animate-rise">{title}</span>
        </h1>
        {intro && <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ivory/80 animate-fade [animation-delay:300ms]">{intro}</p>}
        {children}
        {coords && <p className="mt-8 text-[0.68rem] tracking-[0.3em] text-ivory/60">[ {coords} ]</p>}
      </div>
      <span aria-hidden="true" className="absolute bottom-0 left-0 h-px bg-gold motion-reduce:hidden" style={{ width: "calc(var(--p) * 100%)" }} />
    </ScrollVars>
  );
}
