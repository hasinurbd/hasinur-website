import React, { useState, useEffect } from 'react';
import { Facebook, Linkedin, Twitter, Youtube, Download, Palette, CodeXml, Layers, Cpu, Figma, Sparkles, Instagram } from 'lucide-react';
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
        if (data && !error) {
          setProfile(data);
          localStorage.setItem('mock_profile', JSON.stringify(data));
        }
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
              src={profile.avatar_url && profile.avatar_url.length > 5 ? profile.avatar_url : `/hasinur_profile_pic_design_in_ps.png`} 
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
            href="https://wa.me/8801518914773"
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center gap-2"
          >
            Hire Me Now
          </motion.a>

          <a href={profile.resume_url || "#"} download="S_M_Hasinur_Rahman_CV.pdf" className="flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full font-medium transition-all border border-white/10">
            <Download size={20} />
            Download CV
          </a>
          
          <div className="flex flex-wrap items-center justify-center space-x-3 mt-4 sm:mt-0 ml-4 gap-y-2">
            <SocialLink href="https://www.facebook.com/hasinur01" target="_blank" icon={<Facebook size={18} />} />
            <SocialLink href="https://www.instagram.com/_._.hasinur_._" target="_blank" icon={<Instagram size={18} />} />
            <SocialLink href="https://www.linkedin.com/in/hasinurbd" target="_blank" icon={<Linkedin size={18} />} />
            <SocialLink href="https://www.behance.net/hasinurrahman11" target="_blank" icon={<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14h-8.027c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-3.197.809c0 .73-.028 1.411-.084 2.039-.187 2.083-1.619 3.152-3.879 3.152h-8.88v-16h8.041c2.208 0 4.093 1.05 4.093 3.111 0 1.258-.755 2.102-1.848 2.502 1.488.232 2.657 1.487 2.657 3.196h-.1zm-8.843-6.809v4h4.093c1.391 0 2.015-.558 2.015-1.554 0-1.026-.607-1.688-2.034-1.688h-4.074v-.758zm0 6h4.529c1.64 0 2.222.753 2.222 1.942 0 1.008-.667 1.776-2.015 1.776h-4.736v-3.718z"/></svg>} />
            <SocialLink href="https://x.com/hasinurofficial" target="_blank" icon={<Twitter size={18} />} />
            <SocialLink href="https://www.youtube.com/@hasinurme" target="_blank" icon={<Youtube size={18} />} />
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

function SocialLink({ href, icon, target }: { href: string; icon: React.ReactNode; target?: string }) {
  return (
    <motion.a 
      whileHover={{ y: -3 }}
      href={href} 
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all outline-none"
    >
      {icon}
    </motion.a>
  );
}
