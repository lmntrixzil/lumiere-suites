"use client";
/**
 * Combined checkout: 1 Stay → 2 Car (optional) → 3 Guest details → 4 Payment.
 * A stay, a car, or both can be booked. The summary on the right recalculates
 * live; the server recalculates again before any money is taken.
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { rangeIsFreeClient } from "@/lib/availability-client";
import { addDays, diffDays, formatDate, todayISO } from "@/lib/dates";
import { buildQuote } from "@/lib/pricing";
import { locations, site } from "@/lib/site";
import type { Apartment, Booking, Car, CarRateType, CarSelection, DiscountCode, DriveMode, PaymentMethod, Settings } from "@/lib/types";
import { CurrencyToggle, useMoney } from "./Currency";
import { RangeCalendar, type RangeValue } from "./DateRangePicker";
import { Icon } from "./icons/Icon";
import { Photo } from "./Photo";

type Props = {
  apartments: Apartment[];
  cars: Car[];
  settings: Settings;
  aptBlocked: Record<string, string[]>;
  carBlocked: Record<string, string[]>;
  paystackKey?: string;
  flutterwaveKey?: string;
};

const STEPS = ["Stay", "Car", "Your details", "Payment"] as const;
const SHORT = ["Stay", "Car", "Details", "Pay"];

declare global {
  interface Window {
    PaystackPop?: { setup: (o: Record<string, unknown>) => { openIframe: () => void } };
    FlutterwaveCheckout?: (o: Record<string, unknown>) => void;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the payment window. Check your connection."));
    document.body.appendChild(s);
  });
}

export function Checkout({ apartments, cars, settings, aptBlocked, carBlocked, paystackKey, flutterwaveKey }: Props) {
  const params = useSearchParams();
  const router = useRouter();
  const money = useMoney();

  /* ---------- state, pre-filled from the URL ---------- */
  const initialApt = apartments.find((a) => a.slug === params.get("apt"));
  const initialCar = cars.find((c) => c.slug === params.get("car"));
  const carOnly = !initialApt && !!initialCar;

  const [step, setStep] = useState(initialApt && params.get("checkIn") ? (initialCar ? 2 : 1) : carOnly ? 1 : 0);
  const [wantStay, setWantStay] = useState(!carOnly);
  const [aptId, setAptId] = useState(initialApt?.id ?? apartments[0]?.id);
  const [dates, setDates] = useState<RangeValue>({ from: params.get("checkIn") ?? undefined, to: params.get("checkOut") ?? undefined });
  const [guests, setGuests] = useState(Number(params.get("guests") || 2));

  const [wantCar, setWantCar] = useState(!!initialCar);
  const [carId, setCarId] = useState(initialCar?.id ?? cars[0]?.id);
  const [mode, setMode] = useState<DriveMode>((params.get("mode") as DriveMode) || "chauffeur");
  const [rateType, setRateType] = useState<CarRateType>((params.get("rate") as CarRateType) || "daily");
  const [carStart, setCarStart] = useState<string | undefined>(params.get("start") ?? params.get("checkIn") ?? undefined);
  const [units, setUnits] = useState(Number(params.get("units") || 0));
  const [pickup, setPickup] = useState(params.get("pickup") === "1");
  const [dropoff, setDropoff] = useState(false);

  const [guest, setGuest] = useState({ name: "", phone: "", email: "", flightNumber: "", notes: "" });
  const [idDoc, setIdDoc] = useState<{ name: string; path: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [agree, setAgree] = useState(false);

  const [method, setMethod] = useState<PaymentMethod>("paystack");
  const [codeInput, setCodeInput] = useState("");
  const [discount, setDiscount] = useState<DiscountCode | null>(null);
  const [codeMsg, setCodeMsg] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const apartment = wantStay ? apartments.find((a) => a.id === aptId) ?? null : null;
  const car = wantCar ? cars.find((c) => c.id === carId) ?? null : null;
  const nights = dates.from && dates.to ? diffDays(dates.from, dates.to) : 0;

  // Default the car to the stay dates.
  useEffect(() => {
    if (wantStay && dates.from && !params.get("start")) setCarStart(dates.from);
    if (wantStay && nights && !params.get("units")) setUnits(nights);
  }, [wantStay, dates.from, nights, params]);

  // Bring validation messages into view (the phone action bar sits far from them).
  useEffect(() => {
    if (error) document.getElementById("checkout-error")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [error]);

  // Self-drive not available on hourly or chauffeur-only cars.
  const effectiveMode: DriveMode = car && car.selfDrive && rateType !== "hourly" ? mode : "chauffeur";
  const effUnits = units || (rateType === "hourly" ? 4 : rateType === "weekly" ? 7 : 1);

  const carSel: CarSelection | null =
    car && carStart ? { carId: car.id, mode: effectiveMode, rateType, start: carStart, units: effUnits, airportPickup: pickup, airportDropoff: dropoff } : null;

  const quote = buildQuote({ settings, apartment, checkIn: dates.from, checkOut: dates.to, car, carSel, discount }); // cheap enough to run every render

  /* ---------- validation per step ---------- */
  const stayError = (() => {
    if (!wantStay) return "";
    if (!apartment) return "Choose an apartment.";
    if (!dates.from || !dates.to) return "Choose your check-in and check-out dates.";
    if (nights < apartment.minNights) return `${apartment.name} has a ${apartment.minNights}-night minimum.`;
    if (!rangeIsFreeClient(dates.from, dates.to, aptBlocked[apartment.id] ?? [])) return "Some of those nights are booked. Please choose other dates.";
    if (guests > apartment.maxGuests) return `${apartment.name} sleeps up to ${apartment.maxGuests}.`;
    return "";
  })();

  const carError = (() => {
    if (!wantCar) return wantStay ? "" : "Choose a car, or go back and add a stay.";
    if (!car) return "Choose a car.";
    if (!carStart) return "Choose a pickup date.";
    const days = rateType === "hourly" ? 1 : rateType === "weekly" ? Math.ceil(effUnits / 7) * 7 : effUnits;
    if (!rangeIsFreeClient(carStart, addDays(carStart, days), carBlocked[car.id] ?? [])) return `The ${car.name} is booked on some of those days. Try another car or date.`;
    return "";
  })();

  const detailsError = (() => {
    if (!guest.name.trim()) return "Please add your full name.";
    if (!/^\+?[\d\s()-]{7,}$/.test(guest.phone)) return "Please add a valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(guest.email)) return "Please add a valid email address.";
    if (wantStay && !idDoc) return "Please upload a photo of your ID.";
    if (wantCar && pickup && !guest.flightNumber.trim()) return "Add your arrival flight number for the airport pickup.";
    if (!agree) return "Please accept the house rules and cancellation policy.";
    return "";
  })();

  const stepError = [stayError, carError, detailsError, ""][step];

  const next = () => {
    if (step === 0 && !wantStay) {
      setWantCar(true);
      return setStep(1);
    }
    if (stepError) return setError(stepError);
    setError("");
    setStep((s) => Math.min(3, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const back = () => {
    setError("");
    setStep((s) => Math.max(0, s - 1));
  };

  /* ---------- actions ---------- */
  const uploadId = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setIdDoc({ name: file.name, path: json.path });
    } catch (e) {
      setError((e as Error).message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const applyCode = async () => {
    setCodeMsg("");
    if (!codeInput.trim()) return;
    const res = await fetch(`/api/discount?code=${encodeURIComponent(codeInput.trim())}`);
    if (!res.ok) {
      setDiscount(null);
      return setCodeMsg("That code isn't valid.");
    }
    const { discount: d } = await res.json();
    setDiscount(d);
    setCodeMsg(`${d.code} applied: ${d.description}`);
  };

  const verify = async (ref: string, provider: "paystack" | "flutterwave", reference?: string, transactionId?: string) => {
    const res = await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref, provider, reference, transactionId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error);
    router.push(`/book/confirmation?id=${json.booking.id}`);
  };

  const pay = async () => {
    for (const [i, e] of [stayError, carError, detailsError].entries()) {
      if (e) {
        setStep(i);
        return setError(e);
      }
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stay: wantStay && apartment ? { apartmentId: apartment.id, checkIn: dates.from, checkOut: dates.to, guests } : null,
          car: carSel,
          guest: { ...guest, idDocument: idDoc?.path },
          paymentMethod: method,
          discountCode: discount?.code,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      const booking: Booking = json.booking;

      if (method === "transfer") return router.push(`/book/confirmation?id=${booking.id}`);

      // No public key configured: simulate a successful payment (demo mode).
      if (method === "paystack" && !paystackKey) return await verify(booking.ref, "paystack", booking.ref);
      if (method === "flutterwave" && !flutterwaveKey) return await verify(booking.ref, "flutterwave", booking.ref);

      if (method === "paystack") {
        await loadScript("https://js.paystack.co/v1/inline.js");
        window.PaystackPop!.setup({
          key: paystackKey,
          email: booking.guest.email,
          amount: Math.round(booking.quote.total * 100),
          currency: "NGN",
          ref: booking.ref,
          metadata: { booking_ref: booking.ref, custom_fields: [{ display_name: "Guest", variable_name: "guest", value: booking.guest.name }] },
          callback: (r: { reference: string }) => {
            verify(booking.ref, "paystack", r.reference).catch((e) => (setError(e.message), setBusy(false)));
          },
          onClose: () => setBusy(false),
        }).openIframe();
      } else {
        await loadScript("https://checkout.flutterwave.com/v3.js");
        window.FlutterwaveCheckout!({
          public_key: flutterwaveKey,
          tx_ref: booking.ref,
          amount: booking.quote.total,
          currency: "NGN",
          payment_options: "card,banktransfer,ussd",
          customer: { email: booking.guest.email, phone_number: booking.guest.phone, name: booking.guest.name },
          customizations: { title: site.name, description: `Booking ${booking.ref}` },
          callback: (d: { transaction_id: number; tx_ref: string }) => {
            verify(booking.ref, "flutterwave", d.tx_ref, String(d.transaction_id)).catch((e) => (setError(e.message), setBusy(false)));
          },
          onclose: () => setBusy(false),
        });
      }
    } catch (e) {
      setError((e as Error).message || "Something went wrong.");
      setBusy(false);
    }
  };

  /* ---------- UI helpers ---------- */
  const optionCls = (active: boolean, pad = "p-4") => `rounded-2xl border ${pad} text-left transition ${active ? "border-ink bg-white shadow-[0_0_0_1px_#0E1116]" : "border-line bg-white hover:border-ink/40"}`;
  const stepper = (val: number, set: (n: number) => void, min: number, max: number, label: string) => (
    <div className="flex items-center gap-2">
      <button type="button" aria-label={`Fewer ${label}`} onClick={() => set(Math.max(min, val - 1))} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white hover:border-ink">
        <Icon name="minus" className="h-3.5 w-3.5" />
      </button>
      <span className="w-10 text-center" aria-live="polite">
        {val}
      </span>
      <button type="button" aria-label={`More ${label}`} onClick={() => set(Math.min(max, val + 1))} className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white hover:border-ink">
        <Icon name="plus" className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const summary = (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow text-bronze">Your booking</p>
        <CurrencyToggle tone="dark" />
      </div>
      {apartment && (
        <div className="mt-5 flex gap-4">
          <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
            <Photo src={apartment.photos[0].src} alt="" fill sizes="96px" className="object-cover" />
          </div>
          <div>
            <p className="font-serif text-xl leading-tight">{apartment.name}</p>
            <p className="text-xs text-stone">{locations[apartment.location].name}</p>
            {dates.from && dates.to && (
              <p className="mt-1 text-xs text-ink">
                {formatDate(dates.from, { day: "numeric", month: "short" })} → {formatDate(dates.to, { day: "numeric", month: "short" })} · {guests} guest{guests > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      )}
      {car && (
        <div className="mt-4 flex gap-4">
          <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
            <Photo src={car.photo.src} alt="" fill sizes="96px" className="object-cover" />
          </div>
          <div>
            <p className="font-serif text-lg leading-tight">{car.name}</p>
            <p className="text-xs text-stone">{effectiveMode === "chauffeur" ? "With chauffeur" : "Self-drive"}</p>
          </div>
        </div>
      )}
      {quote.lines.length > 0 ? (
        <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm" aria-live="polite">
          {quote.lines.map((l) => (
            <div key={l.label} className="flex justify-between gap-4">
              <dt className={l.kind === "discount" ? "text-bronze" : "text-stone"}>
                {l.label}
                {l.note && <span className="block text-xs text-mist">{l.note}</span>}
              </dt>
              <dd className={`shrink-0 ${l.kind === "discount" ? "text-bronze" : ""}`}>
                {l.amount < 0 ? "−" : ""}
                {money(Math.abs(l.amount))}
              </dd>
            </div>
          ))}
          <div className="flex justify-between border-t border-line pt-3 font-serif text-2xl">
            <dt>Total</dt>
            <dd>{money(quote.total)}</dd>
          </div>
          <p className="text-xs text-stone">Charged in Naira{quote.cautionDeposit ? `, including a ${money(quote.cautionDeposit)} refundable deposit` : ""}.</p>
        </dl>
      ) : (
        <p className="mt-6 border-t border-line pt-5 text-sm text-stone">Choose dates to see your total.</p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0">
        {/* Progress */}
        <ol className="mb-10 grid grid-cols-4 gap-2" aria-label="Checkout progress">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                aria-current={i === step ? "step" : undefined}
                className="group w-full py-2 text-left disabled:cursor-default"
              >
                <span className={`block h-0.5 rounded-full transition ${i <= step ? "bg-gold" : "bg-line"}`} />
                <span className={`mt-3 block text-[0.62rem] font-medium uppercase tracking-[0.22em] ${i === step ? "text-ink" : "text-stone"}`}>
                  <span className="hidden sm:inline">Step {i + 1} · {s}</span>
                  <span className="sm:hidden">{SHORT[i]}</span>
                  {i === 1 && <span className="hidden normal-case tracking-normal text-mist sm:inline"> (optional)</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* ---------------- Step 1: Stay ---------------- */}
        {step === 0 && (
          <section aria-labelledby="s1" className="animate-fade">
            <h2 id="s1" className="font-serif text-4xl sm:text-5xl">
              Where would you like to stay?
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {apartments.map((a) => (
                <button key={a.id} type="button" onClick={() => (setWantStay(true), setAptId(a.id))} className={`${optionCls(wantStay && aptId === a.id)} flex gap-4`} aria-pressed={wantStay && aptId === a.id}>
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <Photo src={a.photos[0].src} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-xl leading-tight">{a.name}</span>
                    <span className="block text-xs text-stone">
                      {locations[a.location].name} · {a.bedrooms} bed · up to {a.maxGuests}
                    </span>
                    <span className="mt-1 block text-sm">{money(a.nightlyRate)} / night</span>
                  </span>
                </button>
              ))}
            </div>
            <button type="button" onClick={() => (setWantStay(false), setWantCar(true), setStep(1))} className="mt-4 text-sm text-stone underline underline-offset-4 hover:text-ink">
              I only need a car
            </button>

            {apartment && (
              <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-[1fr_220px]">
                <div className="card p-5">
                  <RangeCalendar value={dates} onChange={setDates} blocked={aptBlocked[apartment.id]} minNights={apartment.minNights} />
                </div>
                <div className="card h-fit p-5">
                  <p className="label">Guests</p>
                  {stepper(guests, setGuests, 1, apartment.maxGuests, "guests")}
                  <p className="mt-2 text-xs text-stone">Sleeps up to {apartment.maxGuests}</p>
                  {nights > 0 && (
                    <p className="mt-5 border-t border-line pt-4 text-sm">
                      <span className="font-serif text-3xl">{nights}</span> night{nights > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ---------------- Step 2: Car ---------------- */}
        {step === 1 && (
          <section aria-labelledby="s2" className="animate-fade">
            <h2 id="s2" className="font-serif text-4xl sm:text-5xl">
              {wantStay ? "Would you like a car?" : "Choose your car"}
            </h2>
            {wantStay && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-md">
                <button type="button" onClick={() => setWantCar(false)} className={optionCls(!wantCar)} aria-pressed={!wantCar}>
                  No car, thanks
                </button>
                <button type="button" onClick={() => setWantCar(true)} className={optionCls(wantCar)} aria-pressed={wantCar}>
                  Yes, add a car
                </button>
              </div>
            )}

            {wantCar && (
              <div className="mt-8 space-y-8">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {cars.map((c) => (
                    <button key={c.id} type="button" onClick={() => setCarId(c.id)} className={`${optionCls(carId === c.id, "p-0")} flex overflow-hidden sm:block`} aria-pressed={carId === c.id}>
                      <span className="relative block w-28 shrink-0 sm:aspect-[16/9] sm:w-auto">
                        <Photo src={c.photo.src} alt="" fill sizes="300px" className="object-cover" />
                      </span>
                      <span className="block min-w-0 p-3 sm:p-4">
                        <span className="block font-serif text-lg leading-tight sm:text-xl">{c.name}</span>
                        <span className="text-xs text-stone">
                          {c.seats} seats · {c.selfDrive ? "Chauffeur or self-drive" : "Chauffeur only"}
                        </span>
                        <span className="mt-1 block text-sm">{money(c.rates.daily)} / day</span>
                      </span>
                    </button>
                  ))}
                </div>

                {car && (
                  <div className="card grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
                    <div>
                      <p className="label">Hire by the</p>
                      <div className="inline-flex rounded-full border border-line p-1">
                        {(["hourly", "daily", "weekly"] as const).map((r) => (
                          <button key={r} type="button" onClick={() => (setRateType(r), setUnits(r === "hourly" ? 4 : r === "weekly" ? Math.max(7, nights) : nights || 1))} className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.15em] ${rateType === r ? "bg-ink text-ivory" : "text-stone"}`}>
                            {r === "hourly" ? "Hour" : r === "daily" ? "Day" : "Week"}
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-stone">
                        {money(car.rates[rateType])} / {rateType === "hourly" ? "hour" : rateType === "daily" ? "day" : "week"}
                      </p>
                    </div>
                    <div>
                      <p className="label">Driving</p>
                      {car.selfDrive && rateType !== "hourly" ? (
                        <div className="inline-flex rounded-full border border-line p-1">
                          {(["chauffeur", "self"] as const).map((m) => (
                            <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.15em] ${effectiveMode === m ? "bg-ink text-ivory" : "text-stone"}`}>
                              {m === "chauffeur" ? "Chauffeur" : "Self-drive"}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">With chauffeur</p>
                      )}
                      {effectiveMode === "chauffeur" && rateType !== "hourly" && <p className="mt-2 text-xs text-stone">+{money(car.chauffeurDailyFee)} / day for your chauffeur</p>}
                    </div>
                    <div>
                      <label htmlFor="carStart" className="label">
                        Pickup date
                      </label>
                      <input id="carStart" type="date" min={todayISO()} value={carStart ?? ""} onChange={(e) => setCarStart(e.target.value || undefined)} className="field-box" />
                    </div>
                    <div>
                      <p className="label">{rateType === "hourly" ? "Hours (min 4)" : "Days"}</p>
                      {stepper(effUnits, setUnits, rateType === "hourly" ? 4 : rateType === "weekly" ? 7 : 1, 90, rateType === "hourly" ? "hours" : "days")}
                    </div>
                    <div className="space-y-3 sm:col-span-2">
                      <p className="label">Murtala Muhammed International Airport (MMIA)</p>
                      <label className="flex items-center gap-3 text-sm">
                        <input type="checkbox" checked={pickup} onChange={(e) => setPickup(e.target.checked)} className="h-4 w-4 accent-[#0E1116]" />
                        Airport pickup on arrival (+{money(settings.airportTransferFee)})
                      </label>
                      <label className="flex items-center gap-3 text-sm">
                        <input type="checkbox" checked={dropoff} onChange={(e) => setDropoff(e.target.checked)} className="h-4 w-4 accent-[#0E1116]" />
                        Airport drop-off on departure (+{money(settings.airportTransferFee)})
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ---------------- Step 3: Guest details ---------------- */}
        {step === 2 && (
          <section aria-labelledby="s3" className="animate-fade">
            <h2 id="s3" className="font-serif text-4xl sm:text-5xl">
              Your details
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="label">
                  Full name (as on your ID)
                </label>
                <input id="name" autoComplete="name" value={guest.name} onChange={(e) => setGuest({ ...guest, name: e.target.value })} className="field-box" />
              </div>
              <div>
                <label htmlFor="phone" className="label">
                  Phone (WhatsApp preferred)
                </label>
                <input id="phone" type="tel" autoComplete="tel" placeholder="+234 …" value={guest.phone} onChange={(e) => setGuest({ ...guest, phone: e.target.value })} className="field-box" />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input id="email" type="email" autoComplete="email" value={guest.email} onChange={(e) => setGuest({ ...guest, email: e.target.value })} className="field-box" />
              </div>
              {wantCar && pickup && (
                <div className="sm:col-span-2">
                  <label htmlFor="flight" className="label">
                    Arrival flight number
                  </label>
                  <input id="flight" placeholder="e.g. BA75" value={guest.flightNumber} onChange={(e) => setGuest({ ...guest, flightNumber: e.target.value })} className="field-box uppercase" />
                  <p className="mt-1.5 text-xs text-stone">Your chauffeur tracks the flight and waits at arrivals.</p>
                </div>
              )}
              {wantStay && (
                <div className="sm:col-span-2">
                  <p className="label">Government ID</p>
                  <label className={`flex cursor-pointer items-center gap-4 rounded-xl border border-dashed p-5 transition ${idDoc ? "border-gold bg-gold/5" : "border-ink/25 bg-white hover:border-ink"}`}>
                    <Icon name={idDoc ? "check" : "upload"} className="h-7 w-7 shrink-0 text-bronze" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{uploading ? "Uploading…" : idDoc ? idDoc.name : "Upload passport, driver's licence or national ID"}</span>
                      <span className="text-xs text-stone">JPG, PNG or PDF up to 8 MB. Stored privately, only our team can see it.</span>
                    </span>
                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && uploadId(e.target.files[0])} />
                  </label>
                </div>
              )}
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="label">
                  Anything we should know? (optional)
                </label>
                <textarea id="notes" rows={3} placeholder="Celebrations, dietary needs, early check-in…" value={guest.notes} onChange={(e) => setGuest({ ...guest, notes: e.target.value })} className="field-box" />
              </div>
              <label className="flex gap-3 text-sm sm:col-span-2">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#0E1116]" />
                <span>
                  I agree to the{" "}
                  <Link href="/faq" target="_blank" className="underline underline-offset-4">
                    house rules, caution fee and cancellation policy
                  </Link>
                  .
                </span>
              </label>
            </div>
          </section>
        )}

        {/* ---------------- Step 4: Payment ---------------- */}
        {step === 3 && (
          <section aria-labelledby="s4" className="animate-fade">
            <h2 id="s4" className="font-serif text-4xl sm:text-5xl">
              Payment
            </h2>
            <div className="mt-8 grid gap-3" role="radiogroup" aria-label="Payment method">
              {(
                [
                  ["paystack", "Paystack", "Card, bank, USSD or Apple Pay. Instant confirmation.", paystackKey],
                  ["flutterwave", "Flutterwave", "Local and international cards, bank transfer, USSD.", flutterwaveKey],
                  ["transfer", "Pay by bank transfer", "We hold your dates for 12 hours while you transfer.", "n/a"],
                ] as const
              ).map(([id, label, desc, key]) => (
                <button key={id} type="button" role="radio" aria-checked={method === id} onClick={() => setMethod(id)} className={`${optionCls(method === id)} flex items-center gap-4`}>
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${method === id ? "border-ink" : "border-line"}`}>{method === id && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}</span>
                  <span className="flex-1">
                    <span className="block font-medium">
                      {label}
                      {!key && <span className="ml-2 rounded-full bg-cream px-2 py-0.5 text-[0.6rem] uppercase tracking-wider text-bronze">Demo</span>}
                    </span>
                    <span className="text-sm text-stone">{desc}</span>
                  </span>
                </button>
              ))}
            </div>

            {method === "transfer" && (
              <div className="mt-5 rounded-2xl bg-ink p-6 text-ivory">
                <p className="eyebrow text-gold">Transfer to</p>
                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-ivory/60">Bank</dt>
                    <dd className="font-serif text-xl">{site.bank.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-ivory/60">Account name</dt>
                    <dd className="font-serif text-xl">{site.bank.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-ivory/60">Account number</dt>
                    <dd className="font-serif text-xl tracking-wider">{site.bank.accountNumber}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-ivory/60">Use your booking reference (shown on the next page) as the transfer narration. We confirm as soon as it lands.</p>
              </div>
            )}

            <div className="mt-8">
              <label htmlFor="code" className="label">
                Discount code
              </label>
              <div className="flex gap-2">
                <input id="code" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && applyCode()} placeholder="e.g. WELCOME10" className="field-box uppercase" />
                <button type="button" onClick={applyCode} className="btn-ghost shrink-0">
                  Apply
                </button>
              </div>
              {codeMsg && <p className={`mt-2 text-sm ${discount ? "text-bronze" : "text-red-700"}`}>{codeMsg}</p>}
            </div>
          </section>
        )}

        {/* Navigation */}
        {error && (
          <p id="checkout-error" role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
        <div className="mt-10 hidden items-center justify-between gap-4 border-t border-line pt-6 lg:flex">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn-ghost">
              <Icon name="arrow-left" className="h-4 w-4" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className="btn-ink">
              Continue <Icon name="arrow" className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" onClick={pay} disabled={busy} className="btn-gold px-8 py-4">
              {busy ? "Processing…" : method === "transfer" ? "Confirm booking" : `Pay ${money(quote.total)}`}
            </button>
          )}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-stone">
          <Icon name="shield" className="h-4 w-4 text-bronze" /> Payments are processed securely by Paystack or Flutterwave. We never see your card details.
        </p>
      </div>

      <aside id="summary" className="scroll-mt-24 pb-24 lg:sticky lg:top-28 lg:h-fit lg:pb-0">{summary}</aside>

      {/* Phones and tablets: sticky bar with the live total and the next action */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={back} aria-label="Back" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/20">
              <Icon name="arrow-left" className="h-4 w-4" />
            </button>
          )}
          <a href="#summary" className="min-w-0 flex-1">
            <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-stone">{quote.lines.length ? "Total · view" : "Your booking"}</span>
            <span className="block truncate font-serif text-2xl leading-tight">{quote.lines.length ? money(quote.total) : "—"}</span>
          </a>
          {step < 3 ? (
            <button type="button" onClick={next} className="btn-ink shrink-0 px-5">
              Continue
            </button>
          ) : (
            <button type="button" onClick={pay} disabled={busy} className="btn-gold shrink-0 px-5">
              {busy ? "…" : method === "transfer" ? "Confirm" : "Pay now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

