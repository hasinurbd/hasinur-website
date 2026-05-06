import React, { useState, useEffect } from 'react';
import { getMockData, mockPortfolioItems } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { ExternalLink, CodeXml, Layout, Monitor } from 'lucide-react';
import { cn } from '../../lib/utils';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';

type Category = 'all' | 'graphics' | 'video' | 'web' | 'projects';

export default function Projects() {
  const [items, setItems] = useState(() => hasSupabaseConfig ? [] : getMockData('mock_portfolio', mockPortfolioItems));
  const [activeTab, setActiveTab] = useState<Category>('all');

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchItems = async () => {
        const { data, error } = await supabase.from('portfolio_items').select('*');
        if (data && !error) setItems(data);
      };
      fetchItems();
    }
  }, []);

  const filtered = items.filter(item => activeTab === 'all' || item.category === activeTab);

  return (
    <section id="portfolio" className="relative py-24 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<CodeXml size={24} />} top="10%" left="8%" delay={0} />
        <FloatingIcon icon={<Layout size={24} />} top="60%" left="92%" delay={1} />
        <FloatingIcon icon={<Monitor size={20} />} top="85%" left="12%" delay={2} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Portfolio & Projects</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-white/10 pb-4">
          <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>All</TabButton>
          <TabButton active={activeTab === 'graphics'} onClick={() => setActiveTab('graphics')}>Graphic Design</TabButton>
          <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')}>Video Editing</TabButton>
          <TabButton active={activeTab === 'web'} onClick={() => setActiveTab('web')}>Websites</TabButton>
          <TabButton active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>Projects</TabButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(item => (
            <a key={item.id} href={item.link || '#'} target={item.link && item.link !== '#' ? "_blank" : "_self"} rel="noopener noreferrer" className="group relative overflow-hidden rounded-2xl bg-slate-800 aspect-[4/3] block border border-white/5 shadow-lg">
              <img src={item.image_url} alt={item.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
              
              {item.title === 'Poster Shorai' && (
                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.8)]">
                  Featured AI App
                </div>
              )}
              
              <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform">
                <div className="max-w-full">
                  <span className="uppercase text-xs font-bold tracking-wider text-blue-400 mb-2 block">{item.category}</span>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                  <ExternalLink size={18} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-5 py-2 text-sm font-medium transition-colors rounded-lg",
        active ? "text-white bg-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      {children}
    </button>
  );
}
