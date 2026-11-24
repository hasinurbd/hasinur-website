import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { getMockData, mockReviews as defaultMockReviews } from '../../lib/mockData';
import { Star, Quote, StarHalf, MessageSquare } from 'lucide-react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';

const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

function CountryFlag({ flag }: { flag: string }) {
  if (!flag) return null;

  if (flag.startsWith('http')) {
    return (
      <img
        src={flag}
        alt="Client country"
        loading="lazy"
        decoding="async"
        className="h-3.5 object-contain rounded-sm"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  const isEmoji = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/.test(flag);
  const isCode = /^[A-Z]{2}$/i.test(flag);

  if (isEmoji || isCode) {
    const code = isEmoji
      ? Array.from(flag)
          .map((char) => String.fromCodePoint((char.codePointAt(0) || 0) - 127397))
          .join('')
          .toLowerCase()
      : flag.toLowerCase();

    if (code.length === 2) {
      return (
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt={code.toUpperCase()}
          loading="lazy"
          decoding="async"
          className="h-3.5 w-5 object-cover rounded-sm border border-white/10"
        />
      );
    }
  }

  return <span className="text-xs font-semibold text-slate-400">{flag}</span>;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>(() => getMockData('mock_reviews', defaultMockReviews));

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    let isMounted = true;

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('client_reviews')
          .select('*')
          .order('created_at', { ascending: false });
        if (!isMounted) return;
        if (data && !error && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(getMockData('mock_reviews', defaultMockReviews));
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        if (isMounted) setReviews(getMockData('mock_reviews', defaultMockReviews));
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  if (reviews.length === 0) {
    return (
      <section id="reviews" className="py-16 text-center text-slate-400">
        No reviews yet.
      </section>
    );
  }

  return (
    <section id="reviews" className="relative py-16 lg:py-20 px-4 overflow-hidden">
      <BackgroundBlobs />

      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Quote size={20} />} top="15%" left="8%" delay={0} />
        <FloatingIcon icon={<Star size={20} />} top="55%" left="90%" delay={1} />
        <FloatingIcon icon={<MessageSquare size={20} />} top="80%" left="12%" delay={2} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-12">
          <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[11px] mb-2.5 block">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black mb-3.5 tracking-tight text-white">
            Client Reviews
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 mx-auto rounded-full" />
          <p className="text-slate-400 mt-4 font-normal text-sm sm:text-base leading-relaxed">
            Feedback from clients and collaborators across engineering and creative projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 auto-rows-fr">
          {reviews.map((review, index) => {
            const rating = Math.min(5, Math.max(0, Number(review.rating || 5)));
            const fullStars = Math.floor(rating);
            const hasHalf = rating % 1 >= 0.5;
            const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

            return (
              <motion.article
                key={review.id || index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{
                  delay: Math.min(index * 0.05, 0.25),
                  duration: 0.35,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative flex flex-col bg-slate-900/45 backdrop-blur-md border border-white/[0.08] hover:border-blue-500/40 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_36px_-20px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_44px_-16px_rgba(37,99,235,0.18)] overflow-hidden"
              >
                {/* Hover Hairline & Top Portrait Glow */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 w-44 h-44 rounded-full bg-blue-500/10 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />

                {/* 1. Centered Prominent Client Photograph & Identity at Top */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-3.5">
                    <div className="w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-br from-blue-400/75 via-indigo-500/50 to-cyan-400/65 shadow-[0_10px_28px_-6px_rgba(37,99,235,0.4)]">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-slate-950 bg-slate-800">
                        <img
                          src={review.avatar_url || DEFAULT_AVATAR_URL}
                          alt={review.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-[17px] font-bold text-white tracking-tight flex items-center justify-center gap-2 max-w-full">
                    <span className="truncate">{review.name}</span>
                    {review.country_flag && (
                      <span className="inline-flex items-center shrink-0" title="Client Location">
                        <CountryFlag flag={review.country_flag} />
                      </span>
                    )}
                  </h3>

                  {review.service_taken && (
                    <p className="text-xs font-semibold text-blue-400/90 mt-1 truncate max-w-full">
                      {review.service_taken}
                    </p>
                  )}
                </div>

                {/* 2. Crisp Gold 5-Star Visual Representation */}
                <div
                  aria-label={`Rated ${rating.toFixed(1)} out of 5 stars`}
                  className="relative z-10 flex items-center justify-center gap-2.5 py-3 my-4 border-y border-white/[0.06]"
                >
                  <div className="flex items-center gap-1 text-[#FBBF24]">
                    {Array.from({ length: fullStars }).map((_, i) => (
                      <Star
                        key={`full-${i}`}
                        size={16}
                        fill="currentColor"
                        strokeWidth={1.5}
                        className="drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]"
                      />
                    ))}
                    {hasHalf && (
                      <StarHalf
                        size={16}
                        fill="currentColor"
                        strokeWidth={1.5}
                        className="drop-shadow-[0_0_6px_rgba(251,191,36,0.35)]"
                      />
                    )}
                    {Array.from({ length: emptyStars }).map((_, i) => (
                      <Star key={`empty-${i}`} size={16} className="text-slate-700" strokeWidth={1.5} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-200/90 tabular-nums">
                    {rating.toFixed(1)}
                  </span>
                </div>

                {/* 3. Refined Testimonial Typography with Comfortable Leading */}
                <div className="relative z-10 flex-1 flex flex-col justify-between pt-0.5">
                  <blockquote className="text-[15px] sm:text-[15.5px] text-slate-200/95 leading-[1.75] font-normal tracking-[0.005em] text-left">
                    <Quote
                      size={15}
                      aria-hidden="true"
                      className="inline-block text-blue-400/50 mr-1.5 -mt-1 align-middle"
                    />
                    <span>{review.text}</span>
                  </blockquote>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
