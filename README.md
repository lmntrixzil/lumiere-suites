# Lumière Suites

Luxury shortlet apartments in Ikoyi and Lekki, Lagos, with integrated car rental, so guests book a stay and a car in one checkout.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase (optional) · Paystack / Flutterwave · Resend

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Admin is at `/admin` (dev password `lumiere-admin`; set `ADMIN_PASSWORD` for anything public).

With no environment variables the whole site works in **demo mode**: data is kept in `.data/db.json`, payments are simulated and emails are printed to the server console. Copy `.env.example` to `.env.local` to go live.

## Going live checklist

1. **Contact details:** edit `src/lib/site.ts` (WhatsApp number, phone, email, Instagram, bank details for transfers).
2. **Supabase:** create a project, run `supabase/schema.sql` in the SQL editor, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Starter apartments and cars are copied in on first load.
3. **Payments:** set the Paystack and/or Flutterwave public and secret keys. Bookings are only marked paid after the server verifies the amount with the provider.
4. **Email:** set `RESEND_API_KEY`, `EMAIL_FROM` and `BOOKINGS_INBOX` (guest confirmations plus a copy to you).
5. **Admin:** set a strong `ADMIN_PASSWORD` and `ADMIN_SECRET`.
6. **Photos:** replace the Unsplash placeholders with the client's own photography from the admin (Apartments → Photos, Cars → Photo). Car photos are matched to each model; swap them for the real fleet.
7. **Domain:** set `NEXT_PUBLIC_SITE_URL` so canonical URLs, the sitemap and schema markup point at the live domain.

## What's where

| Path | What it is |
| --- | --- |
| `src/app/(site)/` | Public pages: home, apartments, apartment detail, locations (SEO landing pages), cars, book, confirmation, concierge, about, FAQ, contact |
| `src/app/admin/` | Dashboard: overview, bookings, apartments, cars, pricing & discount codes, inbox |
| `src/app/api/` | Bookings, availability, discount codes, payment verification, uploads, enquiries, admin |
| `src/lib/pricing.ts` | The single price calculator (nights × rate, long-stay discounts, car hire, airport transfers, codes, caution deposit), shared by browser and server |
| `src/lib/db.ts` | Data store: Supabase or local JSON file |
| `src/lib/seed.ts` | Starter apartments, cars, codes, reviews, experiences |
| `src/components/ScrollHero.tsx` | Pinned, scroll-driven home hero |

## Features

- Scroll-driven hero: the photo shrinks into a framed window, the wordmark spreads, then the intro lights up word by word. Inner-page heroes use parallax and fade. Everything goes static for `prefers-reduced-motion`.
- Availability calendar that blocks booked and host-blocked nights, and never lets a stay span a booked night
- Combined checkout: Stay → Car (optional) → Guest details (ID upload, flight number) → Payment (Paystack, Flutterwave or bank transfer)
- Server re-prices every booking and re-checks availability before taking money
- Long-stay discounts (weekly / monthly) and discount codes, editable in admin
- ₦ / $ display toggle (charges are always in Naira)
- Confirmation page and email, plus a pre-filled WhatsApp message with the booking summary
- Floating WhatsApp button, sticky mobile "Book now" bar, side "Book your stay" tab on desktop
- SEO: per-page titles and descriptions, `/locations/ikoyi` and `/locations/lekki` landing pages, sitemap, robots, and schema.org markup (LodgingBusiness, Apartment, AutoRental, FAQPage, BreadcrumbList, ItemList)
- Accessibility: AA colour contrast (bronze `#8A6A32` for gold text on light backgrounds), alt text on every photo, keyboard-friendly dialogs and calendar, skip link

## Brand

Ink `#0E1116` · Champagne gold `#C9A96E` · Warm ivory `#F7F3EC` · Soft grey `#8A8F98` · Cormorant Garamond + Inter
