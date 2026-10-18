import { eachNight } from "./dates";

/** Browser-safe version of rangeIsFree (availability.ts touches the database). */
export const rangeIsFreeClient = (from: string, to: string, blocked: string[]) => {
  if (to <= from) return true;
  const set = new Set(blocked);
  return eachNight(from, to).every((d) => !set.has(d));
};
