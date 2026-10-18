/**
 * Data store with two interchangeable backends:
 *
 * 1. Supabase (production): set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and run
 *    supabase/schema.sql. Records live in one `lumiere_records` table as JSON, so
 *    adding a field to an apartment never needs a migration.
 * 2. Local JSON file (development / demo): used when Supabase is not configured.
 *    Data is written to .data/db.json, or /tmp on read-only hosts such as Vercel,
 *    where it does not persist between deploys. Use Supabase for a live site.
 *
 * Both backends are seeded with the starter content from seed.ts on first use.
 */
import { promises as fs } from "fs";
import path from "path";
import { seedApartments, seedCars, seedDiscounts, seedSettings } from "./seed";
import type { Apartment, Booking, Car, DiscountCode, Enquiry, Settings } from "./types";

type Collections = {
  apartments: Apartment;
  cars: Car;
  discounts: DiscountCode;
  bookings: Booking;
  enquiries: Enquiry;
  settings: Settings;
};
type Name = keyof Collections;

const seeds: { [K in Name]: Collections[K][] } = {
  apartments: seedApartments,
  cars: seedCars,
  discounts: seedDiscounts,
  bookings: [],
  enquiries: [],
  settings: [seedSettings],
};

/* ------------------------------------------------------------------ */
/* Supabase backend (PostgREST over fetch, no SDK needed)              */
/* ------------------------------------------------------------------ */

const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = Boolean(SB_URL && SB_KEY);

async function sb(pathAndQuery: string, init: RequestInit = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${pathAndQuery}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: SB_KEY!,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

const supabaseBackend = {
  async list<K extends Name>(name: K): Promise<Collections[K][]> {
    const rows = (await sb(`lumiere_records?collection=eq.${name}&select=data&order=updated_at.desc`)) as { data: Collections[K] }[];
    if (rows.length === 0 && seeds[name].length) {
      await Promise.all(seeds[name].map((item) => supabaseBackend.put(name, item)));
      return [...seeds[name]] as Collections[K][];
    }
    return rows.map((r) => r.data);
  },
  async put<K extends Name>(name: K, item: Collections[K]) {
    await sb("lumiere_records?on_conflict=collection,id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ collection: name, id: item.id, data: item, updated_at: new Date().toISOString() }),
    });
  },
  async remove(name: Name, id: string) {
    await sb(`lumiere_records?collection=eq.${name}&id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  },
};

/* ------------------------------------------------------------------ */
/* Local JSON backend                                                  */
/* ------------------------------------------------------------------ */

const DATA_DIR = process.env.VERCEL ? "/tmp/lumiere" : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");
type FileDb = { [K in Name]: Collections[K][] };

let cache: FileDb | null = null;
// Serialise writes so two quick requests never clobber each other.
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<FileDb> {
  if (cache) return cache;
  try {
    cache = { ...structuredClone(seeds), ...JSON.parse(await fs.readFile(DB_FILE, "utf8")) };
  } catch {
    cache = structuredClone(seeds);
  }
  return cache!;
}

async function save() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(cache, null, 2));
}

const fileBackend = {
  async list<K extends Name>(name: K): Promise<Collections[K][]> {
    return [...(await load())[name]] as Collections[K][];
  },
  async put<K extends Name>(name: K, item: Collections[K]) {
    queue = queue.then(async () => {
      const db = await load();
      const list = db[name] as Collections[K][];
      const i = list.findIndex((x) => x.id === item.id);
      if (i >= 0) list[i] = item;
      else list.unshift(item);
      await save();
    });
    await queue;
  },
  async remove(name: Name, id: string) {
    queue = queue.then(async () => {
      const db = await load();
      (db[name] as { id: string }[]) = (db[name] as { id: string }[]).filter((x) => x.id !== id);
      await save();
    });
    await queue;
  },
};

const backend = usingSupabase ? supabaseBackend : fileBackend;

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const db = {
  list: backend.list,
  put: backend.put,
  remove: backend.remove,
  async get<K extends Name>(name: K, id: string) {
    return (await backend.list(name)).find((x) => x.id === id) ?? null;
  },
};

export async function getSettings(): Promise<Settings> {
  return (await db.get("settings", "settings")) ?? seedSettings;
}

export async function getApartments({ includeHidden = false } = {}) {
  const all = await db.list("apartments");
  return includeHidden ? all : all.filter((a) => a.published);
}

export async function getApartmentBySlug(slug: string) {
  return (await getApartments()).find((a) => a.slug === slug) ?? null;
}

export async function getCars({ includeHidden = false } = {}) {
  const all = await db.list("cars");
  return includeHidden ? all : all.filter((c) => c.published);
}

export async function findDiscount(code: string) {
  const c = code.trim().toUpperCase();
  return (await db.list("discounts")).find((d) => d.code.toUpperCase() === c) ?? null;
}

export const newId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
