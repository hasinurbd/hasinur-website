import React, { useState, useEffect } from 'react';
import { getMockData, mockAchievements as defaultAchievements } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { ArrowRight, MessageSquare, Heart, Award, FileText } from 'lucide-react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';
import { Link } from 'react-router-dom';
import { slugify } from '../../lib/utils';

function stripHtml(html?: string): string {
  if (!html) return '';
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchAch = async () => {
      let data: any[] | null = null;
      try {
        if (hasSupabaseConfig) {
          const { data: dbData, error } = await supabase
            .from('achievements')
            .select('*')
            .order('date', { ascending: false });
          if (!error) data = dbData;
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
      }

      if (!data || data.length === 0) {
        data = getMockData('mock_achievements', defaultAchievements);
      }

      const sorted = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || 0).getTime() || 0;
        const dateB = new Date(b.date || b.created_at || 0).getTime() || 0;
        return dateB - dateA;
      });
      if (isMounted) setAchievements(sorted);
    };

    fetchAch();
    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return `${d.toLocaleString('en-US', { month: 'short' }).toUpperCase()} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <section id="achievements" className="relative py-16 lg:py-20 px-4 overflow-hidden">
      <BackgroundBlobs />

      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Award size={24} />} top="15%" left="85%" delay={0} />
        <FloatingIcon icon={<FileText size={20} />} top="65%" left="12%" delay={1} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 lg:mb-12">
          <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[11px] mb-2.5 block">
            Recognition
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black mb-3.5 tracking-tight text-white">
            Accomplishments
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {achievements.map((ach) => {
            const excerpt = stripHtml(ach.description);
            return (
              <Link
                key={ach.id}
                to={`/achievement/${ach.id}--${slugify(ach.title)}`}
                className="bg-slate-900/45 backdrop-blur-md border border-white/[0.08] hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_36px_-20px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_44px_-16px_rgba(37,99,235,0.18)] group flex flex-col h-full"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-slate-900 flex items-center justify-center border-b border-white/[0.06]">
                  {ach.image_url ? (
                    <img
                      src={ach.image_url}
                      alt={ach.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-slate-600 font-medium text-xs">No Image</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-[11px] font-semibold tracking-wider text-slate-400 mb-2 uppercase flex items-center gap-2">
                    <span className="text-blue-400">{formatDate(ach.date)}</span>
                    {ach.author && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{ach.author}</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold mb-2 text-white leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                    {ach.title}
                  </h3>

                  <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed flex-grow">
                    {excerpt}
                  </p>

                  <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06] mt-auto">
                    <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <Heart size={12} className="text-rose-400" />
                        {ach.likes || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare size={12} className="text-blue-400" />
                        {ach.comments?.length || 0}
                      </span>
                    </div>

                    <span className="inline-flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                      Read Story <ArrowRight size={13} className="ml-1.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
