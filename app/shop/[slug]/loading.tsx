/** Instant skeleton while the product/related-products fetch resolves —
 * without this, navigating from a product card to its detail page showed a
 * blank white page for the full fetch duration instead of any feedback. */
export default function Loading() {
  return (
    <section className="mx-auto mt-8 grid w-full max-w-[1600px] flex-1 animate-pulse gap-10 px-6 md:grid-cols-2 md:gap-16 md:px-10">
      <div className="aspect-[4/5] w-full bg-stone-100" />
      <div className="flex flex-col gap-4 pt-2">
        <div className="h-3 w-24 bg-stone-100" />
        <div className="h-8 w-3/4 bg-stone-100" />
        <div className="h-5 w-32 bg-stone-100" />
        <div className="mt-2 h-4 w-full bg-stone-100" />
        <div className="h-4 w-5/6 bg-stone-100" />
        <div className="mt-4 h-14 w-full bg-stone-100" />
      </div>
    </section>
  );
}
