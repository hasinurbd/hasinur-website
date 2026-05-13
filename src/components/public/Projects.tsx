import React, { useState, useEffect } from 'react';
import { getMockData, mockPortfolioItems } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { ExternalLink, CodeXml, Layout, Monitor, ChevronRight, Heart, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

type Category = 'all' | 'graphics' | 'video' | 'web' | 'projects';

export default function Projects() {
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const fetchItems = async () => {
      let data: any[] | null = null;
      if (hasSupabaseConfig) {
        const { data: dbData } = await supabase.from('portfolio_items').select('*').order('start_date', { ascending: false });
        // Handle potential column missing error if recently added
        if (dbData) {
          data = dbData;
        } else {
          const { data: fallback } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
          data = fallback;
        }
      }
      
      if (!data || data.length === 0) {
        data = getMockData('mock_portfolio', mockPortfolioItems);
      }
      
      // Ensure sorted by start_date (latest first)
      const sorted = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.start_date || a.created_at || 0).getTime();
        const dateB = new Date(b.start_date || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setItems(sorted);
    };
    fetchItems();
  }, []);

  const categories = ['all', ...Array.from(new Set(items.map(item => (item.category as string)?.trim() || ''))).filter(c => c !== '')];

  const filtered = items.filter(item => activeTab === 'all' || (item.category as string)?.trim() === activeTab);

  return (
    <section id="portfolio" className="relative py-12 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<CodeXml size={16} />} top="10%" left="8%" delay={0} />
        <FloatingIcon icon={<Layout size={16} />} top="60%" left="92%" delay={1} />
        <FloatingIcon icon={<Monitor size={16} />} top="85%" left="12%" delay={2} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-blue-500 font-bold tracking-[0.3em] uppercase text-[9px] mb-2 block">Portfolio</span>
            <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-white uppercase">Selected Projects</h2>
            <div className="w-10 h-0.5 bg-blue-600 mx-auto rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10 px-4">
          {categories.map((cat: string) => (
            <TabButton key={cat} active={activeTab === cat} onClick={() => setActiveTab(cat)}>
              {cat === 'all' ? 'All Masterpieces' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </TabButton>
          ))}
        </div>

        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link 
                to={`/project/${item.id}`} 
                className="group relative overflow-hidden rounded-[2rem] bg-slate-900 aspect-[4/3] block border border-white/5 shadow-2xl transition-all duration-500 hover:border-blue-500/50 hover:shadow-blue-500/10"
              >
                <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2" />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center gap-2">
                      <Monitor size={24} />
                      <span className="font-bold text-[9px] uppercase tracking-widest">Case Study</span>
                    </div>
                  )}
                </div>

                {/* Love & Comments Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                   <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-[8px] font-black uppercase text-slate-300 flex items-center gap-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart size={10} className="text-red-500" fill="currentColor" />
                      {item.likes || 0}
                   </div>
                   <div className="bg-black/50 backdrop-blur-md px-2 py-1 rounded-full text-[8px] font-black uppercase text-slate-300 flex items-center gap-1 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare size={10} className="text-blue-500" />
                      {item.comments?.length || 0}
                   </div>
                </div>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <div className="max-w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="h-1 w-3 bg-blue-500 rounded-full group-hover:w-6 transition-all duration-500"></span>
                      <span className="uppercase text-[9px] font-black tracking-[0.2em] text-blue-400">{item.category}</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-4 line-clamp-1 group-hover:text-blue-400 transition-colors uppercase tracking-tighter">{item.title}</h3>
                  </div>
                  
                  <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 delay-100">
                    <div className="flex items-center gap-2 text-[9px] font-black text-white/60 uppercase tracking-widest">
                      <span>Explore Project</span>
                      <ChevronRight size={10} className="text-blue-500" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                      <ExternalLink size={16} />
                    </div>
                  </div>
                </div>

                {/* Glass reflection decorative element */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl transition-all duration-700 group-hover:translate-x-full group-hover:translate-y-full"></div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode; key?: string | number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 rounded-xl relative overflow-hidden group",
        active 
          ? "text-white bg-blue-600 shadow-[0_8px_25px_rgba(37,99,235,0.4)] scale-105" 
          : "text-slate-500 hover:text-white bg-slate-900/50 border border-white/5 hover:border-white/20"
      )}
    >
      <span className="relative z-10">{children}</span>
      {active && (
        <motion.div 
          layoutId="activeProjectTab"
          className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 -z-10"
        />
      )}
    </button>
  );
}
