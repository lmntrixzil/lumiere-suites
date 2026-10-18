/**
 * File storage for apartment/car photos (public) and guest ID documents (private).
 * Uses Supabase Storage when configured, otherwise the local .data folder.
 * Files are always served through /api/files/<bucket>/<name>, which checks that
 * only an admin can open guest IDs.
 */
import { promises as fs } from "fs";
import path from "path";
import { usingSupabase } from "./db";

export type Bucket = "photos" | "guest-ids";

const LOCAL_DIR = process.env.VERCEL ? "/tmp/lumiere/uploads" : path.join(process.cwd(), ".data", "uploads");

export const ALLOWED: Record<Bucket, string[]> = {
  photos: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  "guest-ids": ["image/jpeg", "image/png", "image/webp", "application/pdf"],
};
export const MAX_BYTES = 8 * 1024 * 1024;

const extFor = (type: string) => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "application/pdf": "pdf" })[type] || "bin";

export async function saveFile(file: File, bucket: Bucket) {
  if (!ALLOWED[bucket].includes(file.type)) throw new Error("That file type is not supported.");
  if (file.size > MAX_BYTES) throw new Error("Files must be under 8 MB.");
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extFor(file.type)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (usingSupabase) {
    const res = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": file.type },
      body: bytes,
    });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    // Public photos can be served straight from the Supabase CDN.
    if (bucket === "photos") return `${process.env.SUPABASE_URL}/storage/v1/object/public/photos/${name}`;
  } else {
    await fs.mkdir(path.join(LOCAL_DIR, bucket), { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, bucket, name), bytes);
  }
  return `/api/files/${bucket}/${name}`;
}

export async function readFile(bucket: Bucket, name: string) {
  const safe = path.basename(name);
  if (usingSupabase) {
    const res = await fetch(`${process.env.SUPABASE_URL}/storage/v1/object/${bucket}/${safe}`, {
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    if (!res.ok) return null;
    return { body: Buffer.from(await res.arrayBuffer()), type: res.headers.get("content-type") || "application/octet-stream" };
  }
  try {
    const body = await fs.readFile(path.join(LOCAL_DIR, bucket, safe));
    const ext = path.extname(safe).slice(1);
    const type = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", pdf: "application/pdf" }[ext] || "application/octet-stream";
    return { body, type };
  } catch {
    return null;
  }
}
