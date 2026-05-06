import React, { Suspense, lazy } from 'react';
import Navbar from '../components/public/Navbar';
import Hero from '../components/public/Hero';

const Experience = lazy(() => import('../components/public/Experience'));
const Skills = lazy(() => import('../components/public/Skills'));
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
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
      <Navbar />
      <main className="relative z-10 w-full overflow-hidden">
        <Hero />
        <Suspense fallback={<LoaderFallback />}>
          <Experience />
          <Skills />
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
