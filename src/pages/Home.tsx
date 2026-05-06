import React, { useState, useEffect } from 'react';
import Navbar from '../components/public/Navbar';
import Hero from '../components/public/Hero';
import Experience from '../components/public/Experience';
import Skills from '../components/public/Skills';
import Projects from '../components/public/Projects';
import Achievements from '../components/public/Achievements';
import Blogs from '../components/public/Blogs';
import Contact from '../components/public/Contact';
import Footer from '../components/public/Footer';
import FloatingChat from '../components/public/FloatingChat';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
      <Navbar />
      <main className="relative z-10 w-full overflow-hidden">
        <Hero />
        <Experience />
        <Skills />
        <Projects />
        <Achievements />
        <Blogs />
        <Contact />
      </main>
      <div className="relative z-10">
        <Footer />
        <FloatingChat />
      </div>
    </div>
  );
}
