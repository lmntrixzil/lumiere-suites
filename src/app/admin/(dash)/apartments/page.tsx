import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { Photo } from "@/components/Photo";
import { db } from "@/lib/db";
import { naira } from "@/lib/pricing";
import { locations } from "@/lib/site";

export default async function AdminApartments() {
  const apartments = await db.list("apartments");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-bronze">Inventory</p>
          <h1 className="mt-2 font-serif text-5xl">Apartments</h1>
        </div>
        <Link href="/admin/apartments/new" className="btn-ink">
          <Icon name="plus" className="h-4 w-4" /> Add apartment
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {apartments.map((a) => (
          <li key={a.id}>
            <Link href={`/admin/apartments/${a.id}`} className="block overflow-hidden rounded-2xl border border-line bg-white transition hover:border-ink">
              <div className="relative aspect-[16/9] bg-cream">
                {a.photos[0] && <Photo src={a.photos[0].src} alt="" fill sizes="400px" className="object-cover" />}
                {!a.published && <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[0.6rem] uppercase tracking-wider text-ivory">Hidden</span>}
              </div>
              <div className="p-4">
                <p className="font-serif text-2xl">{a.name}</p>
                <p className="text-sm text-stone">
                  {locations[a.location].name} · {a.bedrooms} bed · {naira(a.nightlyRate)}/night
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
