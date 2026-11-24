import React, { useEffect, useState } from 'react';
import {
  Facebook,
  Linkedin,
  Github,
  Youtube,
  Download,
  Palette,
  CodeXml,
  Layers,
  Cpu,
  Figma,
  Instagram,
  ArrowUpRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../lib/ProfileContext';
import { sanitizeHtml } from '../../lib/utils';
import { motion } from 'motion/react';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';

// Runs the letter-by-letter typing reveal once per full page load/refresh
let hasCompletedInitialTyping = false;

export default function Hero() {
  const { profile, avatarUrl } = useProfile();
  const navigate = useNavigate();
  const fullName = profile.name || 'S M Hasinur Rahman';

  const [typedCount, setTypedCount] = useState<number>(() =>
    hasCompletedInitialTyping ? fullName.length : 0
  );
  const [isTypingComplete, setIsTypingComplete] = useState<boolean>(
    () => hasCompletedInitialTyping
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (hasCompletedInitialTyping) {
      setTypedCount(fullName.length);
      setIsTypingComplete(true);
      return;
    }

    const totalChars = fullName.length;
    if (totalChars === 0) return;

    // 1.25s smooth typing duration across all characters (within 1-1.5s)
    const targetDurationMs = 1250;
    const stepMs = Math.max(35, Math.round(targetDurationMs / totalChars));

    let current = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startTimeout = setTimeout(() => {
      intervalId = setInterval(() => {
        current += 1;
        setTypedCount(current);
        if (current >= totalChars) {
          if (intervalId) clearInterval(intervalId);
          hasCompletedInitialTyping = true;
          setIsTypingComplete(true);
        }
      }, stepMs);
    }, 180);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fullName]);

  const displayedName = fullName.slice(0, typedCount);

  const handleDownloadCV = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profile.resume_url || profile.resume_url === '#') {
      navigate('/resume');
      return;
    }
    const popup = window.open(profile.resume_url, '_blank', 'noopener,noreferrer');
    if (!popup) {
      navigate('/resume');
    }
  };

  return (
    <section
      id="home"
      className="relative pt-28 pb-12 md:pt-32 md:pb-16 px-4 flex flex-col justify-center items-center text-center overflow-hidden"
    >
      <BackgroundBlobs />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ animationDelay: '1s' }}
      />

      {/* Floating Ambient Design Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingIcon icon={<Palette size={30} strokeWidth={1.1} />} top="16%" left="9%" delay={0} />
        <FloatingIcon icon={<Figma size={32} strokeWidth={1.1} />} top="24%" left="86%" delay={1} />
        <FloatingIcon icon={<CodeXml size={36} strokeWidth={1.1} />} top="66%" left="13%" delay={2} />
        <FloatingIcon icon={<Layers size={26} strokeWidth={1.1} />} top="76%" left="82%" delay={0.5} />
        <FloatingIcon icon={<Cpu size={28} strokeWidth={1.1} />} top="46%" left="38%" delay={1.5} />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10 w-full">
        {/* Step 1: Avatar/logo fades in */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 group"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 blur-lg opacity-35 group-hover:opacity-60 transition-opacity duration-500" />
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.25 }}
            className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-4 border-slate-900 shadow-2xl bg-transparent select-none"
          >
            <img
              src={avatarUrl}
              alt={fullName}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
              className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
            />
          </motion.div>
        </motion.div>

        {/* Step 2: Typewriter Name + Blinking Cursor (Apple-style subtle gradient, zero neon glow) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="relative mb-3 min-h-[3.25rem] sm:min-h-[3.75rem] md:min-h-[4.5rem] flex items-center justify-center w-full"
        >
          <span
            aria-hidden="true"
            className="invisible text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] pb-1 pointer-events-none select-none"
          >
            {fullName}
          </span>

          <h1 className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] pb-1 select-none cursor-default">
            <span
              className={`bg-clip-text text-transparent bg-gradient-to-b transition-all duration-500 ${
                isTypingComplete
                  ? 'from-white via-white to-slate-300/90 hover:to-slate-100'
                  : 'from-white via-white to-slate-200'
              }`}
            >
              {displayedName}
            </span>
            <motion.span
              aria-hidden="true"
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
              className="inline-block w-[3px] md:w-1 h-8 sm:h-10 md:h-12 bg-blue-400 ml-2 rounded-full shrink-0"
            />
          </h1>
        </motion.div>

        {/* Step 3: Subtitle fades up */}
        {profile.title && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-base font-semibold text-blue-400/95 tracking-wide mb-4"
          >
            {profile.title}
          </motion.p>
        )}

        {/* Step 4: Description fades in */}
        {profile.bio && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
            className="text-slate-300/90 max-w-2xl text-[15px] sm:text-base md:text-[17px] mb-8 leading-relaxed font-normal select-none px-4"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.bio) }}
          />
        )}

        {/* Step 5 & 6: CTA Buttons & Social Icons appear */}
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-center w-full mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href="https://wa.me/8801647706099"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold text-sm tracking-wide transition-all shadow-[0_12px_30px_-8px_rgba(37,99,235,0.55)] flex items-center gap-2 group"
            >
              <span>Start a Project</span>
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </motion.a>

            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={profile.resume_url || '#'}
              onClick={handleDownloadCV}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-900/70 hover:bg-slate-800/80 backdrop-blur-md text-slate-100 rounded-xl font-semibold text-sm tracking-wide transition-all border border-white/10 hover:border-blue-500/40"
            >
              <Download size={16} className="text-blue-400" />
              <span>Download CV</span>
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            <SocialLink
              href={profile.facebook_url || 'https://facebook.com/hasinur01'}
              target="_blank"
              icon={<Facebook />}
              label="Facebook"
            />
            <SocialLink
              href={profile.instagram_url || 'https://instagram.com/hasinur_rahman'}
              target="_blank"
              icon={<Instagram />}
              label="Instagram"
            />
            <SocialLink
              href={profile.linkedin_url || 'https://linkedin.com/in/hasinurbd'}
              target="_blank"
              icon={<Linkedin />}
              label="LinkedIn"
            />
            <SocialLink
              href={profile.behance_url || 'https://behance.net/hasinurbd'}
              target="_blank"
              icon={<BehanceIcon />}
              label="Behance"
            />
            <SocialLink
              href={profile.github_url || 'https://github.com/hasinurbd'}
              target="_blank"
              icon={<Github />}
              label="GitHub"
            />
            <SocialLink
              href={profile.youtube_url || 'https://www.youtube.com/@talksofhasi'}
              target="_blank"
              icon={<Youtube />}
              label="YouTube"
            />
          </motion.div>
        </div>

        {/* Executive Credibility Metrics Strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.92, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-2xl grid grid-cols-3 divide-x divide-white/[0.08] rounded-2xl bg-slate-900/40 border border-white/[0.07] backdrop-blur-md py-4 px-2"
        >
          <div className="px-3">
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">5Y+</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
              Experience
            </div>
          </div>
          <div className="px-3">
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">10+</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
              Projects
            </div>
          </div>
          <div className="px-3">
            <div className="text-xl sm:text-2xl font-bold text-white tabular-nums">100%</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
              Client Satisfaction
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function BehanceIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a2 2 0 0 0-2-2H5v4h2a2 2 0 0 0 2-2z" />
      <path d="M9 18a3 3 0 0 0-3-3H5v5a1 1 0 0 0 1 1h3a3 3 0 0 0 0-6z" />
      <path d="M14 12h7a4 4 0 0 1 0 8h-7a4 4 0 0 1 0-8z" />
      <line x1="15" y1="9" x2="20" y2="9" />
    </svg>
  );
}

function SocialLink({
  href,
  icon,
  target,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  target?: string;
  label: string;
}) {
  if (!href || href === '#') return null;
  return (
    <motion.a
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      href={href}
      target={target}
      title={label}
      aria-label={label}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-slate-900/65 hover:bg-blue-600/20 text-slate-300 hover:text-white border border-white/10 hover:border-blue-500/45 transition-colors duration-200 shadow-lg"
    >
      {React.cloneElement(icon as React.ReactElement, { size: 18, strokeWidth: 1.6 })}
    </motion.a>
  );
}
