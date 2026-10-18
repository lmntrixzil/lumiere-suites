"use client";
import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import { formatDate } from "@/lib/dates";
import { naira } from "@/lib/pricing";
import type { Booking, BookingStatus } from "@/lib/types";
import { saveRecord } from "./api";

const STATUS: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  awaiting_transfer: "bg-orange-100 text-orange-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  completed: "bg-slate-200 text-slate-800",
  cancelled: "bg-red-100 text-red-800",
};

export function BookingsTable({ bookings, compact = false }: { bookings: Booking[]; compact?: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(
    () =>
      bookings
        .filter((b) => filter === "all" || b.status === filter)
        .filter((b) => !q || `${b.ref} ${b.guest.name} ${b.guest.email} ${b.stay?.apartmentName ?? ""} ${b.car?.carName ?? ""}`.toLowerCase().includes(q.toLowerCase()))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookings, filter, q],
  );

  const update = async (b: Booking, patch: Partial<Booking>) => {
    await saveRecord("bookings", { ...b, ...patch });
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-line bg-white">
      {!compact && (
        <div className="flex flex-wrap gap-3 border-b border-line p-4">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guest, ref, apartment…" className="field-box max-w-xs py-2" />
          <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="field-box w-auto py-2">
            <option value="all">All statuses</option>
            {Object.keys(STATUS).map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[0.65rem] uppercase tracking-[0.18em] text-stone">
            <tr className="border-b border-line">
              <th className="p-4 font-medium">Ref</th>
              <th className="p-4 font-medium">Guest</th>
              <th className="p-4 font-medium">Stay</th>
              <th className="p-4 font-medium">Car</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <Fragment key={b.id}>
                <tr className="cursor-pointer border-b border-line/70 hover:bg-ivory" onClick={() => setOpen(open === b.id ? null : b.id)}>
                  <td className="p-4 font-mono text-xs">{b.ref}</td>
                  <td className="p-4">
                    <span className="block">{b.guest.name}</span>
                    <span className="text-xs text-stone">{b.guest.phone}</span>
                  </td>
                  <td className="p-4">
                    {b.stay ? (
                      <>
                        <span className="block">{b.stay.apartmentName}</span>
                        <span className="text-xs text-stone">
                          {formatDate(b.stay.checkIn, { day: "numeric", month: "short" })} → {formatDate(b.stay.checkOut, { day: "numeric", month: "short" })}
                        </span>
                      </>
                    ) : (
                      <span className="text-stone">—</span>
                    )}
                  </td>
                  <td className="p-4">{b.car ? <span>{b.car.carName}{b.car.airportPickup && <span className="ml-1 text-xs text-bronze">✈︎</span>}</span> : <span className="text-stone">—</span>}</td>
                  <td className="p-4">
                    {naira(b.quote.total)}
                    <span className="block text-xs text-stone">
                      {b.payment.method}
                      {b.payment.paid ? " · paid" : ""}
                      {b.payment.demo ? " · demo" : ""}
                    </span>
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      aria-label={`Status for ${b.ref}`}
                      value={b.status}
                      onChange={(e) => update(b, { status: e.target.value as BookingStatus, payment: { ...b.payment, paid: b.payment.paid || e.target.value === "confirmed" } })}
                      className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium ${STATUS[b.status]}`}
                    >
                      {Object.keys(STATUS).map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
                {open === b.id && (
                  <tr className="border-b border-line bg-ivory/70">
                    <td colSpan={6} className="p-5">
                      <div className="grid grid-cols-1 gap-6 text-sm sm:grid-cols-3">
                        <div>
                          <p className="label">Guest</p>
                          <p>{b.guest.name}</p>
                          <p>
                            <a className="underline" href={`mailto:${b.guest.email}`}>
                              {b.guest.email}
                            </a>
                          </p>
                          <p>
                            <a className="underline" href={`https://wa.me/${b.guest.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                              {b.guest.phone}
                            </a>
                          </p>
                          {b.guest.flightNumber && <p>Flight {b.guest.flightNumber}</p>}
                          {b.guest.idDocument ? (
                            <a href={b.guest.idDocument} target="_blank" rel="noreferrer" className="mt-2 inline-block text-bronze underline">
                              View ID document
                            </a>
                          ) : (
                            <p className="mt-2 text-stone">No ID uploaded</p>
                          )}
                        </div>
                        <div>
                          <p className="label">Breakdown</p>
                          {b.quote.lines.map((l) => (
                            <p key={l.label} className="flex justify-between gap-3">
                              <span className="text-stone">{l.label}</span>
                              <span>{naira(l.amount)}</span>
                            </p>
                          ))}
                        </div>
                        <div>
                          <p className="label">Notes</p>
                          <p className="text-stone">{b.guest.notes || "—"}</p>
                          <p className="label mt-4">Created</p>
                          <p className="text-stone">{new Date(b.createdAt).toLocaleString("en-GB")}</p>
                          {b.discountCode && <p className="mt-2">Code: {b.discountCode}</p>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={6} className="p-10 text-center text-stone">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
