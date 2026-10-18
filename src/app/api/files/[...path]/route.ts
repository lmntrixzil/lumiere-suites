import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminToken } from "@/lib/auth";
import { readFile, type Bucket } from "@/lib/storage";

/** Serves uploaded files. Guest IDs are only visible to a signed-in admin. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const [bucket, name] = (await params).path;
  if (bucket !== "photos" && bucket !== "guest-ids") return new Response("Not found", { status: 404 });
  if (bucket === "guest-ids" && !(await isAdminToken((await cookies()).get(ADMIN_COOKIE)?.value))) {
    return new Response("Forbidden", { status: 403 });
  }
  const file = await readFile(bucket as Bucket, name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.body), {
    headers: {
      "Content-Type": file.type,
      "Cache-Control": bucket === "photos" ? "public, max-age=31536000, immutable" : "private, no-store",
    },
  });
}
