"use client";
import { useRouter } from "next/navigation";
import type { Enquiry } from "@/lib/types";
import { saveRecord } from "./api";

export function InboxList({ items }: { items: Enquiry[] }) {
  const router = useRouter();
  const toggle = async (e: Enquiry) => (await saveRecord("enquiries", { ...e, handled: !e.handled }), router.refresh());
  if (!items.length) return <p className="rounded-2xl border border-line bg-white p-10 text-center text-stone">No enquiries yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((e) => (
        <li key={e.id} className={`rounded-2xl border bg-white p-5 ${e.handled ? "border-line opacity-60" : "border-gold"}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-[0.62rem] uppercase tracking-wider text-bronze">{e.kind}</span>
              <p className="mt-2 font-medium">
                {e.name} {e.service && <span className="font-normal text-stone">· {e.service}</span>}
              </p>
              <p className="text-sm text-stone">
                <a href={`mailto:${e.email}`} className="underline">{e.email}</a>
                {e.phone && <> · <a href={`https://wa.me/${e.phone.replace(/\D/g, "")}`} className="underline" target="_blank" rel="noreferrer">{e.phone}</a></>}
                {e.date && ` · for ${e.date}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone">{new Date(e.createdAt).toLocaleString("en-GB")}</span>
              <button type="button" onClick={() => toggle(e)} className="rounded-full border border-line px-3 py-1 text-xs">{e.handled ? "Reopen" : "Mark handled"}</button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-line text-sm">{e.message}</p>
        </li>
      ))}
    </ul>
  );
}
