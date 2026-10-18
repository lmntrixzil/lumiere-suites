/**
 * Server-side booking creation. Never trusts prices from the browser: the quote
 * is rebuilt here from stored rates, and dates are re-checked against
 * availability right before the booking is saved.
 */
import { rangeIsFree, unavailableCarDays, unavailableNights } from "./availability";
import { addDays, diffDays, isValidISO, todayISO } from "./dates";
import { db, findDiscount, getSettings } from "./db";
import { buildQuote, codeIsValid } from "./pricing";
import type { Booking, CarSelection, GuestDetails, PaymentMethod, StaySelection } from "./types";

export interface BookingInput {
  stay?: StaySelection | null;
  car?: CarSelection | null;
  guest: GuestDetails;
  paymentMethod: PaymentMethod;
  discountCode?: string;
}

export class BookingError extends Error {}

const makeRef = () => `LUM-${Date.now().toString(36).slice(-4).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export async function createBooking(input: BookingInput): Promise<Booking> {
  const { stay, car: carSel, guest } = input;
  if (!stay && !carSel) throw new BookingError("Choose an apartment, a car, or both.");
  if (!guest?.name?.trim() || !guest?.email?.includes("@") || !guest?.phone?.trim()) {
    throw new BookingError("Please add your name, email and phone number.");
  }
  if (!["paystack", "flutterwave", "transfer"].includes(input.paymentMethod)) throw new BookingError("Choose a payment method.");

  const settings = await getSettings();
  const today = todayISO();

  // ---- Stay ----
  const apartment = stay ? await db.get("apartments", stay.apartmentId) : null;
  if (stay) {
    if (!apartment || !apartment.published) throw new BookingError("That apartment is not available.");
    if (!isValidISO(stay.checkIn) || !isValidISO(stay.checkOut) || stay.checkIn < today) throw new BookingError("Please choose valid dates.");
    const nights = diffDays(stay.checkIn, stay.checkOut);
    if (nights < apartment.minNights) throw new BookingError(`${apartment.name} has a ${apartment.minNights}-night minimum.`);
    if (stay.guests < 1 || stay.guests > apartment.maxGuests) throw new BookingError(`${apartment.name} sleeps up to ${apartment.maxGuests}.`);
    if (!rangeIsFree(stay.checkIn, stay.checkOut, await unavailableNights(apartment.id))) {
      throw new BookingError("Sorry, some of those nights have just been booked. Please pick other dates.");
    }
  }

  // ---- Car ----
  const car = carSel ? await db.get("cars", carSel.carId) : null;
  if (carSel) {
    if (!car || !car.published) throw new BookingError("That car is not available.");
    if (!isValidISO(carSel.start) || carSel.start < today) throw new BookingError("Please choose a valid pickup date.");
    if (!car.selfDrive) carSel.mode = "chauffeur";
    const days = carSel.rateType === "hourly" ? 1 : carSel.rateType === "weekly" ? Math.ceil(carSel.units / 7) * 7 : carSel.units;
    if (!rangeIsFree(carSel.start, addDays(carSel.start, days), await unavailableCarDays(car.id))) {
      throw new BookingError(`The ${car.name} is already out on some of those days.`);
    }
    if (carSel.airportPickup && !guest.flightNumber?.trim()) throw new BookingError("Add your arrival flight number so your driver can track it.");
  }

  // ---- Discount ----
  let discount = null;
  if (input.discountCode?.trim()) {
    discount = await findDiscount(input.discountCode);
    if (!codeIsValid(discount, today)) throw new BookingError("That discount code is not valid.");
  }

  const quote = buildQuote({ settings, apartment, checkIn: stay?.checkIn, checkOut: stay?.checkOut, car, carSel, discount });

  const booking: Booking = {
    id: crypto.randomUUID(),
    ref: makeRef(),
    createdAt: new Date().toISOString(),
    status: input.paymentMethod === "transfer" ? "awaiting_transfer" : "pending",
    stay: stay && apartment ? { ...stay, apartmentName: apartment.name } : undefined,
    car: carSel && car ? { ...carSel, carName: car.name } : undefined,
    guest: {
      name: guest.name.trim(),
      email: guest.email.trim(),
      phone: guest.phone.trim(),
      flightNumber: guest.flightNumber?.trim().toUpperCase() || undefined,
      idDocument: guest.idDocument || undefined,
      notes: guest.notes?.trim() || undefined,
    },
    payment: { method: input.paymentMethod, paid: false },
    discountCode: discount?.code,
    quote,
  };
  await db.put("bookings", booking);
  return booking;
}

export async function getBookingByRef(ref: string) {
  return (await db.list("bookings")).find((b) => b.ref === ref) ?? null;
}
