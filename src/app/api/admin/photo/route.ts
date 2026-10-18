import { NextResponse } from "next/server";
import { saveFile } from "@/lib/storage";

/** POST multipart "file" → public photo URL for apartments and cars. */
export async function POST(req: Request) {
  try {
    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file received." }, { status: 400 });
    return NextResponse.json({ url: await saveFile(file, "photos") });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
