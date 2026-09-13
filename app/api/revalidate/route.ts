import { revalidateTag, revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * The other half of "edit without redeploy" (see app/worker.py's
 * handle_revalidate_site and lib/get-site.ts's fetch caching). A save on
 * the dashboard queues a call here; this is what actually drops the cached
 * page so the next visitor gets fresh content instead of waiting out the
 * 60s `revalidate` window.
 *
 * Site config is cached by TAG (`site-{host}`), not by path — see
 * fetchSiteConfig — so revalidateTag is what actually matters here.
 * revalidatePath for each given path is a defensive extra, not the primary
 * mechanism.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  const host = request.headers.get("host") ?? "";
  const body = (await request.json().catch(() => ({}))) as { paths?: string[] };

  revalidateTag(`site-${host}`);
  revalidateTag(`sitemap-${host}`);
  for (const path of body.paths ?? []) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, host });
}
