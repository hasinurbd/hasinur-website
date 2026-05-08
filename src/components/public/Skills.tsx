import React, { useState } from 'react';
import { Palette, Share2, Code, Video, Edit3, Terminal, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';

export default function Skills() {
  const [selectedSkill, setSelectedSkill] = useState<number | null>(null);

  const skills = [
    { 
      title: "Web Development", 
      icon: <Terminal size={32} />,
      description: "Building responsive, modern, and high-performance web applications using the latest technologies. Specializing in frontend architecture and full-stack integration.",
      tags: ["React", "JavaScript", "TypeScript", "Tailwind CSS", "Node.js", "Firebase", "Supabase"]
    },
    { 
      title: "Graphic Design", 
      icon: <Palette size={32} />,
      description: "Visual storytelling through innovative design. Expert in brand identity, marketing collateral, and digital assets that capture attention and communicate effectively.",
      tags: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "Branding", "UI Design"]
    },
    { 
      title: "Video Editing", 
      icon: <Video size={32} />,
      description: "Crafting compelling video content with professional pacing, transitions, and motion graphics. Transforming raw footage into engaging stories for any platform.",
      tags: ["Adobe Premiere Pro", "After Effects", "Color Grading", "Motion Graphics"]
    },
    { 
      title: "Content Writing", 
      icon: <Edit3 size={32} />,
      description: "Strategic storytelling and copy that resonates. From technical documentation to creative articles, I craft words that engage, inform, and convert.",
      tags: ["Copywriting", "Technical Writing", "SEO", "Storytelling", "Creative Strategy"]
    },
    { 
      title: "Social Media Management", 
      icon: <Share2 size={32} />,
      description: "Growing communities and presence through strategic planning, content creation, and engagement across all major social media platforms.",
      tags: ["Platform Strategy", "Engagement", "Analytics", "Brand Consistency", "Paid Media"]
    }
  ];

  return (
    <section id="skills" className="relative py-16 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Code size={20} />} top="70%" left="85%" delay={1} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-blue-500 font-bold tracking-[0.3em] uppercase text-[9px] mb-2 block">Expertise</span>
          <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-white uppercase">Core Competencies</h2>
          <div className="w-10 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
          <p className="text-slate-500 mt-4 max-w-xl mx-auto font-medium text-[11px] md:text-xs">Precision across technical and creative digital disciplines.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          {skills.map((skill, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedSkill(i)}
              className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 text-center flex flex-col items-center group cursor-pointer hover:border-blue-500/40 hover:shadow-[0_15px_40px_rgba(59,130,246,0.1)] transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              
              <div className="w-12 h-12 rounded-[1rem] bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400 mb-6 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400/50 group-hover:scale-110 transition-all duration-500 shadow-inner relative z-10">
                {React.cloneElement(skill.icon as React.ReactElement, { size: 24 })}
                <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </div>
              
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-blue-400/70 transition-colors">Expertise</span>
              <h3 className="font-black text-[11px] md:text-xs text-slate-200 group-hover:text-white line-clamp-2 leading-tight uppercase tracking-wide relative z-10">{skill.title}</h3>
              
              <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                <span>View Detail</span>
              </div>

              {/* Decorative line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-white/10 group-hover:w-16 group-hover:bg-blue-500 transition-all duration-500"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Popup */}
      <AnimatePresence>
        {selectedSkill !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSkill(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-[#0a0f1d] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"></div>
              
              <button 
                onClick={() => setSelectedSkill(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
              >
                <X size={20} />
              </button>

              <div className="p-10 pt-16">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(37,99,235,0.3)]">
                    {skills[selectedSkill].icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1 block">Expertise Area</span>
                    <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{skills[selectedSkill].title}</h2>
                  </div>
                </div>

                <div className="space-y-8">
                  <p className="text-slate-300 text-lg leading-relaxed font-medium">
                    {skills[selectedSkill].description}
                  </p>

                  <div>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Core Toolstack & Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {skills[selectedSkill].tags?.map((tag, idx) => (
                        <span key={idx} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:border-blue-500/50 hover:text-blue-400 transition-colors">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button 
                    onClick={() => setSelectedSkill(null)}
                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all"
                  >
                    Close Expertise
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
