/**
 * Date helpers that work on plain "YYYY-MM-DD" strings in UTC, so a date never
 * shifts by a day because of the visitor's timezone.
 */

export const toISO = (d: Date) => d.toISOString().slice(0, 10);

export const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

export const isValidISO = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(parseISO(s).getTime());

export const addDays = (s: string, n: number) => {
  const d = parseISO(s);
  d.setUTCDate(d.getUTCDate() + n);
  return toISO(d);
};

export const diffDays = (from: string, to: string) =>
  Math.round((parseISO(to).getTime() - parseISO(from).getTime()) / 86_400_000);

/** Today in Lagos (WAT, UTC+1). */
export const todayISO = () => toISO(new Date(Date.now() + 60 * 60 * 1000));

/** Every date from `from` up to but not including `to`. */
export function eachNight(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d < to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function formatDate(s: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return parseISO(s).toLocaleDateString("en-GB", { timeZone: "UTC", ...opts });
}

export function formatRange(from?: string, to?: string) {
  if (!from) return "";
  if (!to) return formatDate(from, { day: "numeric", month: "short" });
  return `${formatDate(from, { day: "numeric", month: "short" })} – ${formatDate(to, { day: "numeric", month: "short", year: "numeric" })}`;
}
