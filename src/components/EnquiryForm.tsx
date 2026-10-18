"use client";
/** Concierge request / contact form. Posts to /api/enquiries. */
import { useState } from "react";
import { todayISO } from "@/lib/dates";
import { Icon } from "./icons/Icon";

export function EnquiryForm({ kind, services }: { kind: "concierge" | "contact"; services?: string[] }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("sending");
    setError("");
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, kind, service: chosen.join(", ") || undefined }),
    });
    if (res.ok) return setState("sent");
    setError((await res.json()).error ?? "Something went wrong.");
    setState("idle");
  };

  if (state === "sent") {
    return (
      <div className="card p-10 text-center animate-fade" role="status">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold">
          <Icon name="check" className="h-6 w-6 text-bronze" />
        </span>
        <p className="mt-6 font-serif text-3xl">Thank you</p>
        <p className="mt-2 text-stone">Your request is with our team. We usually reply within the hour.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
      {services && (
        <fieldset className="sm:col-span-2">
          <legend className="label">What can we arrange?</legend>
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const on = chosen.includes(s);
              return (
                <button key={s} type="button" aria-pressed={on} onClick={() => setChosen(on ? chosen.filter((x) => x !== s) : [...chosen, s])} className={`rounded-full border px-4 py-2 text-sm transition ${on ? "border-ink bg-ink text-ivory" : "border-line bg-white hover:border-ink/50"}`}>
                  {s}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      <div>
        <label htmlFor={`${kind}-name`} className="label">
          Name
        </label>
        <input id={`${kind}-name`} name="name" required autoComplete="name" className="field-box" />
      </div>
      <div>
        <label htmlFor={`${kind}-phone`} className="label">
          Phone / WhatsApp
        </label>
        <input id={`${kind}-phone`} name="phone" type="tel" autoComplete="tel" className="field-box" />
      </div>
      <div className={kind === "concierge" ? "" : "sm:col-span-2"}>
        <label htmlFor={`${kind}-email`} className="label">
          Email
        </label>
        <input id={`${kind}-email`} name="email" type="email" required autoComplete="email" className="field-box" />
      </div>
      {kind === "concierge" && (
        <div>
          <label htmlFor="concierge-date" className="label">
            Date needed
          </label>
          <input id="concierge-date" name="date" type="date" min={todayISO()} className="field-box" />
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor={`${kind}-message`} className="label">
          {kind === "concierge" ? "Tell us the details" : "Message"}
        </label>
        <textarea id={`${kind}-message`} name="message" required rows={5} className="field-box" placeholder={kind === "concierge" ? "Number of guests, times, booking reference if you have one…" : ""} />
      </div>
      {/* Honeypot: hidden from people, tempting to bots */}
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {error && (
        <p role="alert" className="text-sm text-red-700 sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="btn-ink w-full sm:w-auto">
          {state === "sending" ? "Sending…" : kind === "concierge" ? "Send request" : "Send message"}
        </button>
      </div>
    </form>
  );
}
