"use client";
/**
 * ₦ / $ display toggle. Prices are stored and charged in Naira; dollars are an
 * approximate conversion for international guests using the admin-set rate.
 */
import { createContext, useContext, useEffect, useState } from "react";

type Currency = "NGN" | "USD";
const Ctx = createContext<{ currency: Currency; setCurrency: (c: Currency) => void; rate: number }>({
  currency: "NGN",
  setCurrency: () => {},
  rate: 1550,
});

export function CurrencyProvider({ rate, children }: { rate: number; children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("NGN");
  useEffect(() => {
    try {
      if (localStorage.getItem("lumiere-currency") === "USD") setCurrencyState("USD");
    } catch {}
  }, []);
  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("lumiere-currency", c);
    } catch {}
  };
  return <Ctx.Provider value={{ currency, setCurrency, rate }}>{children}</Ctx.Provider>;
}

export const useCurrency = () => useContext(Ctx);

export function useMoney() {
  const { currency, rate } = useCurrency();
  return (ngn: number) =>
    currency === "USD"
      ? `$${Math.round(ngn / rate).toLocaleString("en-US")}`
      : `₦${Math.round(ngn).toLocaleString("en-NG")}`;
}

/** Renders a Naira amount in the visitor's chosen currency. */
export function Price({ ngn, className }: { ngn: number; className?: string }) {
  const money = useMoney();
  return <span className={className}>{money(ngn)}</span>;
}

export function CurrencyToggle({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { currency, setCurrency } = useCurrency();
  const base = tone === "light" ? "border-white/40 text-white" : "border-ink/20 text-ink";
  return (
    <div role="group" aria-label="Display prices in" className={`inline-flex rounded-full border p-0.5 text-[0.68rem] font-medium tracking-[0.15em] ${base}`}>
      {(["NGN", "USD"] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={currency === c}
          onClick={() => setCurrency(c)}
          className={`rounded-full px-3 py-1.5 transition ${currency === c ? "bg-gold text-ink" : "opacity-80 hover:opacity-100"}`}
        >
          {c === "NGN" ? "₦" : "$"}
          <span className="sr-only">{c}</span>
        </button>
      ))}
    </div>
  );
}
