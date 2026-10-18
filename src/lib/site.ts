/**
 * Brand-wide settings. Replace the placeholder contact details below with the
 * client's real ones before launch; everything else on the site reads from here.
 */
export const site = {
  name: "Lumière Suites",
  shortName: "Lumière",
  tagline: "Stay in the light. Move in style.",
  description:
    "Luxury serviced shortlet apartments in Ikoyi and Lekki, Lagos, with chauffeur-driven car rental and concierge. Book your stay and your ride together.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://lumieresuites.ng",

  // TODO(client): real contact details
  whatsapp: "2348000000000", // international format, digits only
  phone: "+234 800 000 0000",
  email: "stay@lumieresuites.ng",
  instagram: "lumieresuites",
  officeAddress: "Ikoyi, Lagos, Nigeria",
  officeHours: [
    { days: "Monday – Saturday", hours: "8:00 – 20:00" },
    { days: "Sunday", hours: "10:00 – 18:00" },
    { days: "Guest line (WhatsApp)", hours: "24 hours, every day" },
  ],

  // Bank transfer details shown at checkout and in confirmation emails.
  bank: {
    bankName: "Your Bank Plc",
    accountName: "Lumière Suites Ltd",
    accountNumber: "0000000000",
  },
} as const;

export const whatsappLink = (text?: string) =>
  `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export const instagramLink = `https://instagram.com/${site.instagram}`;

/** Intro line revealed by the scroll hero on the home page. */
export const heroStatement =
  "A boutique hotel's calm, with the space and privacy of your own home. And when you land, a car already waiting.";

/** Primary navigation, used by the header, the overlay menu and the footer. */
export const nav = [
  { href: "/apartments", label: "Apartments" },
  { href: "/cars", label: "Car Rental" },
  { href: "/concierge", label: "Concierge" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Neighbourhoods. Coordinates are the general area only, never an apartment's address. */
export const locations = {
  ikoyi: {
    slug: "ikoyi",
    name: "Ikoyi",
    coords: "6° 27′ N, 3° 26′ E",
    lat: 6.4541,
    lng: 3.4347,
    blurb:
      "Leafy, quiet and central. Old Lagos money, embassy row, the best restaurants on the island and ten minutes to Victoria Island.",
    image: "photo-1618828665011-0abd973f7bb8",
    highlights: ["10 min to Victoria Island", "Near Ikoyi Club & Falomo", "Quiet, gated streets"],
  },
  lekki: {
    slug: "lekki",
    name: "Lekki",
    coords: "6° 26′ N, 3° 28′ E",
    lat: 6.4474,
    lng: 3.4723,
    blurb:
      "Lagos at its most modern. Beach clubs, rooftop bars and the Lekki–Ikoyi Link Bridge putting the whole island within easy reach.",
    image: "photo-1577948000111-9c970dfe3743",
    highlights: ["Minutes to the beach clubs", "Lekki–Ikoyi Link Bridge", "Lekki Phase 1 dining scene"],
  },
} as const;

export type LocationSlug = keyof typeof locations;
