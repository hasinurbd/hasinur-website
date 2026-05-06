import React, { useState, useEffect } from 'react';
import { Facebook, Linkedin, Twitter, Youtube, Download, Palette, CodeXml, Layers, Cpu, Figma, Sparkles } from 'lucide-react';
import { getMockProfile } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';

export default function Hero() {
  const [profile, setProfile] = useState(getMockProfile());
  const [skillIndex, setSkillIndex] = useState(0);
  const skills = ["Graphic Design", "Social Media Management", "Web Development", "Content Writing", "Video Editing"];

  useEffect(() => {
    const interval = setInterval(() => {
      setSkillIndex((prev) => (prev + 1) % skills.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [skills.length]);

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchProfile = async () => {
        const { data, error } = await supabase.from('profile_info').select('*').single();
        if (data && !error) setProfile(data);
      };
      fetchProfile();
    }
  }, []);

  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col justify-center min-h-[95vh] items-center text-center overflow-hidden">
      {/* Background elements */}
      <BackgroundBlobs />
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Floating Design Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingIcon icon={<Palette size={48} strokeWidth={1} />} top="15%" left="10%" delay={0} />
        <FloatingIcon icon={<Figma size={54} strokeWidth={1} />} top="25%" left="85%" delay={1} />
        <FloatingIcon icon={<CodeXml size={64} strokeWidth={1} />} top="65%" left="15%" delay={2} />
        <FloatingIcon icon={<Layers size={40} strokeWidth={1} />} top="75%" left="80%" delay={0.5} />
        <FloatingIcon icon={<Cpu size={48} strokeWidth={1} />} top="45%" left="40%" delay={1.5} />
        <FloatingIcon icon={<Sparkles size={36} strokeWidth={1} />} top="10%" left="60%" delay={2} />
        <FloatingIcon icon={<Palette size={60} strokeWidth={1} />} top="85%" left="40%" delay={0.2} color="text-indigo-500/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto flex flex-col items-center relative z-10"
      >
        <div className="relative mb-10 group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative w-44 h-44 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-800"
          >
            <img 
              src={profile.avatar_url && profile.avatar_url.length > 5 ? profile.avatar_url : "/hasinur_profile_pic_design_in_ps.png"} 
              alt={profile.name} 
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            />
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70"
        >
          {profile.name.split('').map((char: string, i: number) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1, delay: i * 0.05 }}
            >
              {char}
            </motion.span>
          ))}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1 h-12 md:h-20 bg-blue-500 ml-1 translate-y-2"
          />
        </motion.h1>

        <div className="h-12 mb-8 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={skillIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-2xl md:text-3xl text-blue-400 font-medium"
            >
              {skills[skillIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        
        <div 
          className="text-slate-400 max-w-2xl text-lg mb-12 leading-relaxed font-light [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_p]:mb-2"
          dangerouslySetInnerHTML={{ __html: profile.bio }}
        />
        
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <motion.a 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, '', '/contact');
              const el = document.getElementById('contact');
              if(el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center gap-2"
          >
            Hire Me Now
          </motion.a>

          <a href={profile.resume_url || "#"} download="S_M_Hasinur_Rahman_CV.pdf" className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-medium transition-all border border-white/10">
            <Download size={20} />
            Download CV
          </a>
          
          <div className="flex items-center space-x-3 ml-4">
            <SocialLink href="#" icon={<Facebook size={18} />} />
            <SocialLink href="#" icon={<Linkedin size={18} />} />
            <SocialLink href="#" icon={<Twitter size={18} />} />
            <SocialLink href="#" icon={<Youtube size={18} />} />
          </div>
        </div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-white/10 rounded-full flex justify-center p-1"
      >
        <div className="w-1 h-2 bg-blue-500 rounded-full"></div>
      </motion.div>
    </section>
  );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <motion.a 
      whileHover={{ y: -3 }}
      href={href} 
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all outline-none"
    >
      {icon}
    </motion.a>
  );
}
