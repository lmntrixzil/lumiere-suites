"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Car } from "@/lib/types";
import { deleteRecord, saveRecord, slugify } from "./api";
import { BlockedDatesField } from "./BlockedDatesField";
import { PhotoListField } from "./PhotoField";

export function CarForm({ initial, isNew }: { initial: Car; isNew: boolean }) {
  const router = useRouter();
  const [c, setC] = useState<Car>(initial);
  const [status, setStatus] = useState("");
  const set = <K extends keyof Car>(k: K, v: Car[K]) => setC((x) => ({ ...x, [k]: v }));
  const rate = (k: keyof Car["rates"]) => ({ value: c.rates[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => set("rates", { ...c.rates, [k]: Number(e.target.value) }) });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!c.photo.src) return setStatus("Add a photo first.");
    setStatus("Saving…");
    try {
      const item = { ...c, slug: c.slug || slugify(c.name) };
      await saveRecord("cars", item);
      setStatus("Saved ✓");
      if (isNew) router.replace(`/admin/cars/${item.id}`);
      router.refresh();
    } catch (err) {
      setStatus((err as Error).message);
    }
  };
  const remove = async () => {
    if (!confirm(`Delete ${c.name}?`)) return;
    await deleteRecord("cars", c.id);
    router.replace("/admin/cars");
    router.refresh();
  };

  const section = "rounded-2xl border border-line bg-white/60 p-5 sm:p-6";
  return (
    <form onSubmit={save} className="space-y-6">
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-[#F4F1EB]/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
        <div>
          <Link href="/admin/cars" className="text-xs uppercase tracking-[0.2em] text-stone">← Cars</Link>
          <h1 className="font-serif text-3xl">{c.name || "New car"}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-stone" role="status">{status}</span>
          <button type="submit" className="btn-ink px-5 py-2.5">Save</button>
        </div>
      </div>

      <div className={section}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="cname">Name</label><input id="cname" required value={c.name} onChange={(e) => set("name", e.target.value)} className="field-box" /></div>
          <div><label className="label" htmlFor="cat">Category</label><input id="cat" value={c.category} onChange={(e) => set("category", e.target.value)} className="field-box" /></div>
          <div><label className="label">Seats</label><input type="number" min={1} value={c.seats} onChange={(e) => set("seats", Number(e.target.value))} className="field-box" /></div>
          <div><label className="label">Transmission</label>
            <select value={c.transmission} onChange={(e) => set("transmission", e.target.value as Car["transmission"])} className="field-box"><option>Automatic</option><option>Manual</option></select>
          </div>
          <div className="flex flex-wrap gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-[#0E1116]" /> Published</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={c.selfDrive} onChange={(e) => set("selfDrive", e.target.checked)} className="h-4 w-4 accent-[#0E1116]" /> Self-drive allowed</label>
          </div>
          <div className="sm:col-span-2"><label className="label" htmlFor="feat">Features (one per line)</label>
            <textarea id="feat" rows={3} value={c.features.join("\n")} onChange={(e) => set("features", e.target.value.split("\n"))} onBlur={() => set("features", c.features.map((f) => f.trim()).filter(Boolean))} className="field-box" />
          </div>
        </div>
      </div>

      <div className={section}>
        <h2 className="mb-4 font-serif text-2xl">Rates (₦, self-drive base)</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div><label className="label">Hourly</label><input type="number" min={0} step={1000} {...rate("hourly")} className="field-box" /></div>
          <div><label className="label">Daily</label><input type="number" min={0} step={1000} {...rate("daily")} className="field-box" /></div>
          <div><label className="label">Weekly</label><input type="number" min={0} step={1000} {...rate("weekly")} className="field-box" /></div>
          <div><label className="label">Chauffeur / day</label><input type="number" min={0} step={1000} value={c.chauffeurDailyFee} onChange={(e) => set("chauffeurDailyFee", Number(e.target.value))} className="field-box" /></div>
        </div>
        <p className="mt-3 text-xs text-stone">Hourly hire always includes a chauffeur. Weekly rate is applied automatically to full weeks.</p>
      </div>

      <div className={section}>
        <h2 className="mb-4 font-serif text-2xl">Photo</h2>
        <PhotoListField value={c.photo.src ? [c.photo] : []} onChange={(p) => set("photo", p[0] ?? { src: "", alt: "" })} max={1} />
      </div>

      <div className={section}>
        <h2 className="mb-4 font-serif text-2xl">Availability</h2>
        <BlockedDatesField value={c.blockedDates} onChange={(d) => set("blockedDates", d)} />
      </div>

      {!isNew && <button type="button" onClick={remove} className="text-sm text-red-700 underline">Delete this car</button>}
    </form>
  );
}
