import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { getMockData, mockBlogs as defaultMockBlogs } from '../../lib/mockData';
import { Calendar, ArrowRight, FileText, MessageSquare, Heart } from 'lucide-react';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';
import { Link } from 'react-router-dom';
import { slugify } from '../../lib/utils';

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      let data: any[] | null = null;
      if (hasSupabaseConfig) {
        const { data: dbData } = await supabase.from('blogs').select('*').order('published_at', { ascending: false });
        data = dbData;
      }
      
      if (data === null) {
        data = getMockData('mock_blogs', defaultMockBlogs);
      } else if (data.length === 0) {
        const localSaved = localStorage.getItem('mock_blogs');
        if (localSaved) {
          data = JSON.parse(localSaved);
        }
      }
      
      // Ensure sorted by published_at (latest first)
      const sorted = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0).getTime();
        const dateB = new Date(b.published_at || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setBlogs(sorted);
    };
    fetchBlogs();
  }, []);

  return (
    <section id="blogs" className="relative py-16 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<FileText size={24} />} top="15%" left="8%" delay={0} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-blue-500 font-bold tracking-[0.3em] uppercase text-[9px] mb-2 block">Insights</span>
          <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-white uppercase">Latest Articles</h2>
          <div className="w-10 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-white/5 rounded-3xl max-w-md mx-auto px-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <FileText size={20} className="text-blue-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">No articles found</h3>
            <p className="text-xs text-slate-400 leading-normal">
              There are no published articles at the moment. Please check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.id}--${slugify(blog.title)}`} className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col h-full shadow-lg">
                {blog.image_url && (
                  <div className="relative h-44 overflow-hidden">
                    <img 
                      src={blog.image_url} 
                      alt={blog.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60"></div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 border border-white/10">
                        <Heart size={10} className="text-red-500" fill="currentColor" />
                        {blog.likes || 0}
                      </div>
                      <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 border border-white/10">
                        <MessageSquare size={10} className="text-blue-400" />
                        {blog.comments?.length || 0}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-center text-blue-400 text-[10px] font-black tracking-[0.2em] mb-3 uppercase">
                    <Calendar size={12} className="mr-2" />
                    {new Date(blog.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-blue-400 transition-colors leading-tight line-clamp-2">
                    {blog.title}
                  </h3>
                  
                  <div className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content }} />
                  
                  <div className="inline-flex items-center text-[10px] font-black text-white group-hover:text-blue-400 transition-colors tracking-[0.2em] mt-auto uppercase">
                    READ ARTICLE <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
