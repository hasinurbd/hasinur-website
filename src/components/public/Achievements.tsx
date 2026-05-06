import React, { useState, useEffect } from 'react';
import { getMockData, mockAchievements as defaultAchievements } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { ArrowRight, Award, FileText } from 'lucide-react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';

export default function Achievements() {
  const [achievements, setAchievements] = useState(() => hasSupabaseConfig ? [] : getMockData('mock_achievements', defaultAchievements));

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchAch = async () => {
        const { data, error } = await supabase.from('achievements').select('*').order('date', { ascending: false });
        if (data && !error && data.length > 0) {
          setAchievements(data);
        } else {
          setAchievements(getMockData('mock_achievements', defaultAchievements));
        }
      };
      fetchAch();
    }
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return `${d.toLocaleString('default', { month: 'short' }).toUpperCase()} ${d.getDate()}, ${d.getFullYear()}`;
  };

  return (
    <section id="achievements" className="relative py-24 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Award size={24} />} top="15%" left="85%" delay={0} />
        <FloatingIcon icon={<FileText size={20} />} top="65%" left="12%" delay={1} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Achievements & Certifications</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map(ach => (
            <div key={ach.id} className="bg-slate-800/40 border border-white/5 rounded-2xl overflow-hidden hover:bg-slate-800/80 transition-colors group flex flex-col h-full">
              <div className="h-48 overflow-hidden relative">
                <img src={ach.image_url} alt={ach.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-overlay group-hover:opacity-0 transition-opacity"></div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs font-bold tracking-widest text-slate-400 mb-3 uppercase">
                  <span className="text-blue-400">{formatDate(ach.date)}</span> • {ach.author}
                </div>
                
                <h3 className="text-xl font-bold italic mb-3 text-white leading-snug group-hover:text-blue-300 transition-colors">
                  {ach.title}
                </h3>
                
                <div className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow max-w-none [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: ach.description }} />
                
                {ach.full_story_link && ach.full_story_link !== '#' && ach.full_story_link !== '' ? (
                  <a href={ach.full_story_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-bold text-white hover:text-blue-400 transition-colors tracking-wide mt-auto">
                    VIEW CERTIFICATE <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                  </a>
                ) : (
                  <button onClick={(e) => e.preventDefault()} className="inline-flex items-center text-sm font-bold text-slate-500 tracking-wide mt-auto">
                    ACHIEVEMENT UNLOCKED
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
