import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, ChevronRight, Palette } from 'lucide-react';
import { getMockData, mockExperiences } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { cn } from '../../lib/utils';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';

type FilterType = "all" | "professional" | "education" | "creative";

export default function Experience() {
  const [experiences, setExperiences] = useState(() => hasSupabaseConfig ? [] : getMockData('mock_experiences', mockExperiences));
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchExp = async () => {
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error) setExperiences(data);
      };
      fetchExp();
    }
  }, []);

  const filtered = experiences.filter(exp => filter === 'all' || exp.type === filter);

  return (
    <section id="experience" className="relative py-24 px-4 max-w-5xl mx-auto overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Briefcase size={20} />} top="20%" left="5%" delay={0} />
        <FloatingIcon icon={<GraduationCap size={20} />} top="50%" left="92%" delay={1} />
        <FloatingIcon icon={<Palette size={20} />} top="80%" left="15%" delay={2} />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Experience & Education</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full"></div>
        </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All Experience</FilterButton>
        <FilterButton active={filter === 'professional'} onClick={() => setFilter('professional')}>Professional</FilterButton>
        <FilterButton active={filter === 'education'} onClick={() => setFilter('education')}>Education</FilterButton>
        <FilterButton active={filter === 'creative'} onClick={() => setFilter('creative')}>Creative</FilterButton>
      </div>

      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent -translate-x-1/2"></div>
        
        <div className="space-y-12">
          {filtered.map((exp, index) => (
            <div key={exp.id} className={cn("relative flex items-center justify-between md:justify-normal", index % 2 === 0 ? "md:flex-row-reverse" : "")}>
              
              {/* Icon / Node */}
              <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border-2 border-blue-500 z-10 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                {exp.type === 'education' && <GraduationCap size={18} className="text-blue-400" />}
                {exp.type === 'professional' && <Briefcase size={18} className="text-blue-400" />}
                {exp.type === 'creative' && <Palette size={18} className="text-blue-400" />}
              </div>

              {/* Card content */}
              <div className={cn("w-full pl-12 md:pl-0 md:w-[45%]", index % 2 === 0 ? "" : "md:text-right")}>
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-blue-500/30 p-6 rounded-2xl transition-all hover:bg-white/10 group">
                  <div className={cn("flex flex-col", index % 2 === 0 ? "" : "md:items-end")}>
                    <div className={cn("flex items-center gap-4 mb-3", index % 2 === 0 ? "justify-start" : "md:justify-end justify-start")}>
                      {exp.image_url && (
                        <img src={exp.image_url} alt={`${exp.company_institution} logo`} className="w-12 h-12 rounded-lg object-cover bg-white" />
                      )}
                      <div>
                        <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full mb-1">
                          {exp.date_range}
                        </span>
                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{exp.role}</h3>
                      </div>
                    </div>
                    <h4 className="text-lg font-medium text-slate-300 mb-3">{exp.company_institution}</h4>
                    
                    <div className="text-sm text-slate-400 leading-relaxed bg-slate-900/40 p-4 rounded-xl border border-white/5 mb-4 [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: exp.description }} />
                    
                    {exp.bullet_points && exp.bullet_points.length > 0 && (
                      <ul className="list-disc list-outside pl-4 space-y-1 mt-2 text-sm text-slate-400 marker:text-blue-500">
                        {exp.bullet_points.map((point: string, i: number) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-full text-sm font-medium transition-all backdrop-blur-sm border",
        active 
          ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
          : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
