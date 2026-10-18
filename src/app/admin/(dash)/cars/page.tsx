import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { Photo } from "@/components/Photo";
import { db } from "@/lib/db";
import { naira } from "@/lib/pricing";

export default async function AdminCars() {
  const cars = await db.list("cars");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-bronze">Fleet</p>
          <h1 className="mt-2 font-serif text-5xl">Cars</h1>
        </div>
        <Link href="/admin/cars/new" className="btn-ink">
          <Icon name="plus" className="h-4 w-4" /> Add car
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cars.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/cars/${c.id}`} className="block overflow-hidden rounded-2xl border border-line bg-white transition hover:border-ink">
              <div className="relative aspect-[16/9] bg-cream">
                {c.photo.src && <Photo src={c.photo.src} alt="" fill sizes="400px" className="object-cover" />}
                {!c.published && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[0.6rem] uppercase tracking-wider text-ivory">Hidden</span>}
              </div>
              <div className="p-4">
                <p className="font-serif text-2xl">{c.name}</p>
                <p className="text-sm text-stone">
                  {c.seats} seats · {naira(c.rates.daily)}/day · {c.selfDrive ? "chauffeur or self-drive" : "chauffeur only"}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
