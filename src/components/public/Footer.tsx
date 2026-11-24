import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProfile } from '../../lib/ProfileContext';
import { getViewStats } from '../../lib/viewTracker';

const HOME_SECTION_PATHS = ['/', '/home', '/experience', '/skills', '/portfolio', '/achievements', '/blogs', '/contact'];

export default function Footer() {
  const [viewCount, setViewCount] = useState(12480);
  const { profile } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = HOME_SECTION_PATHS.includes(location.pathname);

  useEffect(() => {
    let isMounted = true;
    const fetchViews = async () => {
      try {
        const stats = await getViewStats();
        if (isMounted) setViewCount(stats.totalViews);
      } catch (e) {
        // Ignore view stats errors
      }
    };

    fetchViews();

    const handlePageView = () => fetchViews();
    window.addEventListener('page_view_recorded', handlePageView);
    return () => {
      isMounted = false;
      window.removeEventListener('page_view_recorded', handlePageView);
    };
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

    if (isHome) {
      window.history.pushState(null, '', `/${sectionId}`);
      const element = document.getElementById(sectionId);
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${sectionId}`);
    }
  };

  return (
    <footer className="bg-slate-950 pt-16 pb-10 px-4 border-t border-white/[0.08] relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent blur-md"></div>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4">
            <h3 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600 tracking-tighter leading-none">
               {profile.name}
            </h3>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            CSE at UIU, crafting digital excellence through innovation, design, and strategic logic.
          </p>
          <div className="text-xs text-slate-500 font-medium mt-6">
            © 2026 {profile.name || 'S M Hasinur Rahman'}
          </div>
        </div>

        <div className="col-span-1">
          <h4 className="text-blue-400 font-bold mb-5 tracking-wider text-xs uppercase">Navigation</h4>
          <ul className="space-y-2.5">
            <li><a href="/" onClick={(e) => handleNavClick(e, '/')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Home</a></li>
            <li><a href="/experience" onClick={(e) => handleNavClick(e, '/experience')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Experience</a></li>
            <li><a href="/skills" onClick={(e) => handleNavClick(e, '/skills')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Skills</a></li>
            <li><a href="/portfolio" onClick={(e) => handleNavClick(e, '/portfolio')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Portfolio</a></li>
            <li><a href="/achievements" onClick={(e) => handleNavClick(e, '/achievements')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Achievements</a></li>
            <li><a href="/blogs" onClick={(e) => handleNavClick(e, '/blogs')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Blogs</a></li>
            <li><a href="/contact" onClick={(e) => handleNavClick(e, '/contact')} className="text-slate-400 hover:text-blue-400 text-sm font-medium transition-colors">Contact</a></li>
          </ul>
        </div>

        <div className="col-span-1">
          <h4 className="text-blue-400 font-bold mb-5 tracking-wider text-xs uppercase">Connect</h4>
          <ul className="space-y-4">
            <li className="text-slate-400">
              <span className="text-slate-500 block text-[11px] font-semibold tracking-wider mb-1 uppercase">Email</span>
              <a href={`mailto:${profile.email}`} className="text-white hover:text-blue-400 transition-colors text-sm font-medium">{profile.email}</a>
            </li>
            <li className="text-slate-400">
              <span className="text-slate-500 block text-[11px] font-semibold tracking-wider mb-1 uppercase">Phone</span>
              <a href={`tel:${profile.phone}`} className="text-white hover:text-blue-400 transition-colors text-sm font-medium tabular-nums">{profile.phone}</a>
            </li>
            <li className="mt-2">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-white/10 px-3.5 py-2 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">
                  Total Visits: <span className="text-white font-semibold tabular-nums">{viewCount.toLocaleString()}</span>
                </span>
              </div>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
