"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/auth/me")
      .then((response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => {
        if (isMounted && data?.user) {
          router.replace("/dashboard");
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload?.error ?? "Login failed");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1e2330] lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="order-2 flex items-center justify-center bg-[radial-gradient(circle_at_70%_0%,#6a2432_0%,#2b1f33_45%,#0c1322_100%)] px-8 py-12 text-white lg:order-1 lg:py-0">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <svg
                width="30"
                height="22"
                viewBox="0 0 30 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="1" y="4" width="28" height="14" rx="7" fill="#F04747" />
                <circle cx="9" cy="11" r="2" fill="#0C1322" />
                <circle cx="21" cy="9" r="1.6" fill="#0C1322" />
                <circle cx="23.5" cy="11.5" r="1.6" fill="#0C1322" />
              </svg>
            </div>
            <h1 className="mt-8 font-[var(--font-display)] text-2xl font-semibold tracking-[0.35em] text-[#F04747]">
              GAMECENTER
            </h1>
            <p className="mt-6 text-sm leading-6 text-white/70">
              Professional Management System for PlayStation Rentals. Track time,
              manage snacks, and optimize revenue seamlessly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
              {[
                { label: "Secure" },
                { label: "Fast" },
                { label: "Analytics" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F04747]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0c1322]" />
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="order-1 flex items-center justify-center px-8 py-12 lg:order-2 lg:py-0">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-semibold text-[#1f2433]">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-[#6d7487]">
              Please enter your cashier credentials to access the dashboard.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-xs font-semibold text-[#5a6072]">
                Username
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="mt-2 w-full rounded-lg border border-[#e3e7ef] bg-white px-3 py-2.5 text-sm text-[#1f2433] outline-none transition focus:border-[#F04747]"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>
              <label className="block text-xs font-semibold text-[#5a6072]">
                Password
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="mt-2 w-full rounded-lg border border-[#e3e7ef] bg-white px-3 py-2.5 text-sm text-[#1f2433] outline-none transition focus:border-[#F04747]"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
              <div className="flex items-center justify-between text-xs text-[#6d7487]">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border border-[#cdd3dd]"
                  />
                  Remember me
                </label>
                <button type="button" className="font-semibold text-[#F04747]">
                  Forgot password?
                </button>
              </div>
              {error ? (
                <div className="rounded-lg border border-[#f8caca] bg-[#feecec] px-3 py-2 text-xs text-[#f04747]">
                  {error}
                </div>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_12px_30px_rgba(240,71,71,0.35)] ${
                  isSubmitting
                    ? "cursor-not-allowed bg-[#f6a0a0]"
                    : "bg-[#F04747]"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15">
                  &gt;
                </span>
                {isSubmitting ? "Signing In..." : "Sign In to Dashboard"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-4 text-xs text-[#8a91a3]">
              <div className="h-px flex-1 bg-[#e5e8f0]" />
              <span>Need help? Contact Admin</span>
              <div className="h-px flex-1 bg-[#e5e8f0]" />
            </div>

            <p className="mt-6 text-center text-[11px] text-[#a1a7b6]">
              (c) 2026 GameCenter Management System. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
