import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { getMockData, mockBlogs as defaultMockBlogs } from '../../lib/mockData';
import { Calendar, ArrowRight, FileText, MessageSquare, Heart, Clock } from 'lucide-react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';
import { Link } from 'react-router-dom';
import { slugify, calculateReadingTime } from '../../lib/utils';

function stripHtml(html?: string): string {
  if (!html) return '';
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchBlogs = async () => {
      let data: any[] | null = null;
      try {
        if (hasSupabaseConfig) {
          const { data: dbData, error } = await supabase
            .from('blogs')
            .select('*')
            .order('published_at', { ascending: false });
          if (!error) data = dbData;
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
      }

      if (!data || data.length === 0) {
        data = getMockData('mock_blogs', defaultMockBlogs);
      }

      const sorted = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0).getTime() || 0;
        const dateB = new Date(b.published_at || b.created_at || 0).getTime() || 0;
        return dateB - dateA;
      });
      if (isMounted) setBlogs(sorted);
    };

    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="blogs" className="relative py-16 lg:py-20 px-4 overflow-hidden">
      <BackgroundBlobs />

      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<FileText size={24} />} top="15%" left="8%" delay={0} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 lg:mb-12">
          <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[11px] mb-2.5 block">
            Insights
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black mb-3.5 tracking-tight text-white">
            Latest Articles
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 mx-auto rounded-full" />
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/45 backdrop-blur-md border border-white/[0.08] rounded-2xl max-w-md mx-auto px-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <FileText size={20} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              No articles found
            </h3>
            <p className="text-xs text-slate-400 leading-normal">
              There are no published articles at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
            {blogs.map((blog) => {
              const excerpt = stripHtml(blog.content);
              return (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.id}--${slugify(blog.title)}`}
                  className="bg-slate-900/45 backdrop-blur-md border border-white/[0.08] hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_36px_-20px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_44px_-16px_rgba(37,99,235,0.18)] group flex flex-col h-full"
                >
                  {blog.image_url && (
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900 border-b border-white/[0.06]">
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold tracking-wide mb-2.5">
                      <span className="flex items-center text-blue-400">
                        <Calendar size={12} className="mr-1.5" />
                        {(() => {
                          const raw = blog.published_at || blog.created_at;
                          const d = raw ? new Date(raw) : null;
                          return d && !isNaN(d.getTime())
                            ? d.toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Recent';
                        })()}
                      </span>
                      <span className="flex items-center text-slate-400">
                        <Clock size={12} className="mr-1 text-blue-500" />
                        {calculateReadingTime(blog.content)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed flex-grow">
                      {excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06] mt-auto">
                      <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Heart size={12} className="text-rose-400" />
                          {blog.likes || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare size={12} className="text-blue-400" />
                          {blog.comments?.length || 0}
                        </span>
                      </div>

                      <span className="inline-flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors">
                        Read Article <ArrowRight size={13} className="ml-1.5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
