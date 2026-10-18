import { notFound } from "next/navigation";
import { blankCar } from "@/components/admin/blanks";
import { CarForm } from "@/components/admin/CarForm";
import { db } from "@/lib/db";

export default async function EditCar({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return <CarForm initial={blankCar()} isNew />;
  const car = await db.get("cars", id);
  if (!car) notFound();
  return <CarForm initial={car} isNew={false} />;
}
