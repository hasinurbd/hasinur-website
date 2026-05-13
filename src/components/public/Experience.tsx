import React, { useState, useEffect } from 'react';
import { Briefcase, GraduationCap, ChevronRight, Palette, CheckCircle2 } from 'lucide-react';
import { getMockData, mockExperiences } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { cn } from '../../lib/utils';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';
import { motion, AnimatePresence } from 'motion/react';

type FilterType = "all" | "professional" | "education" | "club";

export default function Experience() {
  const [experiences, setExperiences] = useState(() => getMockData('mock_experiences', mockExperiences));
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchExp = async () => {
        const { data, error } = await supabase
          .from('experiences')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && !error && data.length > 0) {
          setExperiences(data);
        } else {
          setExperiences(getMockData('mock_experiences', mockExperiences));
        }
      };
      fetchExp();
    }
  }, []);

  const categoriesOrder = ['all', 'education', 'professional', 'club'];
  const categories = [
    ...categoriesOrder,
    ...Array.from(new Set(experiences.map(exp => exp.type as string)))
      .filter((c): c is string => typeof c === 'string' && !categoriesOrder.includes(c) && c !== 'creative')
  ];

  const filtered = experiences.filter(exp => (filter === 'all' || exp.type === filter) && exp.type !== 'creative').sort((a, b) => {
    const getSortDate = (item: any) => {
      if (item.date_range?.toLowerCase().includes('present')) {
        // Use current date plus some buffer to ensure "Present" is at the very top
        // and among "Present" items, they sort by start_date
        const start = new Date(item.start_date || item.created_at || 0).getTime();
        return new Date(8640000000000000).getTime() + start; // Extremely far future + start offset
      }
      const parts = item.date_range?.split(' to ');
      if (parts && parts.length === 2) {
        const end = new Date(parts[1]);
        if (!isNaN(end.getTime())) return end.getTime();
      }
      return new Date(item.start_date || item.created_at || 0).getTime();
    };

    const dateA = getSortDate(a);
    const dateB = getSortDate(b);
    
    if (dateB !== dateA) return dateB - dateA;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  const formatDateRange = (range: string, align: 'left' | 'right' = 'right') => {
    if (!range) return null;
    const parts = range.split(' to ');
    if (parts.length < 2) return <span className={cn("text-blue-400 font-bold", align === 'left' ? "text-left" : "text-right")}>{range}</span>;

    const [startStr, endStr] = parts;
    
    try {
      const startDate = new Date(startStr);
      const startFormat = isNaN(startDate.getTime()) ? startStr : startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      let endFormat = 'Present';
      let endDate = new Date();
      if (endStr && endStr !== 'Present' && endStr.trim() !== '') {
        const parsedEnd = new Date(endStr);
        if (!isNaN(parsedEnd.getTime())) {
          endDate = parsedEnd;
          endFormat = endDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else {
          endFormat = endStr;
        }
      }

      if (isNaN(startDate.getTime())) return <span className={cn("text-blue-400 font-bold", align === 'left' ? "text-left" : "text-right")}>{range}</span>;

      let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
      months -= startDate.getMonth();
      months += endDate.getMonth();
      months += 1;
      
      let durationStr = '';
      if (months > 0) {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (years > 0) durationStr += `${years} yr${years > 1 ? 's' : ''} `;
        if (remainingMonths > 0) durationStr += `${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`;
        durationStr = durationStr.trim();
      } else {
        durationStr = '1 mo';
      }

      return (
        <span className={cn("flex flex-col gap-1.5 group/date", align === 'left' ? "items-start" : "md:items-end items-start")}>
          <span className={cn(
            "flex items-center gap-3 transition-all duration-500",
            align === 'left' ? "flex-row" : "md:flex-row-reverse"
          )}>
            <span className="h-[2px] w-6 bg-blue-500/40 hidden md:block rounded-full group-hover/date:w-10 group-hover/date:bg-blue-500 transition-all duration-500" />
            <span className="text-blue-400 font-black tracking-tighter text-sm uppercase sm:whitespace-nowrap">{startFormat} — {endFormat}</span>
          </span>
          <span className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
            {durationStr}
          </span>
        </span>
      );
    } catch(e) {
      return <span className={cn("text-blue-400 font-bold", align === 'left' ? "text-left" : "text-right")}>{range}</span>;
    }
  };

  return (
    <section id="experience" className="relative py-16 px-4 max-w-6xl mx-auto overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Briefcase size={20} />} top="20%" left="5%" delay={0} />
        <FloatingIcon icon={<GraduationCap size={20} />} top="50%" left="92%" delay={1} />
        <FloatingIcon icon={<Palette size={20} />} top="80%" left="15%" delay={2} />
      </div>

      <div className="relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="text-blue-500 font-bold tracking-[0.3em] uppercase text-xs mb-3 block">My Journey</span>
            <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-white leading-tight uppercase pb-4">Professional Path</h2>
            <div className="w-10 h-1 bg-blue-600 mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)]"></div>
          </motion.div>
        </div>

      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map((cat: string) => (
          <FilterButton 
            key={cat}
            active={filter === cat} 
            onClick={() => setFilter(cat as FilterType)}
          >
            {cat === 'all' ? 'All Records' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </FilterButton>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-[2.5px] md:-translate-x-1/2 overflow-hidden">
           <div className="absolute inset-0 bg-slate-800"></div>
           <motion.div 
             initial={{ height: 0 }}
             whileInView={{ height: '100%' }}
             viewport={{ once: true }}
             transition={{ duration: 1.5, ease: "easeInOut" }}
             className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-600 via-indigo-500 to-transparent shadow-[0_0_10px_rgba(37,99,235,0.3)]"
           ></motion.div>
        </div>
        
        <div className="space-y-12 md:space-y-0">
          <AnimatePresence mode="popLayout">
            {filtered.map((exp, index) => (
              <motion.div 
                key={exp.id || index}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={cn(
                  "relative flex flex-col md:flex-row items-start md:items-center w-full md:mb-12 last:mb-0",
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                {/* Desktop Date (Opposite side of content) */}
                <div className={cn("hidden md:block md:w-1/2", index % 2 === 0 ? "text-right pr-12" : "text-left pl-12")}>
                   <motion.div
                     initial={{ opacity: 0, x: index % 2 === 0 ? -10 : 10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.1 }}
                   >
                     {formatDateRange(exp.date_range, index % 2 === 0 ? 'right' : 'left')}
                   </motion.div>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-[22px] md:left-1/2 md:-translate-x-1/2 z-10 mt-8 md:mt-0 flex items-center justify-center w-[16px] h-[16px] md:w-[20px] md:h-[20px]">
                  <div className="relative group">
                    <div className="flex items-center justify-center w-[16px] h-[16px] rounded-full bg-slate-950 border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)] group-hover:scale-125 transition-transform duration-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-white group-hover:bg-blue-400 transition-colors"></div>
                    </div>
                  </div>
                </div>

                {/* Content Card */}
                <div className={cn("w-full pl-[65px] pr-4 md:px-0 md:w-1/2", index % 2 === 0 ? "md:pl-12" : "md:pr-12")}>
                  <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 backdrop-blur-2xl border border-white/5 hover:border-blue-500/30 p-4 md:p-6 rounded-2xl transition-all duration-500 group hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-[30px] -mr-12 -mt-12 pointer-events-none"></div>
                    
                    <div className="flex flex-col gap-3">
                      {/* Header Section */}
                      <div className={cn("flex items-start justify-between gap-4", index % 2 !== 0 && "md:flex-row-reverse md:text-right")}>
                        <div className="flex-1 min-w-0">
                          <div className={cn("flex items-center gap-3 mb-2", index % 2 !== 0 && "md:flex-row-reverse")}>
                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-500 uppercase tracking-widest shrink-0">
                               {exp.type}
                            </div>
                            <div className="md:hidden overflow-hidden">
                              {formatDateRange(exp.date_range, 'left')}
                            </div>
                          </div>
                          <h3 className="text-base md:text-lg font-black text-white group-hover:text-blue-400 transition-colors leading-tight tracking-tight uppercase sm:whitespace-normal">{exp.role}</h3>
                          <div className={cn("flex flex-wrap items-center gap-2 mt-1", index % 2 !== 0 && "md:justify-end")}>
                             <span className="text-[10px] font-bold text-slate-400 tracking-wide break-words">{exp.company_institution}</span>
                             {exp.subject && (
                               <>
                                 <span className="h-1 w-1 rounded-full bg-slate-600"></span>
                                 <span className="text-[10px] font-bold text-blue-400/80 tracking-wide break-words">{exp.subject}</span>
                               </>
                             )}
                             {exp.status && <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse"></span>}
                             {exp.status && <span className="text-[7px] font-black text-blue-400 uppercase tracking-widest">{exp.status}</span>}
                          </div>
                        </div>

                        {exp.image_url && (
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center p-1.5 shadow-xl shrink-0 border border-white/10 group-hover:scale-110 transition-transform duration-500 z-10">
                            <img src={exp.image_url} alt={`${exp.company_institution} logo`} loading="lazy" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Main Description */}
                      {exp.description && (
                        <div 
                          className={cn("text-xs md:text-[13px] text-slate-400/90 leading-relaxed font-medium markdown-content", index % 2 !== 0 && "md:text-right")}
                          dangerouslySetInnerHTML={{ __html: exp.description }} 
                        />
                      )}

                      {/* Achievements/Bullets */}
                      {exp.bullet_points && exp.bullet_points.filter((bp: string) => bp.trim() !== '').length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-3 border-t border-white/5">
                          {exp.bullet_points.filter((bp: string) => bp.trim() !== '').map((bp: string, i: number) => (
                            <motion.div 
                              key={i} 
                              initial={{ opacity: 0, y: 5 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 + i * 0.05 }}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/5 hover:border-blue-500/10 hover:bg-blue-500/[0.02] transition-all group/item",
                                index % 2 !== 0 && "md:flex-row-reverse"
                              )}
                            >
                              <div className="mt-1 shrink-0 bg-blue-500/10 p-1 rounded-md group-hover/item:bg-blue-500 transition-colors duration-300">
                                <CheckCircle2 size={10} className="text-blue-400 group-hover/item:text-white" />
                              </div>
                              <p className={cn("text-xs md:text-[13px] text-slate-400/80 font-medium leading-relaxed group-hover/item:text-slate-200 transition-colors tracking-tight", index % 2 !== 0 && "md:text-right")}>{bp}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </section>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  key?: React.Key;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 backdrop-blur-md border",
        active 
          ? "bg-blue-600 text-white border-blue-500 shadow-[0_8px_20px_rgba(37,99,235,0.3)] scale-105" 
          : "bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/20 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
