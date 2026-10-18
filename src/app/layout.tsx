import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Lumière Suites | Luxury Shortlet Apartments in Ikoyi & Lekki, Lagos",
    template: "%s | Lumière Suites Lagos",
  },
  description: site.description,
  keywords: ["shortlet in Ikoyi", "shortlet in Lekki", "luxury shortlet Lagos", "serviced apartments Lagos", "car rental Lagos", "chauffeur Lagos", "airport pickup MMIA"],
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: site.name,
    images: [{ url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80", width: 1200, height: 630, alt: "A light-filled Lumière Suites living room" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#0E1116",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NG" className={`${cormorant.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
