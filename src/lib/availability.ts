/**
 * Availability = dates the host blocked + nights already booked.
 * Cancelled bookings free their dates again.
 */
import { addDays, eachNight } from "./dates";
import { db } from "./db";
import type { Booking } from "./types";

const holds = (b: Booking) => b.status !== "cancelled";

/** Nights (YYYY-MM-DD) that cannot be booked for an apartment. */
export async function unavailableNights(apartmentId: string): Promise<string[]> {
  const apt = await db.get("apartments", apartmentId);
  const bookings = await db.list("bookings");
  const set = new Set(apt?.blockedDates ?? []);
  for (const b of bookings) {
    if (b.stay && b.stay.apartmentId === apartmentId && holds(b)) {
      eachNight(b.stay.checkIn, b.stay.checkOut).forEach((d) => set.add(d));
    }
  }
  return [...set].sort();
}

/** Days a car is already out. */
export async function unavailableCarDays(carId: string): Promise<string[]> {
  const car = await db.get("cars", carId);
  const bookings = await db.list("bookings");
  const set = new Set(car?.blockedDates ?? []);
  for (const b of bookings) {
    if (b.car && b.car.carId === carId && holds(b)) {
      const days = b.car.rateType === "hourly" ? 1 : b.car.rateType === "weekly" ? Math.ceil(b.car.units / 7) * 7 : b.car.units;
      eachNight(b.car.start, addDays(b.car.start, days)).forEach((d) => set.add(d));
    }
  }
  return [...set].sort();
}

export const rangeIsFree = (from: string, to: string, blocked: string[]) => {
  const set = new Set(blocked);
  return eachNight(from, to).every((d) => !set.has(d));
};
