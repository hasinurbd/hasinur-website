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
        <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/50 via-blue-500/20 to-transparent md:-translate-x-1/2"></div>
        
        <div className="space-y-12">
          {filtered.map((exp, index) => (
            <div key={exp.id} className="relative flex flex-col md:flex-row items-start md:items-center w-full">
              
              {/* Desktop Date on one side */}
              <div className={cn("hidden md:block w-1/2", index % 2 === 0 ? "text-right pr-12 order-1" : "text-left pl-12 order-3")}>
                <span className="text-blue-400 font-bold tracking-widest text-sm uppercase">{exp.date_range}</span>
              </div>

              {/* Node (Center) */}
              <div className="absolute left-[13px] md:static md:w-auto md:h-auto flex items-center justify-center z-10 md:order-2 md:-mx-4 mt-8 md:mt-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 border-[3px] border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                  <div className="w-2 h-2 rounded-full bg-blue-300"></div>
                </div>
              </div>

              {/* Card content */}
              <div className={cn("w-full pl-[60px] pr-4 md:px-0 md:w-1/2", index % 2 === 0 ? "md:pl-12 order-3" : "md:pr-12 order-1 md:text-right")}>
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-blue-500/50 p-6 rounded-2xl transition-all hover:bg-slate-800/60 group text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  
                  {/* Mobile Date - only visible on small screens */}
                  <div className="md:hidden mb-4">
                    <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">{exp.date_range}</span>
                  </div>
                  
                  <div className={cn("flex items-start gap-4 mb-3", index % 2 === 0 ? "" : "md:flex-row-reverse")}>
                    {exp.image_url && (
                      <img src={exp.image_url} alt={`${exp.company_institution} logo`} className="w-10 h-10 rounded-lg object-cover bg-white shrink-0" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors leading-tight">{exp.role}</h3>
                      <h4 className="text-sm font-semibold text-blue-200 mt-1">{exp.company_institution}</h4>
                    </div>
                  </div>
                  
                  <div className="text-sm text-slate-300 leading-relaxed mt-4 [&_ul]:list-none [&_ul]:pl-0 [&_ul_li]:relative [&_ul_li]:pl-6 [&_ul_li::before]:content-[''] [&_ul_li::before]:absolute [&_ul_li::before]:left-0 [&_ul_li::before]:top-[8px] [&_ul_li::before]:w-4 [&_ul_li::before]:h-4 [&_ul_li::before]:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjM2I4MmY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIyIDExLjA4VjEyYTEwIDEwIDAgMSAxLTUuOTMtOS4xNCIvPjxwb2x5bGluZSBwb2ludHM9IjIyIDQgMTIgMTQuMDEgOSAxMSIvPjwvc3ZnPg==')] [&_ul_li::before]:bg-no-repeat [&_ul_li::before]:bg-contain [&_p]:mb-2 space-y-2" dangerouslySetInnerHTML={{ __html: exp.description }} />
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
