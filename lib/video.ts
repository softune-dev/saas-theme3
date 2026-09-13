/** Mirrors dashboard/components/products/product-video-field.tsx's
 * looksLikeExternalLink — a merchant's product video is either an uploaded
 * file (Cloudinary, playable directly via <video>) or a pasted YouTube/Vimeo
 * link (a webpage URL, NOT a video file — <video src="https://youtu.be/...">
 * can't decode that and just renders black). This turns a recognized link
 * into its embeddable iframe URL; returns null for anything else, which the
 * caller treats as a direct file. */
export function toEmbedUrl(url: string): string | null {
  const youtube = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{6,})/i,
  );
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}
