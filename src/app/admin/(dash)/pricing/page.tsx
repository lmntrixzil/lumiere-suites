import { blankDiscount } from "@/components/admin/blanks";
import { PricingManager } from "@/components/admin/PricingManager";
import { db, getSettings } from "@/lib/db";

export default async function AdminPricing() {
  const [settings, codes] = await Promise.all([getSettings(), db.list("discounts")]);
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-bronze">Revenue</p>
        <h1 className="mt-2 font-serif text-5xl">Pricing &amp; codes</h1>
        <p className="mt-2 text-sm text-stone">Nightly and car rates are edited on each apartment and car.</p>
      </div>
      <PricingManager settings={settings} codes={codes} blank={blankDiscount()} />
    </div>
  );
}
