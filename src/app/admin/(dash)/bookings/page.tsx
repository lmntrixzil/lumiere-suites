import { BookingsTable } from "@/components/admin/BookingsTable";
import { db } from "@/lib/db";

export default async function AdminBookings() {
  const bookings = await db.list("bookings");
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-bronze">Reservations</p>
        <h1 className="mt-2 font-serif text-5xl">Bookings</h1>
        <p className="mt-2 text-sm text-stone">Click a row for guest details, ID and price breakdown. Mark bank transfers as confirmed once the money lands; cancelling frees the dates.</p>
      </div>
      <BookingsTable bookings={bookings} />
    </div>
  );
}
