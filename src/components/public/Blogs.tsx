import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { getMockData, mockBlogs as defaultMockBlogs } from '../../lib/mockData';
import { Calendar, ArrowRight, FileText, MessageSquare, Heart } from 'lucide-react';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';
import { Link } from 'react-router-dom';

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>(() => getMockData('mock_blogs', defaultMockBlogs));

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchBlogs = async () => {
        const { data, error } = await supabase.from('blogs').select('*').order('published_at', { ascending: false });
        if (data && !error && data.length > 0) {
          setBlogs(data);
        } else {
          setBlogs(getMockData('mock_blogs', defaultMockBlogs));
        }
      };
      fetchBlogs();
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog) => (
            <Link key={blog.id} to={`/blog/${blog.id}`} className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col h-full shadow-lg">
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
      </div>
    </section>
  );
}
