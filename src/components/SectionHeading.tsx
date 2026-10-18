import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  tone = "light",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  const center = align === "center";
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      <p className={`eyebrow ${tone === "dark" ? "text-gold" : "text-bronze"}`}>{eyebrow}</p>
      <span className={`gold-rule my-5 ${center ? "mx-auto" : ""}`} />
      <h2 className={`h-section ${tone === "dark" ? "text-ivory" : "text-ink"}`}>{title}</h2>
      {intro && <p className={`mt-5 text-[1.02rem] leading-relaxed ${tone === "dark" ? "text-ivory/70" : "text-stone"}`}>{intro}</p>}
    </Reveal>
  );
}
