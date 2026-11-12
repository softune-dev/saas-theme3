"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { SearchResults } from "./SearchResults";

/**
 * Header search: the icon opens a bar under the header. Matching products
 * appear under it as you type (SearchResults); Enter goes to /shop?q=..., where the shop page filters the catalog (lib/search.ts).
 * Escape or the close button dismisses it. The bar is rendered into the
 * sticky <header> itself so it spans the full width, whatever box the icon
 * sits in.
 */
export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(buttonRef.current?.closest("header") ?? null);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search"
        aria-expanded={open}
        className="p-2 text-[var(--foreground)] transition-colors hover:text-[var(--brand)]"
      >
        <Search strokeWidth={1.25} className="h-5 w-5" />
      </button>

      {open && host
        ? createPortal(
        <div className="absolute inset-x-0 top-full z-50 border-b hairline bg-[var(--background)] shadow-sm">
          <form onSubmit={submit} className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4 md:px-10">
            <Search strokeWidth={1.25} className="h-5 w-5 shrink-0 text-[var(--foreground)] opacity-60" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              enterKeyHint="search"
              className="min-w-0 flex-1 bg-transparent py-2 text-base text-[var(--foreground)] outline-none placeholder:text-stone-400"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close search"
              className="p-2 text-[var(--foreground)] opacity-60 transition-opacity hover:opacity-100"
            >
              <X strokeWidth={1.25} className="h-5 w-5" />
            </button>
          </form>
          <div className="mx-auto max-w-3xl md:px-6">
            <SearchResults
              query={query}
              onPick={() => {
                setOpen(false);
                setQuery("");
              }}
            />
          </div>
        </div>,
          host,
        )
        : null}
    </>
  );
}
