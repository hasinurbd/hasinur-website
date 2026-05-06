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
          
          // Increment views
          await supabase
            .from('site_stats')
            .update({ views: data.views + 1 })
            .eq('id', 'global');
        }
      } else {
        // Mock increment
        const saved = localStorage.getItem('mockViews');
        const current = saved ? parseInt(saved) : 100000;
        const displayViews = Math.max(100000, current);
        const next = displayViews + Math.floor(Math.random() * 2) + 1;
        setViewCount(next);
        localStorage.setItem('mockViews', next.toString());
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
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 mb-4 tracking-tighter">
             S M Hasinur Rahman.
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            CSE undergraduate at United International University, creating exceptional digital experiences through innovation, design, and strategic thinking.
          </p>
        </div>

        <div className="col-span-1">
          <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Navigation</h4>
          <ul className="space-y-2">
            <li><a href="/" onClick={(e) => handleNavClick(e, '/')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Return to Home</a></li>
            <li><a href="/portfolio" onClick={(e) => handleNavClick(e, '/portfolio')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Portfolio</a></li>
            <li><a href="/achievements" onClick={(e) => handleNavClick(e, '/achievements')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Achievements</a></li>
            <li><a href="/blogs" onClick={(e) => handleNavClick(e, '/blogs')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Blogs</a></li>
            <li><a href="/contact" onClick={(e) => handleNavClick(e, '/contact')} className="text-slate-400 hover:text-blue-400 text-sm transition-colors">Contact</a></li>
            <li><a href="/admin" className="text-slate-400 hover:text-blue-400 text-sm transition-colors block mt-2">Admin Panel</a></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Get in Touch</h4>
          <ul className="space-y-3">
            <li className="text-slate-400 text-sm">
              <span className="text-slate-500 block text-xs uppercase mb-1">Email</span>
              <a href="mailto:hasinurrahman.me@gmail.com" className="text-white hover:text-blue-400 transition-colors font-medium">hasinurrahman.me@gmail.com</a>
            </li>
            <li className="text-slate-400 text-sm">
              <span className="text-slate-500 block text-xs uppercase mb-1">Phone</span>
              <a href="tel:+8801518914773" className="text-white hover:text-blue-400 transition-colors font-medium">+8801518914773</a>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-6xl mx-auto border-t border-white/10 pt-8 flex flex-col items-center gap-4 text-xs text-slate-500 uppercase tracking-widest">
        <p>Made with ❤️ by S M Hasinur Rahman © {new Date().getFullYear()}</p>
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-white/5 mt-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span>Views: {viewCount.toLocaleString()}</span>
        </div>
      </div>
    </footer>
  );
}
