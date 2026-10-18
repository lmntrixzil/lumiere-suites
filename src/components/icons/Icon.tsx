/**
 * Thin-line icon set (1.25px strokes) drawn to match the serif typography.
 * Usage: <Icon name="wifi" className="h-5 w-5" />
 */
import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  power: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  security: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  wifi: (
    <>
      <path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0" />
      <circle cx="12" cy="19" r="0.9" fill="currentColor" />
    </>
  ),
  netflix: (
    <>
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M8 20h8M10 8.5v5l4-2.5-4-2.5Z" />
    </>
  ),
  housekeeping: (
    <>
      <path d="M12 3v9M8.5 12h7l1.5 9H7l1.5-9Z" />
      <path d="M10 16.5v4.5M14 16.5v4.5" />
    </>
  ),
  pool: (
    <>
      <path d="M2 18c1.5 0 1.5-1 3-1s1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M8 15V5.5a2 2 0 0 1 4 0M16 15V5.5a2 2 0 0 0-4 0M8 9h8M8 12.5h8" />
    </>
  ),
  gym: <path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12" />,
  parking: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <path d="M9.5 17V7h3.5a3 3 0 0 1 0 6H9.5" />
    </>
  ),
  kitchen: (
    <>
      <path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5" />
      <path d="M17 21V3c-2 1.5-3 4-3 7s1 4 3 4" />
    </>
  ),
  ac: (
    <>
      <path d="M12 2v20M4 6.5l16 11M20 6.5l-16 11" />
      <path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2" />
    </>
  ),
  workspace: (
    <>
      <rect x="4" y="4.5" width="16" height="10.5" rx="1" />
      <path d="M2 19h20M10 15v4M14 15v4" />
    </>
  ),
  washer: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <circle cx="12" cy="13" r="4.5" />
      <path d="M7.5 6.5h2" />
    </>
  ),
  balcony: <path d="M3 12h18M4 12v8M8 12v8M12 12v8M16 12v8M20 12v8M3 20h18M7 12V4h10v8" />,
  concierge: (
    <>
      <path d="M4 17h16M3 20h18M12 6a7 7 0 0 1 7 7v1H5v-1a7 7 0 0 1 7-7ZM12 4v2" />
    </>
  ),
  elevator: (
    <>
      <rect x="4.5" y="2.5" width="15" height="19" rx="1.5" />
      <path d="m9 9 3-3 3 3M9 15l3 3 3-3" />
    </>
  ),
  view: (
    <>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  car: (
    <>
      <path d="M3.5 16.5V12l2-5.5h13l2 5.5v4.5" />
      <path d="M3 12h18M2.5 16.5h19v2H2.5Z" />
      <circle cx="7" cy="14.2" r="0.8" fill="currentColor" />
      <circle cx="17" cy="14.2" r="0.8" fill="currentColor" />
    </>
  ),
  plane: <path d="M10.5 21 12 17l-3-1v-2l3 .5V8.5L9 3h2l4 5.5 4.5-.5a1.5 1.5 0 0 1 0 3L15 11.5V17l3 1v2l-4-1-3.5 2Z" />,
  seat: <path d="M7 3v10a2 2 0 0 0 2 2h8v6M7 13h-.5A1.5 1.5 0 0 0 5 14.5V21M17 15l1.5-4" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
    </>
  ),
  chauffeur: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21v-1.5A5.5 5.5 0 0 1 10.5 14h3a5.5 5.5 0 0 1 5.5 5.5V21M8 5.5h8" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20v-1a5 5 0 0 1 5-5h3a5 5 0 0 1 5 5v1M16 4.8a3.2 3.2 0 0 1 0 6.4M18.5 14a5 5 0 0 1 3 4.6V20" />
    </>
  ),
  bed: <path d="M2.5 19V6M2.5 14h19v5M21.5 14v-2.5a3 3 0 0 0-3-3H11V14M7 11.2a1.7 1.7 0 1 0 0-.01" />,
  bath: <path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2ZM6 12V5a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" />,
  area: <path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l6.5 6.5M20 20l-6.5-6.5" />,
  pin: (
    <>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  menu: <path d="M3 8h18M3 16h18" />,
  arrow: <path d="M4 12h16M14 6l6 6-6 6" />,
  "arrow-left": <path d="M20 12H4M10 6l-6 6 6 6" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  "chevron-down": <path d="m5 9 7 7 7-7" />,
  plus: <path d="M12 4v16M4 12h16" />,
  minus: <path d="M4 12h16" />,
  phone: <path d="M5 3.5h3.5l1.8 4.5-2.3 1.5a11 11 0 0 0 6.5 6.5l1.5-2.3 4.5 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <path d="m3.5 6 8.5 7 8.5-7" />
    </>
  ),
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" />
    </>
  ),
  upload: <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3" />,
  chef: <path d="M7 14.5V20h10v-5.5M7 14.5a4 4 0 0 1-1.2-7.8A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 6.2 2.7A4 4 0 0 1 17 14.5H7ZM7 17h10" />,
  sparkle: <path d="M12 3c.5 4.5 2.5 6.5 7 7-4.5.5-6.5 2.5-7 7-.5-4.5-2.5-6.5-7-7 4.5-.5 6.5-2.5 7-7ZM19 16c.2 1.6.9 2.3 2.5 2.5-1.6.2-2.3.9-2.5 2.5-.2-1.6-.9-2.3-2.5-2.5 1.6-.2 2.3-.9 2.5-2.5Z" />,
  map: <path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20V6.5ZM9 4v13.5M15 6.5V20" />,
  basket: <path d="M3 10h18l-1.8 9.5a1.5 1.5 0 0 1-1.5 1.2H6.3a1.5 1.5 0 0 1-1.5-1.2L3 10ZM7.5 10l3-6M16.5 10l-3-6M9 14v3M15 14v3" />,
  shield: <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" />,
  key: (
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v6M14 11v6" />,
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
  logout: <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M9 8l-4 4 4 4M5 12h11" />,
  grid: <path d="M4 4h6.5v6.5H4ZM13.5 4H20v6.5h-6.5ZM4 13.5h6.5V20H4ZM13.5 13.5H20V20h-6.5Z" />,
  tag: (
    <>
      <path d="M3 12V4.5A1.5 1.5 0 0 1 4.5 3H12l9 9-9 9-9-9Z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  inbox: <path d="M3 13.5 5.5 4.5h13l2.5 9M3 13.5V19a1.5 1.5 0 0 0 1.5 1.5h15A1.5 1.5 0 0 0 21 19v-5.5M3 13.5h5l1.5 2.5h5l1.5-2.5h5" />,
  settings: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name, ...props }: { name: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name] ?? paths.sparkle}
    </svg>
  );
}

/** WhatsApp glyph (filled brand mark). */
export function WhatsAppIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3ZM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.6A11.8 11.8 0 0 0 12 23.8 11.8 11.8 0 0 0 20.4 3.6Z" />
    </svg>
  );
}
