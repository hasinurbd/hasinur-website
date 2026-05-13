import React, { useState, useEffect } from 'react';
import { getMockData, mockAchievements as defaultAchievements } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { ArrowRight, Award, FileText, MessageSquare, Heart } from 'lucide-react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';
import { Link } from 'react-router-dom';

export default function Achievements() {
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAch = async () => {
      let data: any[] | null = null;
      if (hasSupabaseConfig) {
        const { data: dbData } = await supabase.from('achievements').select('*').order('date', { ascending: false });
        data = dbData;
      }
      
      if (!data || data.length === 0) {
        data = getMockData('mock_achievements', defaultAchievements);
      }
      
      // Ensure sorted by date (latest first)
      const sorted = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.date || a.created_at || 0).getTime();
        const dateB = new Date(b.date || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setAchievements(sorted);
    };
    fetchAch();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleString('default', { month: 'short' }).toUpperCase()} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <section id="achievements" className="relative py-16 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Award size={24} />} top="15%" left="85%" delay={0} />
        <FloatingIcon icon={<FileText size={20} />} top="65%" left="12%" delay={1} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-blue-500 font-bold tracking-[0.3em] uppercase text-[9px] mb-2 block">Recognition</span>
          <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-white uppercase">Accomplishments</h2>
          <div className="w-10 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {achievements.map(ach => (
            <Link key={ach.id} to={`/achievement/${ach.id}`} className="bg-slate-800/40 border border-white/5 rounded-3xl overflow-hidden hover:bg-slate-800/80 hover:border-blue-500/30 transition-all group flex flex-col h-full shadow-lg">
              <div className="h-44 overflow-hidden relative bg-slate-800 flex items-center justify-center">
                {ach.image_url ? (
                  <img src={ach.image_url} alt={ach.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <span className="text-slate-600 font-medium text-xs">No Image</span>
                )}
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <Heart size={10} className="text-red-500" fill="currentColor" />
                    {ach.likes || 0}
                  </div>
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <MessageSquare size={10} className="text-blue-400" />
                    {ach.comments?.length || 0}
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-grow">
                <div className="text-[10px] font-bold tracking-widest text-slate-400 mb-2 uppercase flex items-center gap-2">
                  <span className="text-blue-400">{formatDate(ach.date)}</span>
                  <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                  <span>{ach.author}</span>
                </div>
                
                <h3 className="text-lg font-bold mb-3 text-white leading-snug group-hover:text-blue-300 transition-colors line-clamp-2">
                  {ach.title}
                </h3>
                
                <div className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow max-w-none [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: ach.description }} />
                
                <div className="inline-flex items-center text-xs font-black text-blue-500 group-hover:text-blue-400 transition-colors tracking-widest mt-auto uppercase">
                  READ FULL STORY <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
