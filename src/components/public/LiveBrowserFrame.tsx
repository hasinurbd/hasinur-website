import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ExternalLink,
  Globe,
  Lock,
  Monitor,
  RotateCw,
  Smartphone,
  Tablet,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export function isValidWebUrl(url?: string | null): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) return false;
  return true;
}

export function normalizeWebUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface LiveBrowserFrameProps {
  url: string;
  title: string;
  className?: string;
  heightClass?: string;
}

export function LiveBrowserFrame({
  url,
  title,
  className,
  heightClass = 'h-[420px] md:h-[520px]',
}: LiveBrowserFrameProps) {
  const normalizedUrl = normalizeWebUrl(url);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  }, [normalizedUrl]);

  let displayHost = normalizedUrl;
  try {
    const parsed = new URL(normalizedUrl);
    displayHost = `${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}`;
  } catch {
    // Keep raw normalized URL if URL parsing fails
  }

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl overflow-hidden border border-white/10 bg-slate-950 shadow-2xl',
        className
      )}
    >
      {/* Browser Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/95 border-b border-white/[0.08]">
        {/* Address Bar */}
        <div className="flex items-center gap-2 min-w-0 flex-1 max-w-md bg-slate-950/90 border border-white/[0.07] rounded-xl px-3 py-1.5">
          <Lock size={12} className="text-emerald-400 shrink-0" />
          <span className="text-xs text-slate-300 font-mono truncate">{displayHost}</span>
        </div>

        {/* Viewport & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            role="group"
            aria-label="Preview viewport size"
            className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/[0.06]"
          >
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              title="Desktop view"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewport === 'desktop'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              title="Tablet view"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewport === 'tablet'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Tablet size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              title="Mobile view"
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                viewport === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleReload}
            title="Reload preview"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
          >
            <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <a
            href={normalizedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Site</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Live Iframe Canvas */}
      <div className={cn('relative w-full bg-slate-900/60 flex justify-center overflow-hidden', heightClass)}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/85 backdrop-blur-sm pointer-events-none">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium text-slate-400">
              Loading live preview of {displayHost}...
            </span>
          </div>
        )}

        <div
          className={cn(
            'h-full bg-white transition-all duration-300 overflow-hidden',
            viewport === 'desktop' && 'w-full',
            viewport === 'tablet' && 'w-full max-w-[768px] border-x border-white/15 shadow-2xl',
            viewport === 'mobile' && 'w-full max-w-[390px] border-x border-white/15 shadow-2xl'
          )}
        >
          <iframe
            key={iframeKey}
            src={normalizedUrl}
            title={`Live preview of ${title}`}
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full border-0 bg-white"
          />
        </div>
      </div>

      {/* Helpful Fallback Strip for X-Frame-Options Restricted Sites */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900/90 border-t border-white/[0.06] text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Globe size={12} className="text-blue-400 shrink-0" />
          Some external websites block embedded frames for security. If blank, open directly in a new tab.
        </span>
        <a
          href={normalizedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 font-semibold whitespace-nowrap"
        >
          Visit {displayHost} &rarr;
        </a>
      </div>
    </div>
  );
}

interface LivePreviewModalProps {
  project: {
    id?: string;
    title: string;
    category?: string;
    link?: string;
  } | null;
  onClose: () => void;
}

export function LivePreviewModal({ project, onClose }: LivePreviewModalProps) {
  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {project && project.link && isValidWebUrl(project.link) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl bg-slate-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-white/[0.08] bg-slate-900/70">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Globe size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate">
                    {project.title}
                  </h3>
                  {project.category && (
                    <p className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                      {project.category} · Live Web Preview
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close live preview"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Browser Viewport */}
            <div className="p-3 sm:p-4">
              <LiveBrowserFrame
                url={project.link}
                title={project.title}
                heightClass="h-[65vh] sm:h-[74vh]"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
