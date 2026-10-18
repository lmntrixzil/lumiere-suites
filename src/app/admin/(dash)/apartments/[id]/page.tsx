import { notFound } from "next/navigation";
import { ApartmentForm } from "@/components/admin/ApartmentForm";
import { blankApartment } from "@/components/admin/blanks";
import { db } from "@/lib/db";

export default async function EditApartment({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return <ApartmentForm initial={blankApartment()} isNew />;
  const apt = await db.get("apartments", id);
  if (!apt) notFound();
  return <ApartmentForm initial={apt} isNew={false} />;
}
