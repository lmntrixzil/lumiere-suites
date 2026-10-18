/**
 * The one place prices are calculated. The booking card, the checkout and the
 * server all call `buildQuote`, so what a guest sees is exactly what they pay
 * (the server always recalculates from its own data before taking payment).
 */
import { diffDays } from "./dates";
import type { Apartment, Car, CarSelection, DiscountCode, Quote, QuoteLine, Settings } from "./types";

export const naira = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

/** Long-stay discount: weekly from 7 nights, monthly from 28 nights. */
export function longStayPct(nights: number, s: Pick<Settings, "weeklyDiscountPct" | "monthlyDiscountPct">) {
  if (nights >= 28) return s.monthlyDiscountPct;
  if (nights >= 7) return s.weeklyDiscountPct;
  return 0;
}

/**
 * Car hire cost before airport transfers.
 * - hourly: always chauffeur-driven, minimum 4 hours
 * - daily: full weeks are charged at the weekly rate when cheaper
 * - weekly: whole weeks only
 */
export function carHireCost(car: Car, sel: Pick<CarSelection, "rateType" | "units" | "mode">) {
  const units = Math.max(1, Math.floor(sel.units || 1));
  if (sel.rateType === "hourly") {
    const hours = Math.max(4, units);
    return { amount: hours * car.rates.hourly, label: `${hours} hrs × ${naira(car.rates.hourly)}`, days: 1 };
  }
  const days = sel.rateType === "weekly" ? Math.max(1, Math.ceil(units / 7)) * 7 : units;
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  const base = weeks * car.rates.weekly + Math.min(rest * car.rates.daily, car.rates.weekly);
  const chauffeur = sel.mode === "chauffeur" ? days * car.chauffeurDailyFee : 0;
  const parts = [weeks ? `${weeks} wk${weeks > 1 ? "s" : ""}` : "", rest ? `${rest} day${rest > 1 ? "s" : ""}` : ""]
    .filter(Boolean)
    .join(" + ");
  return { amount: base + chauffeur, label: parts, days, base, chauffeur };
}

export interface QuoteInput {
  settings: Settings;
  apartment?: Apartment | null;
  checkIn?: string;
  checkOut?: string;
  car?: Car | null;
  carSel?: CarSelection | null;
  discount?: DiscountCode | null;
}

export function buildQuote({ settings, apartment, checkIn, checkOut, car, carSel, discount }: QuoteInput): Quote {
  const lines: QuoteLine[] = [];
  let nights = 0;
  let stayTotal = 0;
  let carTotal = 0;
  let discountTotal = 0;
  let cautionDeposit = 0;

  if (apartment && checkIn && checkOut) {
    nights = Math.max(0, diffDays(checkIn, checkOut));
    if (nights > 0) {
      stayTotal = nights * apartment.nightlyRate;
      lines.push({ label: `${naira(apartment.nightlyRate)} × ${nights} night${nights > 1 ? "s" : ""}`, amount: stayTotal });
      const pct = longStayPct(nights, settings);
      if (pct) {
        const off = Math.round((stayTotal * pct) / 100);
        discountTotal += off;
        lines.push({ label: `${nights >= 28 ? "Monthly" : "Weekly"} stay discount (${pct}%)`, amount: -off, kind: "discount" });
      }
      cautionDeposit = apartment.cautionFee;
    }
  }

  if (car && carSel) {
    const mode = car.selfDrive && carSel.rateType !== "hourly" ? carSel.mode : "chauffeur";
    const hire = carHireCost(car, { ...carSel, mode });
    carTotal += hire.amount;
    lines.push({
      label: `${car.name} · ${hire.label}`,
      amount: hire.amount,
      note: carSel.rateType === "hourly" ? "With chauffeur" : mode === "chauffeur" ? "Includes chauffeur" : "Self-drive",
    });
    const transfers = (carSel.airportPickup ? 1 : 0) + (carSel.airportDropoff ? 1 : 0);
    if (transfers) {
      const fee = transfers * settings.airportTransferFee;
      carTotal += fee;
      lines.push({ label: `MMIA airport ${transfers === 2 ? "pickup & drop-off" : carSel.airportPickup ? "pickup" : "drop-off"}`, amount: fee });
    }
  }

  // Codes apply to the stay and car, never to the refundable deposit.
  if (discount && discount.active && stayTotal + carTotal > 0) {
    const eligible = stayTotal + carTotal - discountTotal;
    const off = Math.min(eligible, discount.type === "percent" ? Math.round((eligible * discount.value) / 100) : discount.value);
    if (off > 0) {
      discountTotal += off;
      lines.push({ label: `Code ${discount.code}`, amount: -off, kind: "discount" });
    }
  }

  if (cautionDeposit) {
    lines.push({ label: "Refundable caution deposit", amount: cautionDeposit, kind: "deposit", note: "Returned within 72 hours of check-out" });
  }

  const total = stayTotal + carTotal - discountTotal + cautionDeposit;
  return { lines, nights, stayTotal, carTotal, discountTotal, cautionDeposit, total };
}

/** Is a discount code usable today? */
export function codeIsValid(d: DiscountCode | undefined | null, today: string) {
  return !!d && d.active && (!d.expiresAt || d.expiresAt >= today);
}
