import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { getMockData, mockBlogs as defaultMockBlogs } from '../../lib/mockData';
import { Calendar, ArrowRight, FileText, X } from 'lucide-react';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';

export default function Blogs() {
  const [blogs, setBlogs] = useState<any[]>(() => hasSupabaseConfig ? [] : getMockData('mock_blogs', defaultMockBlogs));
  const [selectedBlog, setSelectedBlog] = useState<any | null>(null);

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
    <section id="blogs" className="relative py-24 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<FileText size={24} />} top="15%" left="8%" delay={0} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Latest Blogs & Articles</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-slate-800/50 border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col h-full">
              {blog.image_url && (
                <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => setSelectedBlog(blog)}>
                  <img 
                    src={blog.image_url} 
                    alt={blog.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                </div>
              )}
              
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center text-blue-400 text-xs font-semibold tracking-wider mb-3">
                  <Calendar size={14} className="mr-2" />
                  {new Date(blog.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors cursor-pointer" onClick={() => setSelectedBlog(blog)}>
                  {blog.title}
                </h3>
                
                <div className="text-slate-400 text-sm mb-6 line-clamp-3 max-w-none [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: blog.content }} />
                
                <button onClick={() => setSelectedBlog(blog)} className="inline-flex items-center text-sm font-bold text-white hover:text-blue-400 transition-colors tracking-wide mt-auto">
                  READ ARTICLE <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blog Reading Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBlog(null)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl custom-scrollbar" onClick={e => e.stopPropagation()}>
            {selectedBlog.image_url && (
              <div className="w-full h-64 md:h-80 relative shrink-0">
                <img src={selectedBlog.image_url} alt={selectedBlog.title} loading="lazy" className="w-full h-full object-cover" />
                <button onClick={() => setSelectedBlog(null)} className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors">
                  <X size={20} />
                </button>
              </div>
            )}
            
            <div className="p-6 md:p-10 flex-1">
              {!selectedBlog.image_url && (
                 <div className="flex justify-end mb-4">
                   <button onClick={() => setSelectedBlog(null)} className="bg-slate-800 hover:bg-slate-700 text-white rounded-full p-2 transition-colors">
                     <X size={20} />
                   </button>
                 </div>
              )}
              
              <div className="flex items-center text-blue-400 text-sm font-semibold tracking-wider mb-4">
                <Calendar size={16} className="mr-2" />
                {new Date(selectedBlog.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                {selectedBlog.title}
              </h2>
              
              <div className="text-lg max-w-none [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-white [&_a]:text-blue-400 hover:[&_a]:text-blue-300" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
