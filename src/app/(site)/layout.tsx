import { CurrencyProvider } from "@/components/Currency";
import { FloatingActions } from "@/components/FloatingActions";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getSettings } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <CurrencyProvider rate={settings.usdRate}>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <FloatingActions />
    </CurrencyProvider>
  );
}
