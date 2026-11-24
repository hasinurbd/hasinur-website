import React, { useState, useEffect } from 'react';
import { getMockData, mockPortfolioItems } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import {
  ExternalLink,
  CodeXml,
  Layout,
  Monitor,
  ChevronRight,
  Heart,
  MessageSquare,
  Globe,
  Maximize2,
} from 'lucide-react';
import { cn, slugify } from '../../lib/utils';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';
import { LivePreviewModal, isValidWebUrl, normalizeWebUrl } from './LiveBrowserFrame';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

function stripHtml(html?: string): string {
  if (!html) return '';
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function Projects() {
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [previewProject, setPreviewProject] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      let data: any[] | null = null;
      try {
        if (hasSupabaseConfig) {
          const { data: dbData, error } = await supabase
            .from('portfolio_items')
            .select('*')
            .order('start_date', { ascending: false });
          if (dbData && !error) {
            data = dbData;
          } else {
            const { data: fallback } = await supabase
              .from('portfolio_items')
              .select('*')
              .order('created_at', { ascending: false });
            data = fallback;
          }
        }
      } catch (err) {
        console.error('Error fetching portfolio items:', err);
      }

      if (!data || data.length === 0) {
        data = getMockData('mock_portfolio', mockPortfolioItems);
      }

      const sorted = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.start_date || a.created_at || 0).getTime() || 0;
        const dateB = new Date(b.start_date || b.created_at || 0).getTime() || 0;
        return dateB - dateA;
      });
      if (isMounted) setItems(sorted);
    };

    fetchItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    'all',
    ...Array.from(new Set(items.map((item) => (item.category as string)?.trim() || ''))).filter(
      (c) => c !== ''
    ),
  ];

  const filtered = items.filter(
    (item) => activeTab === 'all' || (item.category as string)?.trim() === activeTab
  );

  return (
    <section id="portfolio" className="relative py-16 lg:py-20 px-4 overflow-hidden">
      <BackgroundBlobs />

      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<CodeXml size={16} />} top="10%" left="8%" delay={0} />
        <FloatingIcon icon={<Layout size={16} />} top="60%" left="92%" delay={1} />
        <FloatingIcon icon={<Monitor size={16} />} top="85%" left="12%" delay={2} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[11px] mb-3 block">
              Portfolio
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black mb-4 tracking-tight text-white">
              Selected Projects
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 mx-auto rounded-full"></div>
          </motion.div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10 px-4">
          {categories.map((cat: string) => (
            <TabButton key={cat} active={activeTab === cat} onClick={() => setActiveTab(cat)}>
              {cat === 'all' ? 'All Masterpieces' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </TabButton>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item, idx) => (
            <ProjectShowcaseCard
              key={item.id}
              item={item}
              index={idx}
              onOpenLiveModal={() => setPreviewProject(item)}
            />
          ))}
        </div>
      </div>

      <LivePreviewModal project={previewProject} onClose={() => setPreviewProject(null)} />
    </section>
  );
}

interface ProjectShowcaseCardProps {
  key?: React.Key;
  item: any;
  index: number;
  onOpenLiveModal: () => void;
}

function ProjectShowcaseCard({ item, index, onOpenLiveModal }: ProjectShowcaseCardProps) {
  const hasLiveLink = isValidWebUrl(item.link);
  const projectHref = `/project/${item.id}--${slugify(item.title)}`;
  const plainDescription = stripHtml(item.description);
  const tags: string[] = Array.isArray(item.tags) ? item.tags.filter(Boolean) : [];
  const visibleTags = tags.slice(0, 3);
  const extraTagCount = Math.max(0, tags.length - 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ delay: Math.min(index * 0.04, 0.2), duration: 0.35 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/45 backdrop-blur-md border border-white/[0.08] hover:border-blue-500/40 transition-all duration-200 hover:-translate-y-1 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_36px_-20px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_44px_-16px_rgba(37,99,235,0.18)]"
    >
      {/* Top Preview Image Container */}
      <div className="relative w-full aspect-[16/10] bg-slate-900 overflow-hidden border-b border-white/[0.06]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2 bg-slate-900">
            <Monitor size={28} />
            <span className="font-bold text-[10px] uppercase tracking-widest">Project Preview</span>
          </div>
        )}

        {/* Subtle Top Scrim */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-slate-950/65 to-transparent pointer-events-none z-10" />

        {/* Clickable Card Link Layer */}
        <Link
          to={projectHref}
          aria-label={`View details for ${item.title}`}
          className="absolute inset-0 z-10 cursor-pointer"
        />

        {/* Top-Left Category Label */}
        {item.category && (
          <div className="absolute top-2.5 left-2.5 z-20 max-w-[46%] pointer-events-none">
            <span className="block truncate px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-white/15 text-[10px] font-semibold text-slate-100 tracking-wide capitalize shadow-md">
              {item.category}
            </span>
          </div>
        )}

        {/* Top-Right Live Preview Button */}
        {hasLiveLink && (
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenLiveModal();
              }}
              title="Open interactive live preview"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-950/90 hover:bg-emerald-600 text-emerald-400 hover:text-white backdrop-blur-md border border-emerald-500/40 text-[10px] font-semibold transition-colors shadow-md cursor-pointer"
            >
              <Maximize2 size={11} />
              <span>Live View</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Details Panel */}
      <div className="flex flex-col flex-1 justify-between p-4">
        <div>
          <Link to={projectHref} className="block group/title">
            <h3 className="text-base font-bold text-white group-hover/title:text-blue-400 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
              {item.title}
            </h3>
          </Link>

          {plainDescription && (
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mt-2">
              {plainDescription}
            </p>
          )}

          {visibleTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/[0.07] text-[10px] font-medium text-slate-300"
                >
                  {tag}
                </span>
              ))}
              {extraTagCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-slate-800/60 border border-white/[0.05] text-[10px] font-medium text-slate-400 tabular-nums">
                  +{extraTagCount}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-2 pt-3 mt-3.5 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 text-[11px] text-slate-400 tabular-nums">
            <span className="inline-flex items-center gap-1">
              <Heart size={12} className="text-rose-400" />
              {item.likes || 0}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={12} className="text-blue-400" />
              {item.comments?.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-2.5 z-20">
            {hasLiveLink && (
              <a
                href={normalizeWebUrl(item.link)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white transition-colors whitespace-nowrap"
              >
                <span>Visit</span>
                <ExternalLink size={11} />
              </a>
            )}
            <Link
              to={projectHref}
              className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
            >
              <span>Details</span>
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  key?: string | number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 backdrop-blur-md border cursor-pointer',
        active
          ? 'bg-blue-600 text-white border-blue-500 shadow-[0_8px_24px_rgba(37,99,235,0.35)]'
          : 'bg-slate-900/60 text-slate-400 border-white/[0.08] hover:border-white/20 hover:text-white'
      )}
    >
      {children}
    </button>
  );
}
