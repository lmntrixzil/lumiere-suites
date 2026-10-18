"use client";
/**
 * Availability calendar. Booked or blocked nights are struck through and cannot
 * be selected, and a range can never span a booked night.
 * `blocked` holds nights (YYYY-MM-DD): a guest can still check OUT on a blocked
 * night's date, because that night belongs to the next guest.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, diffDays, formatDate, parseISO, todayISO, toISO } from "@/lib/dates";
import { Icon } from "./icons/Icon";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (first.getUTCDay() + 6) % 7; // Monday first
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (string | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toISO(new Date(Date.UTC(year, month, d))));
  return cells;
}

export interface RangeValue {
  from?: string;
  to?: string;
}

export function RangeCalendar({
  value,
  onChange,
  blocked = [],
  minNights = 1,
  months = 2,
  single = false,
}: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
  blocked?: string[];
  minNights?: number;
  months?: 1 | 2;
  /** Pick one date only (e.g. car pickup). */
  single?: boolean;
}) {
  const today = todayISO();
  const blockedSet = useMemo(() => new Set(blocked), [blocked]);
  const start = parseISO(value.from || today);
  const [view, setView] = useState({ y: start.getUTCFullYear(), m: start.getUTCMonth() });
  const [hover, setHover] = useState<string | null>(null);

  const selectingEnd = !single && !!value.from && !value.to;

  /** First blocked night after check-in: check-out can be on it but not beyond. */
  const limit = useMemo(() => {
    if (!selectingEnd || !value.from) return null;
    return [...blockedSet].filter((d) => d > value.from!).sort()[0] ?? null;
  }, [selectingEnd, value.from, blockedSet]);

  const disabled = (d: string) => {
    if (d < today) return true;
    if (selectingEnd && value.from) {
      if (d <= value.from) return blockedSet.has(d); // allow re-picking an earlier check-in
      if (limit && d > limit) return true;
      return diffDays(value.from, d) < minNights;
    }
    return blockedSet.has(d);
  };

  const pick = (d: string) => {
    if (single) return onChange({ from: d });
    if (!value.from || value.to || d <= value.from) return onChange({ from: d, to: undefined });
    onChange({ from: value.from, to: d });
  };

  const shift = (n: number) =>
    setView(({ y, m }) => {
      const t = new Date(Date.UTC(y, m + n, 1));
      return { y: t.getUTCFullYear(), m: t.getUTCMonth() };
    });

  const endPreview = value.to || (selectingEnd ? hover : null);
  const canGoBack = view.y > parseISO(today).getUTCFullYear() || view.m > parseISO(today).getUTCMonth();

  return (
    <div className="select-none">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canGoBack} aria-label="Previous month" className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink disabled:opacity-30">
          <Icon name="arrow-left" className="h-4 w-4" />
        </button>
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-stone" aria-live="polite">
          {single ? "Choose a date" : selectingEnd ? "Choose check-out" : "Choose check-in"}
        </p>
        <button type="button" onClick={() => shift(1)} aria-label="Next month" className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-ink">
          <Icon name="arrow" className="h-4 w-4" />
        </button>
      </div>
      <div className={`grid gap-6 ${months === 2 ? "sm:grid-cols-2" : ""}`}>
        {Array.from({ length: months }, (_, i) => {
          const t = new Date(Date.UTC(view.y, view.m + i, 1));
          const y = t.getUTCFullYear();
          const m = t.getUTCMonth();
          return (
            <div key={`${y}-${m}`} className={i === 1 ? "hidden sm:block" : ""}>
              <p className="mb-2 text-center font-serif text-xl">{t.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}</p>
              <div className="grid grid-cols-7 text-center text-[0.65rem] uppercase tracking-wider text-mist">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="py-1">
                    {w}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7" role="grid">
                {monthGrid(y, m).map((d, idx) => {
                  if (!d) return <span key={idx} />;
                  const isDisabled = disabled(d);
                  const isBlocked = blockedSet.has(d) && d >= today;
                  const isStart = d === value.from;
                  const isEnd = d === value.to || (!value.to && d === endPreview && selectingEnd);
                  const inRange = value.from && endPreview && d > value.from && d < endPreview;
                  return (
                    <button
                      key={d}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => pick(d)}
                      onMouseEnter={() => setHover(d)}
                      aria-label={`${formatDate(d, { weekday: "long", day: "numeric", month: "long" })}${isBlocked ? ", booked" : ""}`}
                      aria-pressed={isStart || d === value.to}
                      className={`relative my-0.5 h-10 text-sm transition ${inRange ? "bg-gold/15" : ""} ${
                        isStart || isEnd ? "z-10 rounded-full bg-ink font-medium text-ivory" : "rounded-full hover:ring-1 hover:ring-ink/40"
                      } ${isDisabled ? "cursor-not-allowed text-mist/60 hover:ring-0" : ""} ${isBlocked && !isStart ? "line-through decoration-mist/70" : ""} ${
                        d === today && !isStart ? "font-semibold text-bronze" : ""
                      }`}
                    >
                      {Number(d.slice(8))}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-[0.7rem] text-stone">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-ink" /> Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-mist line-through">14</span> Booked
        </span>
        {minNights > 1 && !single && <span>{minNights}-night minimum</span>}
      </div>
    </div>
  );
}

/** Field + popover wrapper used by the search bar and booking card. */
export function DateRangeField({
  value,
  onChange,
  blocked,
  minNights,
  tone = "light",
  labels = ["Check-in", "Check-out"],
  single = false,
  className = "",
  placement = "bottom",
}: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
  blocked?: string[];
  minNights?: number;
  tone?: "light" | "dark";
  /** "top" opens the calendar above the field (used in the hero, near the fold). */
  placement?: "top" | "bottom";
  labels?: [string, string] | [string];
  single?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handle = (v: RangeValue) => {
    onChange(v);
    if (single || v.to) setOpen(false);
  };

  const label = tone === "dark" ? "text-ivory/60" : "text-stone";
  const text = tone === "dark" ? "text-ivory" : "text-ink";
  const show = (d?: string) => (d ? formatDate(d, { weekday: "short", day: "numeric", month: "short" }) : "Add date");

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`grid w-full text-left ${single ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
        <span>
          <span className={`block text-[0.62rem] font-medium uppercase tracking-[0.22em] ${label}`}>{labels[0]}</span>
          <span className={`mt-1 block truncate text-[0.95rem] ${value.from ? text : "text-mist"}`}>{show(value.from)}</span>
        </span>
        {!single && (
          <span>
            <span className={`block text-[0.62rem] font-medium uppercase tracking-[0.22em] ${label}`}>{labels[1]}</span>
            <span className={`mt-1 block truncate text-[0.95rem] ${value.to ? text : "text-mist"}`}>{show(value.to)}</span>
          </span>
        )}
      </button>
      {open && (
        <div className={`absolute left-0 ${placement === "top" ? "bottom-[calc(100%+14px)]" : "top-[calc(100%+14px)]"} z-50 w-[min(92vw,640px)] rounded-2xl border border-line bg-white p-5 text-ink shadow-[0_30px_80px_-20px_rgba(14,17,22,0.35)] animate-fade max-sm:fixed max-sm:inset-x-3 max-sm:top-auto max-sm:bottom-3 max-sm:w-auto`}>
          <RangeCalendar value={value} onChange={handle} blocked={blocked} minNights={minNights} single={single} />
          {!single && value.from && value.to && (
            <p className="mt-3 border-t border-line pt-3 text-sm text-stone">
              {diffDays(value.from, value.to)} nights · {formatDate(value.from)} → {formatDate(value.to)}
            </p>
          )}
          <div className="mt-3 flex justify-between">
            <button type="button" onClick={() => onChange({})} className="text-xs uppercase tracking-[0.2em] text-stone underline-offset-4 hover:underline">
              Clear
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-ink px-5 py-2">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const nightsBetween = (r: RangeValue) => (r.from && r.to ? diffDays(r.from, r.to) : 0);
export const defaultRange = (offset = 7, nights = 3): RangeValue => {
  const from = addDays(todayISO(), offset);
  return { from, to: addDays(from, nights) };
};
