"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { locations } from "@/lib/site";
import type { AmenityKey, Apartment } from "@/lib/types";
import { amenityLabels } from "../amenities";
import { deleteRecord, saveRecord, slugify } from "./api";
import { BlockedDatesField } from "./BlockedDatesField";
import { PhotoListField } from "./PhotoField";

export function ApartmentForm({ initial, isNew }: { initial: Apartment; isNew: boolean }) {
  const router = useRouter();
  const [a, setA] = useState<Apartment>(initial);
  const [status, setStatus] = useState("");
  const set = <K extends keyof Apartment>(k: K, v: Apartment[K]) => setA((x) => ({ ...x, [k]: v }));
  const num = (k: keyof Apartment) => ({ value: a[k] as number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving…");
    try {
      const item = { ...a, slug: a.slug || slugify(a.name) };
      await saveRecord("apartments", item);
      setStatus("Saved ✓");
      if (isNew) router.replace(`/admin/apartments/${item.id}`);
      router.refresh();
    } catch (err) {
      setStatus((err as Error).message);
    }
  };
  const remove = async () => {
    if (!confirm(`Delete ${a.name}? This cannot be undone. Existing bookings are kept.`)) return;
    await deleteRecord("apartments", a.id);
    router.replace("/admin/apartments");
    router.refresh();
  };

  const section = "rounded-2xl border border-line bg-white/60 p-5 sm:p-6";
  return (
    <form onSubmit={save} className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-[#F4F1EB]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div>
          <Link href="/admin/apartments" className="text-xs uppercase tracking-[0.2em] text-stone">
            ← Apartments
          </Link>
          <h1 className="font-serif text-3xl">{a.name || "New apartment"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone" role="status">
            {status}
          </span>
          {!isNew && (
            <Link href={`/apartments/${a.slug}`} target="_blank" className="btn-ghost px-4 py-2">
              View
            </Link>
          )}
          <button type="submit" className="btn-ink px-5 py-2.5">
            Save
          </button>
        </div>
      </div>

      <div className={section}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" required value={a.name} onChange={(e) => (set("name", e.target.value), isNew && set("slug", slugify(e.target.value)))} className="field-box" />
          </div>
          <div>
            <label className="label" htmlFor="slug">URL slug</label>
            <input id="slug" value={a.slug} onChange={(e) => set("slug", slugify(e.target.value))} className="field-box" />
          </div>
          <div>
            <label className="label" htmlFor="loc">Location</label>
            <select id="loc" value={a.location} onChange={(e) => set("location", e.target.value as Apartment["location"])} className="field-box">
              {Object.values(locations).map((l) => (
                <option key={l.slug} value={l.slug}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="area">General area (public)</label>
            <input id="area" value={a.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Off Bourdillon Road, Ikoyi" className="field-box" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="tagline">Tagline</label>
            <input id="tagline" value={a.tagline} onChange={(e) => set("tagline", e.target.value)} className="field-box" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="desc">Description</label>
            <textarea id="desc" rows={5} value={a.description} onChange={(e) => set("description", e.target.value)} className="field-box" />
          </div>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={a.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#0E1116]" /> Published (visible on site)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={a.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-[#0E1116]" /> Featured on home page</label>
          </div>
        </div>
      </div>

      <div className={section}>
        <h2 className="mb-4 font-serif text-2xl">Pricing &amp; capacity</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><label className="label">Nightly rate (₦)</label><input type="number" min={0} step={1000} {...num("nightlyRate")} className="field-box" /></div>
          <div><label className="label">Caution fee (₦)</label><input type="number" min={0} step={1000} {...num("cautionFee")} className="field-box" /></div>
          <div><label className="label">Min nights</label><input type="number" min={1} {...num("minNights")} className="field-box" /></div>
          <div><label className="label">Max guests</label><input type="number" min={1} {...num("maxGuests")} className="field-box" /></div>
          <div><label className="label">Bedrooms</label><input type="number" min={0} {...num("bedrooms")} className="field-box" /></div>
          <div><label className="label">Bathrooms</label><input type="number" min={0} step={0.5} {...num("bathrooms")} className="field-box" /></div>
          <div><label className="label">Size (m²)</label><input type="number" min={0} {...num("sizeSqm")} className="field-box" /></div>
          <div><label className="label">Check-in / out</label>
            <div className="flex gap-2"><input type="time" value={a.checkIn} onChange={(e) => set("checkIn", e.target.value)} className="field-box px-2" aria-label="Check-in time" /><input type="time" value={a.checkOut} onChange={(e) => set("checkOut", e.target.value)} className="field-box px-2" aria-label="Check-out time" /></div>
          </div>
          <div><label className="label">Rating</label><input type="number" min={0} max={5} step={0.01} {...num("rating")} className="field-box" /></div>
          <div><label className="label">Review count</label><input type="number" min={0} {...num("reviewCount")} className="field-box" /></div>
        </div>
      </div>

      <div className={section}>
        <h2 className="mb-4 font-serif text-2xl">Photos</h2>
        <PhotoListField value={a.photos} onChange={(p) => set("photos", p)} />
      </div>

      <div className={section}>
        <h2 className="mb-4 font-serif text-2xl">Amenities</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(amenityLabels) as AmenityKey[]).map((k) => (
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={a.amenities.includes(k)} onChange={(e) => set("amenities", e.target.checked ? [...a.amenities, k] : a.amenities.filter((x) => x !== k))} className="h-4 w-4 accent-[#0E1116]" />
              {amenityLabels[k]}
            </label>
          ))}
        </div>
        <label className="label mt-6" htmlFor="rules">House rules (one per line)</label>
        <textarea id="rules" rows={5} value={a.houseRules.join("\n")} onChange={(e) => set("houseRules", e.target.value.split("\n"))} onBlur={() => set("houseRules", a.houseRules.map((r) => r.trim()).filter(Boolean))} className="field-box" />
      </div>

      <div className={section}>
        <h2 className="mb-4 font-serif text-2xl">Availability</h2>
        <BlockedDatesField value={a.blockedDates} onChange={(d) => set("blockedDates", d)} />
      </div>

      {!isNew && (
        <button type="button" onClick={remove} className="text-sm text-red-700 underline">
          Delete this apartment
        </button>
      )}
    </form>
  );
}
