"use client";
import { useState } from "react";
import { eachNight, formatDate } from "@/lib/dates";
import { RangeCalendar, type RangeValue } from "../DateRangePicker";

/** Block or unblock date ranges (owner stays, maintenance, offline bookings). */
export function BlockedDatesField({ value, onChange }: { value: string[]; onChange: (d: string[]) => void }) {
  const [range, setRange] = useState<RangeValue>({});
  const nights = range.from && range.to ? eachNight(range.from, range.to) : range.from ? [range.from] : [];

  const block = () => (onChange([...new Set([...value, ...nights])].sort()), setRange({}));
  const unblock = () => (onChange(value.filter((d) => !nights.includes(d))), setRange({}));

  // Group consecutive dates into readable ranges.
  const groups: string[][] = [];
  for (const d of value) {
    const last = groups.at(-1);
    if (last && eachNight(last.at(-1)!, d).length === 1) last.push(d);
    else groups.push([d]);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
      <div className="rounded-xl border border-line bg-white p-4">
        {/* `blocked` is empty here so already-blocked dates can be selected to unblock them */}
        <RangeCalendar value={range} onChange={setRange} />
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={!nights.length} onClick={block} className="btn-ink px-4 py-2">
            Block {nights.length || ""} night{nights.length === 1 ? "" : "s"}
          </button>
          <button type="button" disabled={!nights.length} onClick={unblock} className="btn-ghost px-4 py-2">
            Unblock
          </button>
        </div>
      </div>
      <div>
        <p className="label">Blocked by you</p>
        {groups.length ? (
          <ul className="space-y-1.5 text-sm">
            {groups.map((g) => (
              <li key={g[0]} className="flex justify-between rounded-lg bg-white px-3 py-2">
                <span>
                  {formatDate(g[0], { day: "numeric", month: "short" })}
                  {g.length > 1 && ` → ${formatDate(g.at(-1)!, { day: "numeric", month: "short" })}`}
                </span>
                <span className="text-stone">{g.length}n</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone">No dates blocked. Guest bookings block dates automatically.</p>
        )}
      </div>
    </div>
  );
}
