import type { MetadataRoute } from "next";
import { getApartments } from "@/lib/db";
import { locations, site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["", "/apartments", "/cars", "/concierge", "/about", "/faq", "/contact"];
  const apartments = await getApartments();
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...Object.keys(locations).map((l) => ({ url: `${site.url}/locations/${l}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...apartments.map((a) => ({ url: `${site.url}/apartments/${a.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
