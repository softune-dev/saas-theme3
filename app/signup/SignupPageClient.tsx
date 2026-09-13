"use client";

import React, { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Footer } from "@/components/footer/Footer";

export function SignupPageClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col justify-center px-6 py-12 md:px-10 md:py-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-stone-500">
              Join
            </p>
            <h1
              style={{ fontFamily: '"Fraunces", Georgia, serif' }}
              className="mt-2 font-display text-3xl leading-tight tracking-tight text-[var(--foreground)] sm:text-4xl"
            >
              Create Account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Sign up for faster checkout and exclusive updates.
            </p>
          </div>

          <div className="border hairline bg-stone-50/50 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-stone-700">
                  Full name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full border border-stone-300 bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--brand)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-stone-700">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-stone-300 bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--brand)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-stone-700">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full border border-stone-300 bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--brand)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-stone-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-stone-300 bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-stone-400 focus:border-[var(--brand)] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--theme-btn-radius)] bg-[var(--brand)] py-4 text-[12px] font-semibold tracking-[0.24em] text-[var(--background)] uppercase transition-opacity hover:opacity-90"
              >
                <span>Create Account</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 border-t hairline pt-5 text-center text-xs text-stone-500">
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-medium text-[var(--foreground)] link-underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
