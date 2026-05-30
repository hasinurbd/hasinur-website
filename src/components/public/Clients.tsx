import React, { useEffect, useState } from 'react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { mockClients, getMockData } from '../../lib/mockData';

export default function Clients() {
  const [logos, setLogos] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        if (hasSupabaseConfig) {
          const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });
          if (data && data.length > 0) {
            setLogos(data);
            return;
          }
        }
      } catch (e) {
        console.warn('Supabase clients fetch failed, using mock data:', e);
      }
      
      // Fallback
      const localData = getMockData('mock_clients', mockClients);
      setLogos(localData);
    };

    fetchLogos();
  }, []);

  if (logos.length === 0) return null;

  // Quadruple or quintuple to ensure there are plenty of logos to fill any high-resolution viewport screen
  // Seamless loop marquee requires that the width of the animated row is at least 200% of viewport
  const duplicatedLogos = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos, ...logos, ...logos];

  return (
    <section id="clients" className="py-12 bg-slate-950/10 border-y border-white/[0.02] overflow-hidden relative z-10 w-full select-none">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <span className="text-blue-500 font-bold tracking-[0.3em] uppercase text-[9px] mb-2 block">Collaborations</span>
        <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-white uppercase font-sans">Trusted Clients & Brands</h2>
        <div className="w-10 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]"></div>
      </div>

      <div className="relative w-full overflow-hidden flex items-center h-20">
        {/* Soft elegant shadow masks for left/right edges */}
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling Ticker Line: GPU accelerated, zero CPU layout cost, pauses on hover! */}
        <div 
          className="flex gap-4 items-center shrink-0 animate-marquee-right hover:[animation-play-state:paused] cursor-pointer will-change-transform px-4"
          style={{ width: 'max-content' }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div 
              key={`${logo.id}-${index}`} 
              className="flex items-center justify-center h-16 w-32 px-4 shrink-0 bg-white hover:bg-slate-100/90 border border-white/10 rounded-xl transition-all duration-300 hover:scale-105 hover:border-blue-500/35 shadow-md shadow-black/5"
            >
              <img 
                src={logo.image_url} 
                alt={logo.name || 'Client Logo'} 
                title={logo.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="max-h-10 max-w-full object-contain opacity-95 hover:opacity-100 transition-all duration-300 pointer-events-none" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
