import React, { Suspense, lazy, useEffect } from 'react';
import Navbar from '../components/public/Navbar';
import Hero from '../components/public/Hero';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import { useLocation } from 'react-router-dom';

const Experience = lazy(() => import('../components/public/Experience'));
const Skills = lazy(() => import('../components/public/Skills'));
const Reviews = lazy(() => import('../components/public/Reviews'));
const Projects = lazy(() => import('../components/public/Projects'));
const Achievements = lazy(() => import('../components/public/Achievements'));
const Blogs = lazy(() => import('../components/public/Blogs'));
const Contact = lazy(() => import('../components/public/Contact'));
const Footer = lazy(() => import('../components/public/Footer'));
const FloatingChat = lazy(() => import('../components/public/FloatingChat'));

const LoaderFallback = () => (
  <div className="w-full py-20 flex justify-center items-center">
    <div className="w-8 h-8 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
  </div>
);

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    // Only set sub-page titles here, base title is handled by ProfileContext
    const path = location.pathname.substring(1);
    if (path && !['home', '/'].includes(path)) {
      const sectionName = path.charAt(0).toUpperCase() + path.slice(1);
      const baseTitle = 'S M Hasinur Rahman'; // Fallback base title
      document.title = `${sectionName} | ${baseTitle}`;
    } else {
      // Restore home title if on root
      const saved = localStorage.getItem('mock_profile');
      if (saved) {
        const profile = JSON.parse(saved);
        if (profile.name) {
          document.title = `${profile.name} | Portfolio - ${profile.title}`;
        }
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const incrementViews = async () => {
      try {
        if (hasSupabaseConfig) {
          const { data: currentData } = await supabase.from('site_stats').select('views').eq('id', 'global').maybeSingle();
          if (currentData) {
            await supabase.from('site_stats').update({ views: (currentData.views || 100000) + 1 }).eq('id', 'global');
          } else {
            await supabase.from('site_stats').insert([{ id: 'global', views: 100001 }]);
          }
        } else {
          const saved = localStorage.getItem('mockViews');
          const current = saved ? parseInt(saved) : 100000;
          localStorage.setItem('mockViews', (current + 1).toString());
        }
      } catch (e) {
        // Silent error for view counting
      }
    };
    incrementViews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
      <Navbar />
      <main className="relative z-10 w-full overflow-hidden">
        <Hero />
        <Suspense fallback={<LoaderFallback />}>
          <Experience />
          <Skills />
          <Reviews />
          <Projects />
          <Achievements />
          <Blogs />
          <Contact />
        </Suspense>
      </main>
      <div className="relative z-10">
        <Suspense fallback={<LoaderFallback />}>
          <Footer />
          <FloatingChat />
        </Suspense>
      </div>
    </div>
  );
}
