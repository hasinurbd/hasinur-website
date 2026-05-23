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
    <section id="clients" className="py-10 bg-slate-950/20 border-y border-white/[0.03] overflow-hidden relative z-10 w-full select-none">
      <div className="max-w-7xl mx-auto px-4 mb-5 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">
          Trusted Collaborations & Clients
        </p>
      </div>

      <div className="relative w-full overflow-hidden flex items-center h-16">
        {/* Soft elegant shadow masks for left/right edges */}
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling Ticker Line: GPU accelerated, zero CPU layout cost, pauses on hover! */}
        <div 
          className="flex gap-16 items-center shrink-0 animate-marquee-right hover:[animation-play-state:paused] cursor-pointer will-change-transform"
          style={{ width: 'max-content' }}
        >
          {duplicatedLogos.map((logo, index) => (
            <div 
              key={`${logo.id}-${index}`} 
              className="flex items-center justify-center h-10 w-28 px-2 shrink-0 transition-transform duration-300 hover:scale-110"
            >
              <img 
                src={logo.image_url} 
                alt={logo.name || 'Client Logo'} 
                title={logo.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="max-h-8 max-w-[110px] object-contain opacity-40 hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
