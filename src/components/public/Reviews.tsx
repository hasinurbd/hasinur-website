import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { getMockData, mockReviews as defaultMockReviews } from '../../lib/mockData';
import { Star, Quote, MessageSquare, StarHalf } from 'lucide-react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';

export default function Reviews() {
  const [reviews, setReviews] = useState<any[]>(() => getMockData('mock_reviews', defaultMockReviews));
  
  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchReviews = async () => {
        const { data, error } = await supabase
          .from('client_reviews')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          setReviews(data);
        } else {
          setReviews(getMockData('mock_reviews', defaultMockReviews));
        }
      };
      fetchReviews();
    }
  }, []);

  if (reviews.length === 0) return (<section id="reviews" className="py-24 text-center text-slate-400">No reviews yet.</section>);

  return (
    <section id="reviews" className="relative py-24 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Quote size={20} />} top="15%" left="8%" delay={0} />
        <FloatingIcon icon={<Star size={20} />} top="55%" left="90%" delay={1} />
        <FloatingIcon icon={<MessageSquare size={20} />} top="80%" left="12%" delay={2} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-24 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white"
          >
            Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Reviews</span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full origin-center"
          ></motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/20 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all group relative"
            >
              <div className="absolute -top-4 -right-4 opacity-5 text-blue-500 group-hover:opacity-10 transition-opacity">
                <Quote size={80} />
              </div>
              
              <div className="flex gap-1 mb-6 text-blue-400 items-center">
                <span className="text-white font-bold text-sm mr-1">{review.rating || 5}</span>
                {[...Array(Math.floor(review.rating || 5))].map((_, i) => (
                  <Star key={`full-${i}`} size={16} fill="currentColor" />
                ))}
                {((review.rating || 5) % 1 >= 0.5) && (
                  <StarHalf size={16} fill="currentColor" />
                )}
              </div>
              
              <p className="text-slate-300 italic mb-8 relative z-10 line-clamp-4">
                "{review.text}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500/30">
                  <img src={review.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} alt={review.name} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-white font-bold flex items-center gap-2">
                    {review.name}
                    {review.country_flag && (
                      <span className="text-lg flex items-center shrink-0" title="Client Location">
                        {(() => {
                          const flag = review.country_flag;
                          if (flag.startsWith('http')) {
                            return <img src={flag} alt="Flag" className="h-4 object-contain rounded-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />;
                          }
                          
                          // Check if it's an emoji flag or 2-letter code
                          const isEmoji = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/.test(flag);
                          const isCode = /^[A-Z]{2}$/i.test(flag);
                          
                          if (isEmoji || isCode) {
                            let code = '';
                            if (isEmoji) {
                              code = Array.from(flag)
                                .map(char => String.fromCodePoint((char.codePointAt(0) || 0) - 127397))
                                .join('')
                                .toLowerCase();
                            } else {
                              code = flag.toLowerCase();
                            }
                            
                            if (code.length === 2) {
                              return <img src={`https://flagcdn.com/w40/${code}.png`} alt={code} className="h-4 w-6 object-cover rounded-sm shadow-sm border border-white/10" />;
                            }
                          }
                          
                          return <span className="text-sm font-bold text-slate-500">{flag}</span>;
                        })()}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-blue-400/80">{review.service_taken}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
