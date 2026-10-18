"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/admin";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) return router.replace(next.startsWith("/admin") ? next : "/admin");
    setError("Incorrect password.");
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-white/10 bg-ink-soft p-8">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <p className="eyebrow mb-6 text-center text-gold">Admin</p>
      <label htmlFor="pw" className="mb-2 block text-xs uppercase tracking-[0.2em] text-ivory/60">
        Password
      </label>
      <input id="pw" type="password" autoFocus autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/15 bg-transparent px-4 py-3 text-ivory focus:border-gold focus:outline-none" />
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="btn-gold mt-6 w-full">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-4">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
