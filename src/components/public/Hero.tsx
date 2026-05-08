import React, { useState, useEffect } from 'react';
import { Facebook, Linkedin, Twitter, Youtube, Download, Palette, CodeXml, Layers, Cpu, Figma, Instagram } from 'lucide-react';
import { getMockProfile } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';

export default function Hero() {
  const [profile, setProfile] = useState(getMockProfile());

  useEffect(() => {
    // Clear legacy dicebear avatars from cache
    const cached = localStorage.getItem('mock_profile');
    if (cached && (cached.includes('dicebear') || cached.includes('hasinur_profile_pic_design_in_ps.png?v=3'))) {
      localStorage.removeItem('mock_profile');
      window.location.reload();
    }
    
    if (hasSupabaseConfig) {
      const fetchProfile = async () => {
        try {
          const { data, error } = await supabase.from('profile_info').select('*').limit(1).maybeSingle();
          if (data && !error) {
            setProfile(data);
            localStorage.setItem('mock_profile', JSON.stringify(data));
          }
        } catch (err) {
          console.error('Hero profile fetch error:', err);
        }
      };
      fetchProfile();
    }
  }, []);

  const handleDownloadCV = async (e: React.MouseEvent) => {
    if (!profile.resume_url || profile.resume_url === "#") return;
    
    try {
      e.preventDefault();
      const response = await fetch(profile.resume_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Resume_Hasinur.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(profile.resume_url, '_blank');
    }
  };

  return (
    <section id="home" className="relative pt-24 pb-12 md:pt-32 md:pb-20 px-4 flex flex-col justify-center min-h-[85vh] items-center text-center overflow-hidden">
      {/* Background elements */}
      <BackgroundBlobs />
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Floating Design Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingIcon icon={<Palette size={32} strokeWidth={1} />} top="15%" left="10%" delay={0} />
        <FloatingIcon icon={<Figma size={36} strokeWidth={1} />} top="25%" left="85%" delay={1} />
        <FloatingIcon icon={<CodeXml size={40} strokeWidth={1} />} top="65%" left="15%" delay={2} />
        <FloatingIcon icon={<Layers size={28} strokeWidth={1} />} top="75%" left="80%" delay={0.5} />
        <FloatingIcon icon={<Cpu size={32} strokeWidth={1} />} top="45%" left="40%" delay={1.5} />
        <FloatingIcon icon={<Palette size={40} strokeWidth={1} />} top="85%" left="40%" delay={0.2} color="text-indigo-500/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto flex flex-col items-center relative z-10"
      >
        <div className="relative mb-6 group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl bg-slate-800 select-none group"
          >
            <img 
              src={profile.avatar_url && profile.avatar_url.length > 5 && !profile.avatar_url.includes('dicebear') ? profile.avatar_url : "https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png"} 
              alt={profile.name} 
              draggable={false}
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
            />
          </motion.div>
        </div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-black mb-4 tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/60 select-none pb-1 drop-shadow-xl"
        >
          {profile.name}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-1 h-10 md:h-16 bg-blue-500 ml-2 translate-y-1 md:translate-y-2"
          />
        </motion.h1>

        {profile.bio && (
          <div 
            className="text-slate-400 max-w-xl text-sm md:text-base mb-8 leading-relaxed font-medium select-none px-4 drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: profile.bio || getMockProfile().bio }}
          />
        )}
        
        <div className="flex flex-col md:flex-row items-center gap-8 justify-center w-full">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.a 
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(37, 99, 235, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              href="https://wa.me/8801518914773"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center gap-3 group relative overflow-hidden"
            >
              <span className="relative z-10">Hire Me Now</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            </motion.a>

            <motion.a 
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              href={profile.resume_url || "#"} 
              onClick={handleDownloadCV}
              className="flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-md text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10 hover:border-blue-500/30"
            >
              <Download size={16} className="text-blue-500" />
              Download CV
            </motion.a>
          </div>
          
          <div className="flex items-center gap-2">
            <SocialLink href={profile.facebook_url || "https://facebook.com/hasinur01"} target="_blank" icon={<Facebook size={18} />} label="Facebook" />
            <SocialLink href={profile.instagram_url || "https://instagram.com/hasinur_rahman"} target="_blank" icon={<Instagram size={18} />} label="Instagram" />
            <SocialLink href={profile.linkedin_url || "https://linkedin.com/in/hasinurbd"} target="_blank" icon={<Linkedin size={18} />} label="LinkedIn" />
            <SocialLink href={profile.behance_url || "https://behance.net/hasinurbd"} target="_blank" icon={<BehanceIcon />} label="Behance" />
            <SocialLink href={profile.twitter_url || "https://twitter.com/hasinurbd"} target="_blank" icon={<Twitter size={18} />} label="Twitter" />
            <SocialLink href={profile.youtube_url || "https://youtube.com/@hasinurbd"} target="_blank" icon={<Youtube size={18} />} label="YouTube" />
          </div>
        </div>
      </motion.div>
      
      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1 cursor-pointer"
        onClick={() => document.getElementById('experience')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="w-1.5 h-2.5 bg-blue-500 rounded-full"></div>
      </motion.div>
    </section>
  );
}

function BehanceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a2 2 0 0 0-2-2H5v4h2a2 2 0 0 0 2-2z"/><path d="M9 18a3 3 0 0 0-3-3H5v5a1 1 0 0 0 1 1h3a3 3 0 0 0 0-6z"/><path d="M14 12h7a4 4 0 0 1 0 8h-7a4 4 0 0 1 0-8z"/><line x1="15" y1="9" x2="20" y2="9"/>
    </svg>
  );
}

function SocialLink({ href, icon, target, label }: { href: string; icon: React.ReactNode; target?: string; label: string }) {
  return (
    <motion.a 
      whileHover={{ y: -3, scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      href={href} 
      target={target}
      title={label}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-blue-600 text-slate-300 hover:text-white border border-white/10 hover:border-blue-400 transition-all duration-300 group shadow-sm"
    >
      <div className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-all">
        {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 1.5 })}
      </div>
    </motion.a>
  );
}
