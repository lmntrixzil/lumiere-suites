"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "../icons/Icon";

const links = [
  { href: "/admin", label: "Overview", icon: "grid" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/apartments", label: "Apartments", icon: "bed" },
  { href: "/admin/cars", label: "Cars", icon: "car" },
  { href: "/admin/pricing", label: "Pricing & codes", icon: "tag" },
  { href: "/admin/inbox", label: "Inbox", icon: "inbox" },
];

export function AdminShell({ children, notices }: { children: React.ReactNode; notices: string[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <div className="min-h-screen bg-[#F4F1EB] lg:grid lg:grid-cols-[240px_1fr]">
      <aside className={`${open ? "block" : "hidden"} fixed inset-0 z-40 bg-ink p-5 text-ivory lg:static lg:block`}>
        <div className="flex items-center justify-between">
          <Link href="/admin" className="font-serif text-2xl tracking-[0.2em]">
            LUMIÈRE
          </Link>
          <button type="button" className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <p className="eyebrow mt-1 text-gold">Admin</p>
        <nav className="mt-10 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active(l.href) ? "bg-white/10 text-gold" : "text-ivory/70 hover:bg-white/5 hover:text-ivory"}`}>
              <Icon name={l.icon} className="h-5 w-5" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-10 space-y-1 border-t border-white/10 pt-6">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/70 hover:text-ivory">
            <Icon name="external" className="h-5 w-5" /> View site
          </Link>
          <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/70 hover:text-ivory">
            <Icon name="logout" className="h-5 w-5" /> Sign out
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
            <Icon name="menu" className="h-6 w-6" />
          </button>
          <span className="font-serif text-xl tracking-[0.2em]">LUMIÈRE</span>
          <span className="w-6" />
        </header>
        {notices.map((n) => (
          <p key={n} className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-900">
            {n}
          </p>
        ))}
        <div className="p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
