import React, { useState } from 'react';
import { useProfile } from '../../lib/ProfileContext';

export default function FloatingChat() {
  const { profile } = useProfile();
  const [showTooltip, setShowTooltip] = useState(false);

  // Clean the phone number for WhatsApp URL (digits-only)
  const cleanPhone = profile?.phone 
    ? profile.phone.replace(/\+/g, '').replace(/[\s-()]/g, '') 
    : '8801647706099';

  const whatsappUrl = `https://wa.me/${cleanPhone}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Tooltip / Prompt bubble - Desktop ONLY to prevent stuck hover states on mobile */}
      <div 
        className={`hidden md:flex mb-3 mr-1 bg-slate-900/95 border border-white/10 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl transition-all duration-300 transform origin-bottom items-center gap-2 whitespace-nowrap backdrop-blur-md ${
          showTooltip ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-2 scale-90 pointer-events-none"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Chat on WhatsApp</span>
      </div>

      {/* Button Wrapper with pulsing feedback */}
      <div className="relative">
        {/* Pulsing Backlight Waves */}
        <span className="absolute -inset-2 rounded-full bg-emerald-500/20 animate-ping opacity-75 pointer-events-none"></span>
        <span className="absolute -inset-1 rounded-full bg-emerald-500/10 animate-pulse pointer-events-none"></span>

        {/* Floating Button */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="relative w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_30px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110 active:scale-95 group select-none touch-manipulation"
          aria-label="Chat on WhatsApp"
        >
          {/* High-fidelity WhatsApp SVG icon */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-7 h-7 fill-white transition-transform duration-300 group-hover:rotate-12"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M12.03 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.42 1.27 4.88L2 22l5.28-1.38c1.4.76 3 1.18 4.75 1.18 5.52 0 10-4.48 10-10S17.55 2 12.03 2zm6.27 14.1c-.26.74-1.31 1.34-1.8 1.43-.43.08-.98.11-2.91-.66-2.47-1-4.04-3.52-4.16-3.69-.12-.17-.98-1.31-.98-2.5s.61-1.77.83-2.01c.22-.24.48-.3.64-.3.16 0 .32 0 .46.01.15.01.35-.06.55.42.2.48.69 1.67.75 1.79.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.25-.1.49.14.24.63 1.03 1.34 1.66.93.82 1.7 1.08 1.94 1.2.24.12.38.1.52-.06.14-.16.6-.7.76-.94.16-.24.32-.2.54-.12.22.08 1.4.66 1.64.78.24.12.4.18.46.28.06.1.06.58-.18 1.27z" 
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
