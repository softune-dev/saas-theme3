"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatTaka } from "@/lib/utils";

type Hit = { slug: string; name: string; category: string; price: number; image: string | null };

/**
 * Products matching what the shopper is typing, shown right under the search
 * box (from /api/search). Picking one opens it; "See all" opens the shop
 * filtered by the same words.
 */
export function SearchResults({ query, onPick }: { query: string; onPick: () => void }) {
  const q = query.trim();
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.length < 2) {
      setHits([]);
      setTotal(0);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : { items: [], total: 0 }))
        .then((d) => {
          setHits(d.items ?? []);
          setTotal(d.total ?? 0);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  if (q.length < 2) return null;

  return (
    // onMouseDown keeps the input focused, so a click lands before any blur closes us.
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="max-h-[70vh] overflow-y-auto bg-[var(--background)] text-[var(--foreground)]"
    >
      {hits.length === 0 ? (
        <p className="px-4 py-5 text-sm opacity-60">
          {loading ? "Searching…" : `No products found for “${q}”`}
        </p>
      ) : (
        <>
          <ul>
            {hits.map((h) => (
              <li key={h.slug}>
                <Link
                  href={`/shop/${h.slug}`}
                  onClick={onPick}
                  className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-black/[0.04]"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden bg-black/[0.04]">
                    {h.image ? <Image src={h.image} alt="" fill sizes="48px" className="object-cover" /> : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{h.name}</span>
                    {h.category ? <span className="block truncate text-xs opacity-55">{h.category}</span> : null}
                  </span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{formatTaka(h.price)}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href={`/shop?q=${encodeURIComponent(q)}`}
            onClick={onPick}
            className="block border-t border-black/10 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] hover:bg-black/[0.04]"
          >
            See all {total} result{total === 1 ? "" : "s"}
          </Link>
        </>
      )}
    </div>
  );
}
