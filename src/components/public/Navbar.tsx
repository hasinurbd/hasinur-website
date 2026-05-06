import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { getMockProfile } from '../../lib/mockData';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(getMockProfile().avatar_url);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchProfile = async () => {
        const { data, error } = await supabase.from('profile_info').select('avatar_url').single();
        if (data && !error && data.avatar_url) {
          setAvatarUrl(data.avatar_url);
          const cached = JSON.parse(localStorage.getItem('mock_profile') || '{}');
          cached.avatar_url = data.avatar_url;
          localStorage.setItem('mock_profile', JSON.stringify(cached));
        }
      };
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Auto scroll to section on initial load if path exists
    setTimeout(() => {
      const path = location.pathname.split('/')[1];
      if (path && (path === 'experience' || path === 'portfolio' || path === 'achievements' || path === 'blogs' || path === 'contact')) {
        const element = document.getElementById(path);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 500);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Experience', href: '/experience' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Achievements', href: '/achievements' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (href === '/') {
      if (!isHome) navigate('/');
      else {
        window.history.pushState(null, '', '/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    const sectionId = href.startsWith('/') ? href.substring(1) : href;
    
    // Use pushState to update URL without reloading
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <a href="/" onClick={(e) => handleNavClick(e, '/')} className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-blue-500 overflow-hidden shadow-[0_0_15px_rgba(37,99,235,0.3)] bg-slate-900">
              <img src={avatarUrl && avatarUrl.length > 5 ? avatarUrl : "/hasinur_profile_pic_design_in_ps.png"} alt="Profile" className="w-full h-full object-cover" />
            </div>
            HASINUR.
          </a>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="/" onClick={(e) => handleNavClick(e, '/')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </a>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-sm font-medium text-slate-300 hover:text-white transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-md border-b border-white/10 absolute top-full left-0 right-0 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            <a href="/" onClick={(e) => handleNavClick(e, '/')} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50">
              Home
            </a>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50">
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
