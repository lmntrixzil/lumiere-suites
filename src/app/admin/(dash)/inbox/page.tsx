import { InboxList } from "@/components/admin/InboxList";
import { db } from "@/lib/db";

export default async function AdminInbox() {
  const items = (await db.list("enquiries")).sort((a, b) => Number(a.handled) - Number(b.handled) || b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-bronze">Messages</p>
        <h1 className="mt-2 font-serif text-5xl">Inbox</h1>
      </div>
      <InboxList items={items} />
    </div>
  );
}
