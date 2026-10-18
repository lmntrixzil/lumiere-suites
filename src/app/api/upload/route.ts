import { NextResponse } from "next/server";
import { saveFile } from "@/lib/storage";

/** POST /api/upload (multipart, field "file") → stores a guest ID privately. */
export async function POST(req: Request) {
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
    return NextResponse.json({ path: await saveFile(file, "guest-ids") });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
