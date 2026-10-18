import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendNotification } from "@/lib/email";
import type { Enquiry } from "@/lib/types";

/** POST /api/enquiries → concierge requests and contact messages. */
export async function POST(req: Request) {
  const body = await req.json();
  const { kind, name, email, phone, message, service, date, company } = body ?? {};
  // "company" is a hidden honeypot field; real visitors never fill it in.
  if (company) return NextResponse.json({ ok: true });
  if (!name?.trim() || !email?.includes("@") || !message?.trim()) {
    return NextResponse.json({ error: "Please add your name, email and a short message." }, { status: 400 });
  }
  const enquiry: Enquiry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    kind: kind === "concierge" ? "concierge" : "contact",
    service: service || undefined,
    name: String(name).slice(0, 120),
    email: String(email).slice(0, 160),
    phone: String(phone || "").slice(0, 40),
    date: date || undefined,
    message: String(message).slice(0, 4000),
    handled: false,
  };
  await db.put("enquiries", enquiry);
  await sendNotification(
    `New ${enquiry.kind} enquiry${enquiry.service ? `: ${enquiry.service}` : ""}`,
    `${enquiry.name} · ${enquiry.email} · ${enquiry.phone}\n${enquiry.date ? `Date: ${enquiry.date}\n` : ""}\n${enquiry.message}`,
  );
  return NextResponse.json({ ok: true });
}
