import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const [viewCount, setViewCount] = useState(100000);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    const fetchViews = async () => {
      if (hasSupabaseConfig) {
        const { data, error } = await supabase
          .from('site_stats')
          .select('views')
          .eq('id', 'global')
          .single();
        
        if (data && !error) {
          const displayViews = Math.max(100000, data.views);
          setViewCount(displayViews);
        }
      } else {
        const saved = localStorage.getItem('mockViews');
        const current = saved ? parseInt(saved) : 100000;
        setViewCount(current);
      }
    };

    fetchViews();
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    if (href === '/') {
      if (!isHome) navigate('/');
      else {
        window.history.pushState(null, '', '/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const sectionId = href.startsWith('/') ? href.substring(1) : href;
    window.history.pushState(null, '', `/${sectionId}`);
    
    if (isHome) {
      const element = document.getElementById(sectionId);
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${sectionId}`);
    }
  };

  return (
    <footer className="bg-slate-950 pt-20 pb-10 px-4 border-t border-white/10 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent blur-md"></div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
        
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-lg bg-slate-900">
              <img src="https://jtcepxgoqbyfwljezndt.supabase.co/storage/v1/object/public/portfolio_assets/hasinur_profile_pic_design_in_ps.png?v=100" alt="Hasinur" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 tracking-tighter leading-none">
               S M Hasinur Rahman
            </h3>
          </div>
          <p className="text-slate-400 text-sm md:text-base font-black leading-relaxed max-w-sm tracking-tighter">
            CSE at UIU, crafting digital excellence through innovation, design, and strategic logic.
          </p>
          <div className="text-xs text-slate-500 font-black tracking-tighter mt-6">
            © 2026 BY HASINUR
          </div>
        </div>

        <div className="col-span-1">
          <h4 className="text-blue-500 font-black mb-6 tracking-tighter text-sm uppercase">Navigation</h4>
          <ul className="space-y-3">
            <li><a href="/" onClick={(e) => handleNavClick(e, '/')} className="text-slate-400 hover:text-blue-400 text-[13px] font-black transition-all tracking-tighter">Return Home</a></li>
            <li><a href="/experience" onClick={(e) => handleNavClick(e, '/experience')} className="text-slate-400 hover:text-blue-400 text-[13px] font-black transition-all tracking-tighter">Experience</a></li>
            <li><a href="/portfolio" onClick={(e) => handleNavClick(e, '/portfolio')} className="text-slate-400 hover:text-blue-400 text-[13px] font-black transition-all tracking-tighter">Portfolio</a></li>
            <li><a href="/achievements" onClick={(e) => handleNavClick(e, '/achievements')} className="text-slate-400 hover:text-blue-400 text-[13px] font-black transition-all tracking-tighter">Achievements</a></li>
            <li><a href="/blogs" onClick={(e) => handleNavClick(e, '/blogs')} className="text-slate-400 hover:text-blue-400 text-[13px] font-black transition-all tracking-tighter">Blogs</a></li>
            <li><a href="/contact" onClick={(e) => handleNavClick(e, '/contact')} className="text-slate-400 hover:text-blue-400 text-[13px] font-black transition-all tracking-tighter">Connect</a></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="text-blue-500 font-black mb-6 tracking-tighter text-sm uppercase">Connect</h4>
          <ul className="space-y-4">
            <li className="text-slate-400">
              <span className="text-slate-500 block text-[11px] font-black tracking-tighter mb-1 uppercase">Direct Line</span>
              <a href="mailto:hasinurrahman.me@gmail.com" className="text-white hover:text-blue-400 transition-colors text-[13px] font-black tracking-tighter">hasinurrahman.me@gmail.com</a>
            </li>
            <li className="text-slate-400">
              <span className="text-slate-500 block text-[11px] font-black tracking-tighter mb-1 uppercase">Phone</span>
              <a href="tel:+8801518914773" className="text-white hover:text-blue-400 transition-colors text-[13px] font-black tracking-tighter">+8801518914773</a>
            </li>
            <li className="mt-2 text-right md:text-left">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl shadow-sm hover:border-blue-500/50 transition-all group">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                </span>
                <span className="text-[11px] text-slate-400 tracking-tighter font-black">Visits: <span className="text-white">{viewCount.toLocaleString()}</span></span>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
