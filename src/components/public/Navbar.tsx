import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '../../lib/ProfileContext';

const navLinks = [
    { name: 'Experience', href: '/experience' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Achievements', href: '/achievements' },
    { name: 'Blogs', href: '/blogs' },
    { name: 'Contact', href: '/contact' },
  ];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { avatarUrl, profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '/home';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Auto scroll to section on initial load if path exists
    const path = location.pathname.split('/')[1];
    if (path && ['experience', 'portfolio', 'achievements', 'blogs', 'contact'].includes(path)) {
      setTimeout(() => {
        const element = document.getElementById(path);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/5 py-1.5' : 'bg-transparent py-3'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a href="/" onClick={(e) => handleNavClick(e, '/')} className="group flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-blue-500/50 overflow-hidden shadow-[0_0_12px_rgba(37,99,235,0.2)] bg-slate-900 group-hover:border-blue-400 transition-all">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors leading-none whitespace-nowrap">HASINUR</span>
              </div>
            </a>
          </div>
          
          <nav className="hidden md:flex space-x-6 items-center">
            <a href="/" onClick={(e) => handleNavClick(e, '/')} className="text-[13px] font-black tracking-tighter text-slate-400 hover:text-white transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
            </a>
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="text-[13px] font-black tracking-tighter text-slate-400 hover:text-white transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>
          
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/98 backdrop-blur-xl border-b border-white/10 absolute top-full left-0 right-0 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-6 py-8 space-y-6">
            {/* Logo and Details in Mobile Menu */}
            <div className="flex items-center gap-4 pb-6 border-b border-white/5">
              <div className="w-14 h-14 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-lg bg-slate-900">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-white">{profile.name}</span>
                <span className="text-xs font-black tracking-tighter text-blue-500 uppercase">{profile.title}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <a href="/" onClick={(e) => handleNavClick(e, '/')} className="px-4 py-3 rounded-2xl text-lg font-black tracking-tighter text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between group">
                <span>Home</span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
              </a>
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} onClick={(e) => handleNavClick(e, link.href)} className="px-4 py-3 rounded-2xl text-lg font-black tracking-tighter text-slate-300 hover:text-white hover:bg-white/5 transition-all flex items-center justify-between group">
                  <span>{link.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </a>
              ))}
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <a href={`mailto:${profile.email}`} className="block text-center px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black tracking-tighter transition-all shadow-lg shadow-blue-600/20">
                Let's Collaborate
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
