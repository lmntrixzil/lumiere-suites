import type { LocationSlug } from "./site";

export type AmenityKey =
  | "power"
  | "security"
  | "wifi"
  | "netflix"
  | "housekeeping"
  | "pool"
  | "gym"
  | "parking"
  | "kitchen"
  | "ac"
  | "workspace"
  | "washer"
  | "balcony"
  | "concierge"
  | "elevator"
  | "view";

export interface Photo {
  /** Full URL, or an Unsplash photo id like "photo-1502672260266-1c1ef2d93688". */
  src: string;
  alt: string;
}

export interface Apartment {
  id: string;
  slug: string;
  name: string;
  location: LocationSlug;
  /** General area shown before booking, e.g. "Off Bourdillon Road". */
  area: string;
  tagline: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sizeSqm: number;
  /** Nightly rate in Naira. */
  nightlyRate: number;
  /** Refundable caution deposit in Naira. */
  cautionFee: number;
  minNights: number;
  photos: Photo[];
  amenities: AmenityKey[];
  houseRules: string[];
  checkIn: string;
  checkOut: string;
  /** Dates closed by the host (YYYY-MM-DD). Bookings are added on top of these. */
  blockedDates: string[];
  featured: boolean;
  published: boolean;
  rating: number;
  reviewCount: number;
}

export type CarRateType = "hourly" | "daily" | "weekly";
export type DriveMode = "chauffeur" | "self";

export interface Car {
  id: string;
  slug: string;
  name: string;
  category: string;
  seats: number;
  transmission: "Automatic" | "Manual";
  photo: Photo;
  /** Self-drive base rates in Naira. Hourly hire is always chauffeur-driven. */
  rates: { hourly: number; daily: number; weekly: number };
  /** Added per day when a chauffeur is booked. */
  chauffeurDailyFee: number;
  selfDrive: boolean;
  features: string[];
  blockedDates: string[];
  published: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  active: boolean;
  description: string;
  /** YYYY-MM-DD, optional */
  expiresAt?: string;
}

export interface Settings {
  id: "settings";
  /** Naira per US dollar, used by the ₦/$ toggle. */
  usdRate: number;
  /** Flat fee per airport (MMIA) pickup or drop-off. */
  airportTransferFee: number;
  /** Long-stay discounts, applied automatically. */
  weeklyDiscountPct: number;
  monthlyDiscountPct: number;
}

export interface StaySelection {
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface CarSelection {
  carId: string;
  mode: DriveMode;
  rateType: CarRateType;
  /** YYYY-MM-DD start date */
  start: string;
  /** Number of hours (hourly) or days (daily / weekly) */
  units: number;
  airportPickup: boolean;
  airportDropoff: boolean;
}

export interface QuoteLine {
  label: string;
  amount: number;
  note?: string;
  kind?: "discount" | "deposit";
}

export interface Quote {
  lines: QuoteLine[];
  nights: number;
  stayTotal: number;
  carTotal: number;
  discountTotal: number;
  cautionDeposit: number;
  /** Everything payable now, deposit included. */
  total: number;
}

export type BookingStatus = "pending" | "awaiting_transfer" | "confirmed" | "cancelled" | "completed";
export type PaymentMethod = "paystack" | "flutterwave" | "transfer";

export interface GuestDetails {
  name: string;
  phone: string;
  email: string;
  flightNumber?: string;
  idDocument?: string;
  notes?: string;
}

export interface Booking {
  id: string;
  ref: string;
  createdAt: string;
  status: BookingStatus;
  stay?: StaySelection & { apartmentName: string };
  car?: CarSelection & { carName: string };
  guest: GuestDetails;
  payment: { method: PaymentMethod; reference?: string; paid: boolean; demo?: boolean };
  discountCode?: string;
  quote: Quote;
}

export interface Enquiry {
  id: string;
  createdAt: string;
  kind: "concierge" | "contact";
  service?: string;
  name: string;
  email: string;
  phone: string;
  date?: string;
  message: string;
  handled: boolean;
}
