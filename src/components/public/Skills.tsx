import React from 'react';
import { Palette, Share2, Code, Video, Edit3, Terminal, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';

export default function Skills() {
  const skills = [
    { title: "Web Development", icon: <Terminal size={32} /> },
    { title: "Graphic Design", icon: <Palette size={32} /> },
    { title: "Video Editing", icon: <Video size={32} /> },
    { title: "Content Writing", icon: <Edit3 size={32} /> },
    { title: "Social Media Management", icon: <Share2 size={32} /> }
  ];

  return (
    <section id="skills" className="relative py-20 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<Sparkles size={20} />} top="30%" left="12%" delay={0} />
        <FloatingIcon icon={<Code size={20} />} top="70%" left="85%" delay={1} />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Competencies</h2>
          <div className="w-20 h-1 bg-blue-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {skills.map((skill, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center group hover:bg-gradient-to-br hover:from-blue-900/40 hover:to-slate-800 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                {skill.icon}
              </div>
              <h3 className="font-bold text-sm text-slate-200 group-hover:text-white line-clamp-2">{skill.title}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
