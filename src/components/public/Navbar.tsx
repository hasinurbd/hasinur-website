import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useProfile } from '../../lib/ProfileContext';
import { cn } from '../../lib/utils';

const navLinks = [
  { id: 'home', name: 'Home', href: '/' },
  { id: 'experience', name: 'Experience', href: '/experience' },
  { id: 'skills', name: 'Skills', href: '/skills' },
  { id: 'portfolio', name: 'Portfolio', href: '/portfolio' },
  { id: 'achievements', name: 'Achievements', href: '/achievements' },
  { id: 'blogs', name: 'Blogs', href: '/blogs' },
  { id: 'contact', name: 'Contact', href: '/contact' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const { avatarUrl, profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/' || location.pathname === '/home' || navLinks.some((l) => l.href === location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      if (!isHome) return;
      if (window.scrollY < 140) {
        setActiveSection('home');
        return;
      }

      const scrollMarker = window.scrollY + 180;
      let current = 'home';

      for (const link of navLinks) {
        if (link.id === 'home') continue;
        const el = document.getElementById(link.id);
        if (el && el.offsetTop <= scrollMarker) {
          current = link.id;
        }
      }
      setActiveSection(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Auto scroll to section on initial load if path matches a section
    const path = location.pathname.split('/')[1];
    let scrollTimer1: ReturnType<typeof setTimeout> | undefined;
    let scrollTimer2: ReturnType<typeof setTimeout> | undefined;

    if (path && ['skills', 'experience', 'portfolio', 'achievements', 'blogs', 'contact'].includes(path)) {
      setActiveSection(path);
      scrollTimer1 = setTimeout(() => {
        const element = document.getElementById(path);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      // Re-align after lazy sections/images settle height above target
      scrollTimer2 = setTimeout(() => {
        const element = document.getElementById(path);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 950);
    } else if (location.pathname === '/') {
      setActiveSection('home');
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimer1) clearTimeout(scrollTimer1);
      if (scrollTimer2) clearTimeout(scrollTimer2);
    };
  }, [location.pathname, isHome]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, id: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    setActiveSection(id);

    if (href === '/') {
      if (location.pathname !== '/' && !isHome) {
        navigate('/');
      } else {
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
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-slate-950/90 backdrop-blur-md border-b border-white/[0.06] py-2'
          : 'bg-transparent py-3.5'
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, '/', 'home')}
              className="group flex items-center gap-3 shrink-0"
            >
              <div className="w-10 h-10 rounded-full border border-blue-500/50 overflow-hidden shadow-[0_0_12px_rgba(37,99,235,0.2)] bg-transparent group-hover:border-blue-400 transition-all shrink-0">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors leading-none whitespace-nowrap uppercase">
                  HASINUR
                </span>
              </div>
            </a>
          </div>

          <nav className="hidden md:flex items-center space-x-6" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const isActive = isHome && activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.id)}
                  className={cn(
                    'text-[13px] font-bold tracking-tight transition-colors duration-200 relative py-1 group',
                    isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                  )}
                >
                  <span className="inline-block transition-transform duration-200 group-hover:-translate-y-0.5">
                    {link.name}
                  </span>
                  {isActive ? (
                    <motion.span
                      layoutId="navbar-active-indicator"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    />
                  ) : (
                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-500/70 rounded-full transition-all duration-200 group-hover:w-full" />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/98 backdrop-blur-xl border-b border-white/10 absolute top-full left-0 right-0 shadow-2xl">
          <div className="px-6 py-7 space-y-5">
            <div className="flex items-center gap-4 pb-5 border-b border-white/[0.06]">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500/50 overflow-hidden shadow-lg bg-transparent shrink-0">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-black tracking-tight text-white truncate">
                  {profile.name}
                </span>
                <span className="text-[11px] font-bold tracking-wide text-blue-400 uppercase truncate">
                  {profile.title}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {navLinks.map((link) => {
                const isActive = isHome && activeSection === link.id;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href, link.id)}
                    className={cn(
                      'px-4 py-3 rounded-xl text-base font-bold tracking-tight transition-all flex items-center justify-between',
                      isActive
                        ? 'bg-blue-600/15 text-white border border-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>{link.name}</span>
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full bg-blue-400 transition-opacity',
                        isActive ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </a>
                );
              })}
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <a
                href={`mailto:${profile.email}`}
                className="block text-center px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-blue-600/20"
              >
                Let&apos;s Collaborate
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
