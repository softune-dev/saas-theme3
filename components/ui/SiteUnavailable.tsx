/**
 * Shown when the root layout can't load a site config.
 *
 * This replaces Next.js's opaque "Application error: a client-side exception
 * has occurred", which is what the visitor used to get, because the root
 * layout is not allowed to call notFound(). In practice this screen means one
 * of two things, and both are worth naming instead of guessing at.
 */
export function SiteUnavailable({ host }: { host: string }) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <h1
        style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        className="text-3xl text-stone-900"
      >
        Site unavailable
      </h1>

      <p className="max-w-md text-sm leading-relaxed text-stone-500">
        No published site was found for{" "}
        <span className="font-medium text-stone-700">{host}</span>.
      </p>

      {isDev ? (
        <div className="mt-2 max-w-md rounded-xl bg-stone-50 p-4 text-left">
          <p className="text-xs font-semibold tracking-wide text-stone-700 uppercase">
            Development checklist
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-xs leading-relaxed text-stone-500">
            <li>
              Is the API running on{" "}
              <code className="text-stone-700">localhost:8000</code>? Start it
              with <code className="text-stone-700">uvicorn app.main:app --reload</code>.
            </li>
            <li>
              Does a published site exist for this host? Check{" "}
              <code className="text-stone-700">SITE_HOST</code> in{" "}
              <code className="text-stone-700">.env.local</code>.
            </li>
            <li>
              Opening this page from the dashboard preview? It passes{" "}
              <code className="text-stone-700">?__site=</code> and remembers it
              in a cookie — a stale cookie from a deleted site lands here.
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
