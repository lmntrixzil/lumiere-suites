import { NextResponse } from "next/server";
import { unavailableCarDays, unavailableNights } from "@/lib/availability";

export const dynamic = "force-dynamic";

/** GET /api/availability?apartment=<id> or ?car=<id> → { blocked: ["YYYY-MM-DD", …] } */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apartment = searchParams.get("apartment");
  const car = searchParams.get("car");
  if (apartment) return NextResponse.json({ blocked: await unavailableNights(apartment) });
  if (car) return NextResponse.json({ blocked: await unavailableCarDays(car) });
  return NextResponse.json({ error: "Pass ?apartment= or ?car=" }, { status: 400 });
}
