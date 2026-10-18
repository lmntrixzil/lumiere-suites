import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { usingSupabase } from "@/lib/db";
import { paymentMode } from "@/lib/payments";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const notices: string[] = [];
  if (!usingSupabase) notices.push("Demo data store: bookings and edits are saved to a local file. Connect Supabase before launch (see README).");
  if (paymentMode.paystack === "demo" || paymentMode.flutterwave === "demo") notices.push("Payments are in demo mode: add Paystack / Flutterwave secret keys to take real payments.");
  return <AdminShell notices={notices}>{children}</AdminShell>;
}
