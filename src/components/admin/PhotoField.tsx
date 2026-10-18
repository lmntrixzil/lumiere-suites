"use client";
import { useState } from "react";
import type { Photo as PhotoT } from "@/lib/types";
import { Icon } from "../icons/Icon";
import { Photo } from "../Photo";
import { uploadPhoto } from "./api";

/** Edit a list of photos: upload, set alt text, reorder (first = cover), remove. */
export function PhotoListField({ value, onChange, max = 12 }: { value: PhotoT[]; onChange: (p: PhotoT[]) => void; max?: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async (files: FileList) => {
    setBusy(true);
    setError("");
    try {
      const added: PhotoT[] = [];
      for (const f of Array.from(files).slice(0, max - value.length)) added.push({ src: await uploadPhoto(f), alt: "" });
      onChange([...value, ...added]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const move = (i: number, d: number) => {
    const next = [...value];
    const [p] = next.splice(i, 1);
    next.splice(i + d, 0, p);
    onChange(next);
  };

  return (
    <div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {value.map((p, i) => (
          <li key={p.src + i} className="overflow-hidden rounded-xl border border-line bg-white">
            <div className="relative aspect-[4/3] bg-cream">
              <Photo src={p.src} alt={p.alt} fill sizes="300px" className="object-cover" />
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-gold">Cover</span>}
            </div>
            <div className="space-y-2 p-3">
              <input value={p.alt} onChange={(e) => onChange(value.map((x, n) => (n === i ? { ...x, alt: e.target.value } : x)))} placeholder="Describe the photo (alt text)" className="field-box py-2 text-sm" aria-label={`Alt text for photo ${i + 1}`} />
              <div className="flex justify-between">
                <span className="flex gap-1">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded-full border border-line px-2 py-1 text-xs disabled:opacity-30" aria-label="Move earlier">
                    ←
                  </button>
                  <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded-full border border-line px-2 py-1 text-xs disabled:opacity-30" aria-label="Move later">
                    →
                  </button>
                </span>
                <button type="button" onClick={() => onChange(value.filter((_, n) => n !== i))} className="text-red-700" aria-label="Remove photo">
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </li>
        ))}
        {value.length < max && (
          <li>
            <label className="flex aspect-[4/3] h-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ink/25 bg-white text-sm text-stone hover:border-ink">
              <Icon name="upload" className="h-6 w-6 text-bronze" />
              {busy ? "Uploading…" : "Upload photos"}
              <span className="text-xs">JPG, PNG, WebP · max 8 MB</span>
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => e.target.files && add(e.target.files)} />
            </label>
          </li>
        )}
      </ul>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
