import React, { Suspense, lazy, useEffect } from 'react';
import Navbar from '../components/public/Navbar';
import Hero from '../components/public/Hero';
import Clients from '../components/public/Clients';
import Experience from '../components/public/Experience';
import Skills from '../components/public/Skills';
import { useLocation } from 'react-router-dom';

const Reviews = lazy(() => import('../components/public/Reviews'));
const Projects = lazy(() => import('../components/public/Projects'));
const Achievements = lazy(() => import('../components/public/Achievements'));
const Blogs = lazy(() => import('../components/public/Blogs'));
const Contact = lazy(() => import('../components/public/Contact'));
const Footer = lazy(() => import('../components/public/Footer'));
const FloatingChat = lazy(() => import('../components/public/FloatingChat'));

function SectionFallback({ id, minHeight = 'min-h-[280px]' }: { id?: string; minHeight?: string }) {
  return <div id={id} className={minHeight} aria-hidden="true" />;
}

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('profile_cache') || localStorage.getItem('mock_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile && profile.name) {
          document.title = profile.name;
        }
      }
    } catch (e) {
      // Ignore storage or JSON parse errors
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
      <Navbar />
      <main className="relative z-10 w-full overflow-hidden">
        <Hero />
        <Clients />
        <Experience />
        <Skills />
        <Suspense fallback={<SectionFallback id="reviews" />}>
          <Reviews />
        </Suspense>
        <Suspense fallback={<SectionFallback id="portfolio" minHeight="min-h-[420px]" />}>
          <Projects />
        </Suspense>
        <Suspense fallback={<SectionFallback id="achievements" />}>
          <Achievements />
        </Suspense>
        <Suspense fallback={<SectionFallback id="blogs" />}>
          <Blogs />
        </Suspense>
        <Suspense fallback={<SectionFallback id="contact" />}>
          <Contact />
        </Suspense>
      </main>
      <div className="relative z-10">
        <Suspense fallback={<SectionFallback minHeight="min-h-[200px]" />}>
          <Footer />
        </Suspense>
        <Suspense fallback={null}>
          <FloatingChat />
        </Suspense>
      </div>
    </div>
  );
}
