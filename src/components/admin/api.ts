/** Small client helpers for the admin dashboard. */
export async function saveRecord(collection: string, item: unknown) {
  const res = await fetch("/api/admin/records", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection, item }) });
  if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
}

export async function deleteRecord(collection: string, id: string) {
  const res = await fetch("/api/admin/records", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection, id }) });
  if (!res.ok) throw new Error((await res.json()).error ?? "Delete failed");
}

export async function uploadPhoto(file: File) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/photo", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Upload failed");
  return json.url as string;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
