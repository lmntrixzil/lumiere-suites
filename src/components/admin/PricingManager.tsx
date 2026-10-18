"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { naira } from "@/lib/pricing";
import type { DiscountCode, Settings } from "@/lib/types";
import { Icon } from "../icons/Icon";
import { deleteRecord, saveRecord } from "./api";

export function PricingManager({ settings, codes, blank }: { settings: Settings; codes: DiscountCode[]; blank: DiscountCode }) {
  const router = useRouter();
  const [s, setS] = useState(settings);
  const [msg, setMsg] = useState("");
  const [draft, setDraft] = useState<DiscountCode>(blank);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveRecord("settings", s);
    setMsg("Saved ✓");
    router.refresh();
  };
  const addCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.code.trim()) return;
    await saveRecord("discounts", { ...draft, code: draft.code.trim().toUpperCase() });
    setDraft({ ...blank, id: `dc-${crypto.randomUUID().slice(0, 8)}` });
    router.refresh();
  };
  const toggle = async (c: DiscountCode) => (await saveRecord("discounts", { ...c, active: !c.active }), router.refresh());
  const remove = async (c: DiscountCode) => confirm(`Delete ${c.code}?`) && (await deleteRecord("discounts", c.id), router.refresh());
  const n = (k: keyof Settings) => ({ value: s[k] as number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: Number(e.target.value) }) });

  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <form onSubmit={saveSettings} className="space-y-4 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-serif text-3xl">Pricing rules</h2>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="label">Weekly discount (7+ nights) %</label><input type="number" min={0} max={90} {...n("weeklyDiscountPct")} className="field-box" /></div>
          <div><label className="label">Monthly discount (28+ nights) %</label><input type="number" min={0} max={90} {...n("monthlyDiscountPct")} className="field-box" /></div>
          <div><label className="label">Airport transfer fee (₦ each way)</label><input type="number" min={0} step={1000} {...n("airportTransferFee")} className="field-box" /></div>
          <div><label className="label">₦ per US$ (for the $ toggle)</label><input type="number" min={1} {...n("usdRate")} className="field-box" /></div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ink">Save rules</button>
          <span className="text-sm text-stone">{msg}</span>
        </div>
      </form>

      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="font-serif text-3xl">Discount codes</h2>
        <ul className="mt-4 divide-y divide-line">
          {codes.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 py-3">
              <span className={`font-mono text-sm ${c.active ? "" : "text-stone line-through"}`}>{c.code}</span>
              <span className="text-sm text-stone">
                {c.type === "percent" ? `${c.value}% off` : `${naira(c.value)} off`}
                {c.expiresAt && ` · until ${c.expiresAt}`}
              </span>
              <span className="ml-auto flex gap-2">
                <button type="button" onClick={() => toggle(c)} className="rounded-full border border-line px-3 py-1 text-xs">{c.active ? "Pause" : "Activate"}</button>
                <button type="button" onClick={() => remove(c)} aria-label={`Delete ${c.code}`} className="text-red-700"><Icon name="trash" className="h-4 w-4" /></button>
              </span>
            </li>
          ))}
        </ul>
        <form onSubmit={addCode} className="mt-6 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">
          <input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })} placeholder="CODE" className="field-box font-mono uppercase" aria-label="Code" />
          <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value as DiscountCode["type"] })} className="field-box" aria-label="Type">
            <option value="percent">% off</option>
            <option value="fixed">₦ off</option>
          </select>
          <input type="number" min={1} value={draft.value} onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })} className="field-box" aria-label="Value" />
          <input type="date" value={draft.expiresAt ?? ""} onChange={(e) => setDraft({ ...draft, expiresAt: e.target.value || undefined })} className="field-box" aria-label="Expires" />
          <input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Description (shown to guest)" className="field-box col-span-2 sm:col-span-3" aria-label="Description" />
          <button className="btn-ink">Add code</button>
        </form>
      </div>
    </div>
  );
}
