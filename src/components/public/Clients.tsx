import React, { useEffect, useState } from 'react';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { mockClients, getMockData } from '../../lib/mockData';

export default function Clients() {
  const [logos, setLogos] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        if (hasSupabaseConfig) {
          const { data } = await supabase
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

  // Repeat logos enough times per half so the marquee always spans wider than any viewport
  const minItemsPerHalf = 20;
  const repeatCount = Math.max(4, Math.ceil(minItemsPerHalf / logos.length));
  const baseGroup = Array.from({ length: repeatCount }, () => logos).flat();
  const duplicatedLogos = [...baseGroup, ...baseGroup];

  return (
    <section id="clients" className="py-12 lg:py-16 bg-slate-950/10 border-y border-white/[0.04] overflow-hidden relative z-10 w-full select-none">
      <div className="max-w-6xl mx-auto px-4 mb-8 text-center">
        <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[11px] mb-2.5 block">Collaborations</span>
        <h2 className="text-2xl sm:text-3xl font-black mb-3.5 tracking-tight text-white">Trusted Clients &amp; Brands</h2>
        <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 mx-auto rounded-full"></div>
      </div>

      <div className="relative w-full overflow-hidden flex items-center h-20">
        {/* Soft elegant shadow masks for left/right edges */}
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling Ticker Line: GPU accelerated left-to-right, pauses on hover */}
        <div
          className="flex gap-4 pr-4 items-center shrink-0 animate-marquee-right hover:[animation-play-state:paused] cursor-pointer"
          style={{ width: 'max-content' }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="flex items-center justify-center h-16 w-32 px-4 shrink-0 bg-white hover:bg-slate-100/90 border border-white/10 rounded-xl transition-transform duration-200 hover:scale-105 hover:border-blue-500/35 shadow-md shadow-black/5"
            >
              <img
                src={logo.image_url}
                alt={logo.name || 'Client Logo'}
                title={logo.name}
                decoding="async"
                referrerPolicy="no-referrer"
                className="max-h-10 max-w-full object-contain opacity-95 hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
