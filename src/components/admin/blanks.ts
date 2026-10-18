/** Empty records for "Add new" in the admin (server-safe, no "use client"). */
import type { Apartment, Car, DiscountCode } from "@/lib/types";

export const blankApartment = (): Apartment => ({
  id: `apt-${crypto.randomUUID().slice(0, 8)}`,
  slug: "",
  name: "",
  location: "ikoyi",
  area: "",
  tagline: "",
  description: "",
  bedrooms: 1,
  bathrooms: 1,
  maxGuests: 2,
  sizeSqm: 80,
  nightlyRate: 150000,
  cautionFee: 100000,
  minNights: 1,
  photos: [],
  amenities: ["power", "security", "wifi", "netflix", "housekeeping", "kitchen", "ac"],
  houseRules: ["No parties or events without written approval", "No smoking indoors", "Quiet hours from 22:00 to 07:00"],
  checkIn: "14:00",
  checkOut: "12:00",
  blockedDates: [],
  featured: false,
  published: false,
  rating: 5,
  reviewCount: 0,
});

export const blankCar = (): Car => ({
  id: `car-${crypto.randomUUID().slice(0, 8)}`,
  slug: "",
  name: "",
  category: "Luxury SUV",
  seats: 5,
  transmission: "Automatic",
  photo: { src: "", alt: "" },
  rates: { hourly: 25000, daily: 120000, weekly: 720000 },
  chauffeurDailyFee: 25000,
  selfDrive: true,
  features: [],
  blockedDates: [],
  published: false,
});

export const blankDiscount = (): DiscountCode => ({
  id: `dc-${crypto.randomUUID().slice(0, 8)}`,
  code: "",
  type: "percent",
  value: 10,
  active: true,
  description: "",
});
