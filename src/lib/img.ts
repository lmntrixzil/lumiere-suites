/**
 * Resolves a stored photo source to a URL next/image can optimise.
 * Seed photos are stored as Unsplash ids ("photo-…"); admin uploads are full URLs.
 */
export function imgSrc(src: string, width = 1600) {
  if (src.startsWith("photo-")) {
    return `https://images.unsplash.com/${src}?auto=format&fit=crop&w=${width}&q=80`;
  }
  return src;
}
