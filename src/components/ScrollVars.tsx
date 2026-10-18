"use client";
/**
 * Scroll-driven animation driver. Writes the scroll progress (0 → 1) into a CSS
 * variable `--p` on its element; children animate with calc(var(--p) …) so
 * nothing re-renders while scrolling.
 *
 * mode "pin":  progress across a tall section whose child is position: sticky
 * mode "exit": progress as the element scrolls up and out of the viewport
 *
 * Also sets data-stage="a" | "b" (progress below / above `split`) so content can
 * switch pointer-events. Users who prefer reduced motion get a static --p of 0.
 */
import { useEffect, useRef } from "react";

export function ScrollVars({
  mode = "exit",
  split = 0.3,
  className = "",
  style,
  children,
  as: Tag = "div",
}: {
  mode?: "pin" | "exit";
  split?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  as?: "div" | "section";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--p", "0");
      el.dataset.stage = "a";
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const span = mode === "pin" ? r.height - window.innerHeight : r.height;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
      el.style.setProperty("--p", p.toFixed(4));
      el.dataset.stage = p < split ? "a" : "b";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [mode, split]);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={`group/scroll ${className}`} style={{ "--p": 0, ...style } as React.CSSProperties} data-stage="a">
      {children}
    </Tag>
  );
}

/** Opacity for word i of n, lighting up between progress `from` and `to`. */
export const wordOpacity = (i: number, n: number, from: number, to: number) => {
  const start = from + ((to - from) * i) / n;
  return `clamp(0.14, calc((var(--p) - ${start.toFixed(4)}) * ${(n / (to - from)).toFixed(2)}), 1)`;
};
