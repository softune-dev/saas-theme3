"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface ProductReviewsProps {
  averageRating?: number;
  totalReviews?: number;
}

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

/** No backend for reviews yet — see the module-level TODO in
 * ProductDetailClient's caller. This component stays session-only (a
 * submitted review lives only in this tab, same as the old mock version),
 * but starts genuinely empty instead of seeded with two fake reviews, and
 * shows an honest "no reviews yet" state rather than fabricated defaults. */
export function ProductReviews({ averageRating = 0, totalReviews = 0 }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);

  // Real distribution once reviews are backend-stored; until then, an empty
  // set of bars (0%) rather than a fabricated 75/15/5/3/2 split.
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percentage: 0,
    count: 0,
  }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const comment = formData.get("review") as string;

    const newReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      name: name || "Anonymous",
      rating,
      date: "Today",
      comment: comment || "",
    };

    setSubmitted(true);
    setTimeout(() => {
      setReviewsList((prev) => [newReview, ...prev]);
      setShowForm(false);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <section className="py-10 md:py-12 w-full max-w-[1200px] mx-auto px-6 md:px-10">
      <h3
        style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        className="font-display text-2xl md:text-3xl mb-10 text-[var(--foreground)] text-left"
      >
        Customer Reviews
      </h3>

      <div className="grid md:grid-cols-12 gap-8 md:gap-12 lg:gap-16">
        {/* Left: Play Store Style Rating Summary */}
        <div className="md:col-span-4 flex flex-col items-start gap-6 w-full">
          <div className="text-left">
            <div className="text-6xl font-semibold tracking-tight text-[var(--foreground)]">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex gap-1 my-2 text-stone-850">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(averageRating)
                      ? "fill-stone-850 text-stone-850"
                      : "fill-transparent stroke-stone-300"
                    }`}
                />
              ))}
            </div>
            <div className="text-xs text-stone-500 uppercase tracking-widest font-medium">
              {totalReviews} Ratings
            </div>
          </div>

          <div className="w-full space-y-2.5 pt-2">
            {distribution.map((dist) => (
              <div key={dist.stars} className="flex items-center gap-3 text-xs">
                <span className="w-2 font-medium text-stone-550">{dist.stars}</span>
                <div className="flex-1 h-1.5 bg-stone-200/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-stone-850 rounded-full"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actual Reviews List OR Review Form */}
        <div className="md:col-span-8 w-full flex flex-col gap-8">
          {showForm ? (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {submitted ? (
                <div className="py-8 text-center space-y-2">
                  <h4 className="text-lg font-medium text-[var(--foreground)]">Review Submitted</h4>
                  <p className="text-sm text-stone-500">Thank you for sharing your experience.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">Write a Review</h4>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="text-[10px] uppercase tracking-widest text-stone-500 hover:text-[var(--foreground)] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-medium text-stone-600 mb-2">
                      Your Rating
                    </label>
                    <div className="flex gap-1.5 cursor-pointer">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`w-5 h-5 transition-colors ${star <= (hoverRating || rating)
                              ? "fill-stone-850 text-stone-850"
                              : "fill-transparent stroke-stone-300"
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-[10px] uppercase tracking-widest font-medium text-stone-600 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)] transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="review" className="block text-[10px] uppercase tracking-widest font-medium text-stone-600 mb-2">
                      Review
                    </label>
                    <textarea
                      id="review"
                      name="review"
                      required
                      rows={4}
                      className="w-full bg-stone-50 border border-stone-200 px-4 py-2.5 text-sm outline-none focus:border-[var(--brand)] transition-colors resize-none"
                      placeholder="Share your experience"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-[var(--theme-btn-radius)] bg-[var(--brand)] text-[var(--background)] py-3 text-[11px] uppercase tracking-[0.24em] font-semibold hover:opacity-90 transition-opacity"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          ) : reviewsList.length === 0 ? (
            <div className="flex flex-col items-start gap-4 text-left md:items-end md:text-right">
              <p className="w-full text-left text-sm text-stone-500 md:text-right">
                No reviews yet. Be the first to share your experience.
              </p>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-8 py-3 text-[11px] font-semibold tracking-[0.24em] text-[var(--background)] uppercase transition-opacity hover:opacity-90"
              >
                Write a Review
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex justify-start md:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-[var(--theme-btn-radius)] bg-[var(--brand)] px-8 py-3 text-[11px] font-semibold tracking-[0.24em] text-[var(--background)] uppercase transition-opacity hover:opacity-90"
                >
                  Write a Review
                </button>
              </div>
              {reviewsList.map((rev) => (
                <div key={rev.id} className="space-y-2 text-left">
                  <div className="flex items-center gap-3">
                    {/* Dummy User Avatar with initials */}
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-stone-600 shrink-0">
                      {rev.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4 w-full">
                      <div className="font-semibold text-xs text-[var(--foreground)] uppercase tracking-wider">
                        {rev.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5 text-stone-850">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating
                                  ? "fill-stone-850 text-stone-850"
                                  : "fill-transparent stroke-stone-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-300 select-none">•</span>
                        <div className="text-[10px] text-stone-500">{rev.date}</div>
                      </div>
                    </div>
                  </div>

                  {/* Text wraps nicely below the avatar to maximize mobile width */}
                  <p className="text-sm text-stone-600 leading-relaxed font-light pl-11">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
