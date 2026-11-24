import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Palette,
  Share2,
  Video,
  Edit3,
  Terminal,
  Briefcase,
  Layers,
  Layout,
  Sparkles,
  Sliders,
  Volume2,
  Film,
  Clapperboard,
  FileCode2,
  PenTool,
  Search,
  FileText,
  Compass,
  Users,
  BarChart3,
  Megaphone,
  ShieldCheck,
  Workflow,
  Rocket,
  Cpu,
  Type,
  Grid3X3,
  Wand2,
  Music,
  BookOpen,
  Globe,
  TrendingUp,
  Target,
  Zap,
  ArrowUpRight,
  X,
  Smartphone,
  MousePointerClick,
  Eye,
  Camera,
  Calendar,
  Lightbulb,
  Award,
  Filter,
  Activity,
  Cloud,
  Gauge,
  MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BackgroundBlobs } from './VisualElements';
import { TECH_STACK_ITEMS } from './TechStack';
import { cn } from '../../lib/utils';

interface EcosystemIcon {
  id: string;
  label: string;
  group?: string;
  node: React.ReactNode;
}

interface CompetencyCardConfig {
  id: string;
  title: string;
  description: string;
  countLabel: string;
  accentText: string;
  glowClass: string;
  hairlineClass: string;
  hoverBorderClass: string;
  iconBoxClass: string;
  categoryIcon: React.ReactNode;
  primaryIcons: EcosystemIcon[];
  allItems: EcosystemIcon[];
}

const webIconMap = new Map<string, EcosystemIcon>(
  TECH_STACK_ITEMS.map((item) => [
    item.id,
    {
      id: item.id,
      label: item.name,
      group: item.group,
      node: item.largeIcon,
    },
  ])
);

const PRIMARY_WEB_IDS = [
  'react',
  'nextjs',
  'typescript',
  'javascript',
  'nodejs',
  'expressjs',
  'mongodb',
  'mysql',
  'tailwind',
  'git',
  'vercel',
  'auth',
];

const COMPETENCY_CARDS: CompetencyCardConfig[] = [
  {
    id: 'full-stack-development',
    title: 'Full Stack Development',
    description:
      'Scalable web apps from clean backend APIs and databases to responsive UIs.',
    countLabel: `${TECH_STACK_ITEMS.length} Technologies`,
    accentText: 'text-blue-400',
    glowClass: 'bg-blue-500/10',
    hairlineClass: 'via-blue-400/65',
    hoverBorderClass: 'hover:border-blue-500/40 hover:shadow-[0_20px_44px_-16px_rgba(37,99,235,0.2)]',
    iconBoxClass: 'bg-blue-500/12 border-blue-500/30 text-blue-400',
    categoryIcon: <Terminal size={19} strokeWidth={1.75} />,
    primaryIcons: PRIMARY_WEB_IDS.map((id) => webIconMap.get(id)!).filter(Boolean),
    allItems: TECH_STACK_ITEMS.map((item) => ({
      id: item.id,
      label: item.name,
      group: item.group,
      node: item.largeIcon,
    })),
  },
  {
    id: 'ui-ux-design',
    title: 'UI/UX & Product Design',
    description:
      'Cohesive design systems, wireframes, and high-converting digital brand identities.',
    countLabel: '12 Design Tools',
    accentText: 'text-violet-400',
    glowClass: 'bg-violet-500/10',
    hairlineClass: 'via-violet-400/65',
    hoverBorderClass: 'hover:border-violet-500/40 hover:shadow-[0_20px_44px_-16px_rgba(139,92,246,0.2)]',
    iconBoxClass: 'bg-violet-500/12 border-violet-500/30 text-violet-400',
    categoryIcon: <Palette size={19} strokeWidth={1.75} />,
    primaryIcons: [
      {
        id: 'figma',
        label: 'Figma',
        node: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <path d="M8.5 3h3.5v6H8.5a3 3 0 0 1 0-6z" fill="#F24E1E" />
            <path d="M12 3h3.5a3 3 0 0 1 0 6H12V3z" fill="#FF7262" />
            <path d="M8.5 9H12v6H8.5a3 3 0 0 1 0-6z" fill="#A259FF" />
            <path d="M8.5 15H12v3a3 3 0 1 1-3.5-3z" fill="#0ACF83" />
            <circle cx="15" cy="12" r="3" fill="#1ABCFE" />
          </svg>
        ),
      },
      {
        id: 'photoshop',
        label: 'Adobe Photoshop',
        node: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#001E36" stroke="#31A8FF" strokeWidth="1.2" />
            <text x="12" y="15.8" textAnchor="middle" fill="#31A8FF" fontSize="10" fontWeight="900" fontFamily="sans-serif">Ps</text>
          </svg>
        ),
      },
      {
        id: 'illustrator',
        label: 'Adobe Illustrator',
        node: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#330000" stroke="#FF9A00" strokeWidth="1.2" />
            <text x="12" y="15.8" textAnchor="middle" fill="#FF9A00" fontSize="10" fontWeight="900" fontFamily="sans-serif">Ai</text>
          </svg>
        ),
      },
      {
        id: 'brand-systems',
        label: 'Brand Identity Systems',
        node: <Layers className="w-7 h-7 text-cyan-400" strokeWidth={1.65} />,
      },
      {
        id: 'ui-layout',
        label: 'Interface Architecture',
        node: <Layout className="w-7 h-7 text-blue-400" strokeWidth={1.65} />,
      },
      {
        id: 'vector-pen',
        label: 'Vector Craft',
        node: <PenTool className="w-7 h-7 text-amber-400" strokeWidth={1.65} />,
      },
      {
        id: 'typography',
        label: 'Typography Systems',
        node: <Type className="w-7 h-7 text-indigo-400" strokeWidth={1.65} />,
      },
      {
        id: 'design-grids',
        label: 'Grid & Spacing Systems',
        node: <Grid3X3 className="w-7 h-7 text-emerald-400" strokeWidth={1.65} />,
      },
      {
        id: 'visual-polish',
        label: 'Visual Polish & Collateral',
        node: <Sparkles className="w-7 h-7 text-pink-400" strokeWidth={1.65} />,
      },
      {
        id: 'responsive-ui',
        label: 'Responsive Mobile UI',
        node: <Smartphone className="w-7 h-7 text-sky-400" strokeWidth={1.65} />,
      },
      {
        id: 'prototyping',
        label: 'Interactive Prototyping',
        node: <MousePointerClick className="w-7 h-7 text-violet-400" strokeWidth={1.65} />,
      },
      {
        id: 'visual-direction',
        label: 'Art Direction',
        node: <Eye className="w-7 h-7 text-teal-400" strokeWidth={1.65} />,
      },
    ],
    allItems: [],
  },
  {
    id: 'media-production',
    title: 'Media Production',
    description:
      'High-retention video editing, motion graphics, color grading, and sound design.',
    countLabel: '12 Production Tools',
    accentText: 'text-rose-400',
    glowClass: 'bg-rose-500/10',
    hairlineClass: 'via-rose-400/65',
    hoverBorderClass: 'hover:border-rose-500/40 hover:shadow-[0_20px_44px_-16px_rgba(244,63,94,0.2)]',
    iconBoxClass: 'bg-rose-500/12 border-rose-500/30 text-rose-400',
    categoryIcon: <Video size={19} strokeWidth={1.75} />,
    primaryIcons: [
      {
        id: 'premiere',
        label: 'Adobe Premiere Pro',
        node: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#00005B" stroke="#9999FF" strokeWidth="1.2" />
            <text x="12" y="15.8" textAnchor="middle" fill="#9999FF" fontSize="10" fontWeight="900" fontFamily="sans-serif">Pr</text>
          </svg>
        ),
      },
      {
        id: 'after-effects',
        label: 'Adobe After Effects',
        node: (
          <svg viewBox="0 0 24 24" className="w-8 h-8">
            <rect x="2" y="2" width="20" height="20" rx="4.5" fill="#00005B" stroke="#9999FF" strokeWidth="1.2" />
            <text x="12" y="15.8" textAnchor="middle" fill="#9999FF" fontSize="10" fontWeight="900" fontFamily="sans-serif">Ae</text>
          </svg>
        ),
      },
      {
        id: 'color-grading',
        label: 'Color Grading',
        node: <Sliders className="w-7 h-7 text-amber-400" strokeWidth={1.65} />,
      },
      {
        id: 'audio-sfx',
        label: 'Audio Mixing & SFX',
        node: <Volume2 className="w-7 h-7 text-emerald-400" strokeWidth={1.65} />,
      },
      {
        id: 'motion-fx',
        label: 'Motion Graphics',
        node: <Wand2 className="w-7 h-7 text-violet-400" strokeWidth={1.65} />,
      },
      {
        id: 'reels',
        label: 'Short-Form Reels',
        node: <Film className="w-7 h-7 text-rose-400" strokeWidth={1.65} />,
      },
      {
        id: 'youtube',
        label: 'YouTube Storytelling',
        node: <Clapperboard className="w-7 h-7 text-sky-400" strokeWidth={1.65} />,
      },
      {
        id: 'soundtrack',
        label: 'Sound Design',
        node: <Music className="w-7 h-7 text-cyan-400" strokeWidth={1.65} />,
      },
      {
        id: 'render',
        label: 'Post-Production',
        node: <Sparkles className="w-7 h-7 text-pink-400" strokeWidth={1.65} />,
      },
      {
        id: 'cinematography',
        label: 'Camera & Framing',
        node: <Camera className="w-7 h-7 text-indigo-400" strokeWidth={1.65} />,
      },
      {
        id: 'visual-pacing',
        label: 'Visual Pacing',
        node: <Zap className="w-7 h-7 text-yellow-400" strokeWidth={1.65} />,
      },
      {
        id: 'storyboarding',
        label: 'Storyboarding',
        node: <Layers className="w-7 h-7 text-teal-400" strokeWidth={1.65} />,
      },
    ],
    allItems: [],
  },
  {
    id: 'content-strategy',
    title: 'Content & Brand Strategy',
    description:
      'Technical documentation, SEO editorial storytelling, and persuasive brand copy.',
    countLabel: '12 Disciplines',
    accentText: 'text-emerald-400',
    glowClass: 'bg-emerald-500/10',
    hairlineClass: 'via-emerald-400/65',
    hoverBorderClass: 'hover:border-emerald-500/40 hover:shadow-[0_20px_44px_-16px_rgba(16,185,129,0.2)]',
    iconBoxClass: 'bg-emerald-500/12 border-emerald-500/30 text-emerald-400',
    categoryIcon: <Edit3 size={19} strokeWidth={1.75} />,
    primaryIcons: [
      {
        id: 'tech-docs',
        label: 'Technical Writing',
        node: <FileCode2 className="w-7 h-7 text-blue-400" strokeWidth={1.65} />,
      },
      {
        id: 'seo',
        label: 'SEO Strategy',
        node: <Search className="w-7 h-7 text-amber-400" strokeWidth={1.65} />,
      },
      {
        id: 'copywriting',
        label: 'Conversion Copywriting',
        node: <PenTool className="w-7 h-7 text-emerald-400" strokeWidth={1.65} />,
      },
      {
        id: 'editorial',
        label: 'Long-Form Editorial',
        node: <FileText className="w-7 h-7 text-indigo-400" strokeWidth={1.65} />,
      },
      {
        id: 'storytelling',
        label: 'Brand Storytelling',
        node: <BookOpen className="w-7 h-7 text-cyan-400" strokeWidth={1.65} />,
      },
      {
        id: 'web-reach',
        label: 'Organic Publishing',
        node: <Globe className="w-7 h-7 text-sky-400" strokeWidth={1.65} />,
      },
      {
        id: 'positioning',
        label: 'Brand Positioning',
        node: <Target className="w-7 h-7 text-rose-400" strokeWidth={1.65} />,
      },
      {
        id: 'documentation',
        label: 'Architecture Docs',
        node: <Layers className="w-7 h-7 text-violet-400" strokeWidth={1.65} />,
      },
      {
        id: 'campaigns-copy',
        label: 'Launch Messaging',
        node: <Zap className="w-7 h-7 text-yellow-400" strokeWidth={1.65} />,
      },
      {
        id: 'editorial-calendar',
        label: 'Editorial Planning',
        node: <Calendar className="w-7 h-7 text-teal-400" strokeWidth={1.65} />,
      },
      {
        id: 'ideation',
        label: 'Creative Ideation',
        node: <Lightbulb className="w-7 h-7 text-amber-300" strokeWidth={1.65} />,
      },
      {
        id: 'thought-leadership',
        label: 'Thought Leadership',
        node: <Award className="w-7 h-7 text-pink-400" strokeWidth={1.65} />,
      },
    ],
    allItems: [],
  },
  {
    id: 'growth-marketing',
    title: 'Digital Marketing & Growth',
    description:
      'Data-driven campaign strategy, audience growth, analytics, and multi-channel reach.',
    countLabel: '12 Growth Channels',
    accentText: 'text-cyan-400',
    glowClass: 'bg-cyan-500/10',
    hairlineClass: 'via-cyan-400/65',
    hoverBorderClass: 'hover:border-cyan-500/40 hover:shadow-[0_20px_44px_-16px_rgba(6,182,212,0.2)]',
    iconBoxClass: 'bg-cyan-500/12 border-cyan-500/30 text-cyan-400',
    categoryIcon: <Share2 size={19} strokeWidth={1.75} />,
    primaryIcons: [
      {
        id: 'strategy',
        label: 'Channel Strategy',
        node: <Compass className="w-7 h-7 text-sky-400" strokeWidth={1.65} />,
      },
      {
        id: 'analytics',
        label: 'Performance Analytics',
        node: <BarChart3 className="w-7 h-7 text-amber-400" strokeWidth={1.65} />,
      },
      {
        id: 'community',
        label: 'Community Growth',
        node: <Users className="w-7 h-7 text-emerald-400" strokeWidth={1.65} />,
      },
      {
        id: 'campaigns',
        label: 'Paid Campaigns',
        node: <Megaphone className="w-7 h-7 text-rose-400" strokeWidth={1.65} />,
      },
      {
        id: 'trends',
        label: 'Growth Optimization',
        node: <TrendingUp className="w-7 h-7 text-blue-400" strokeWidth={1.65} />,
      },
      {
        id: 'targeting',
        label: 'Audience Targeting',
        node: <Target className="w-7 h-7 text-indigo-400" strokeWidth={1.65} />,
      },
      {
        id: 'search-growth',
        label: 'Search Visibility',
        node: <Search className="w-7 h-7 text-cyan-400" strokeWidth={1.65} />,
      },
      {
        id: 'global-reach',
        label: 'Global Distribution',
        node: <Globe className="w-7 h-7 text-teal-400" strokeWidth={1.65} />,
      },
      {
        id: 'velocity',
        label: 'Campaign Velocity',
        node: <Zap className="w-7 h-7 text-yellow-400" strokeWidth={1.65} />,
      },
      {
        id: 'funnels',
        label: 'Conversion Funnels',
        node: <Filter className="w-7 h-7 text-violet-400" strokeWidth={1.65} />,
      },
      {
        id: 'engagement',
        label: 'Audience Engagement',
        node: <MessageSquare className="w-7 h-7 text-pink-400" strokeWidth={1.65} />,
      },
      {
        id: 'retention',
        label: 'Retention Tracking',
        node: <Activity className="w-7 h-7 text-emerald-300" strokeWidth={1.65} />,
      },
    ],
    allItems: [],
  },
  {
    id: 'technical-consulting',
    title: 'Business & Tech Consulting',
    description:
      'System architecture reviews, product roadmapping, security audits, and MVP launch.',
    countLabel: '12 Advisory Areas',
    accentText: 'text-amber-400',
    glowClass: 'bg-amber-500/10',
    hairlineClass: 'via-amber-400/65',
    hoverBorderClass: 'hover:border-amber-500/40 hover:shadow-[0_20px_44px_-16px_rgba(245,158,11,0.2)]',
    iconBoxClass: 'bg-amber-500/12 border-amber-500/30 text-amber-400',
    categoryIcon: <Briefcase size={19} strokeWidth={1.75} />,
    primaryIcons: [
      {
        id: 'architecture',
        label: 'System Architecture',
        node: <Cpu className="w-7 h-7 text-amber-400" strokeWidth={1.65} />,
      },
      {
        id: 'roadmap',
        label: 'Product Roadmapping',
        node: <Workflow className="w-7 h-7 text-blue-400" strokeWidth={1.65} />,
      },
      {
        id: 'security',
        label: 'Security & Auth Audits',
        node: <ShieldCheck className="w-7 h-7 text-emerald-400" strokeWidth={1.65} />,
      },
      {
        id: 'mvp-launch',
        label: 'MVP Launch Strategy',
        node: <Rocket className="w-7 h-7 text-cyan-400" strokeWidth={1.65} />,
      },
      {
        id: 'code-review',
        label: 'Engineering Reviews',
        node: <FileCode2 className="w-7 h-7 text-indigo-400" strokeWidth={1.65} />,
      },
      {
        id: 'scaling',
        label: 'Performance Scaling',
        node: <TrendingUp className="w-7 h-7 text-sky-400" strokeWidth={1.65} />,
      },
      {
        id: 'stack-audit',
        label: 'Stack Selection',
        node: <Layers className="w-7 h-7 text-violet-400" strokeWidth={1.65} />,
      },
      {
        id: 'metrics',
        label: 'Technical KPIs',
        node: <BarChart3 className="w-7 h-7 text-rose-400" strokeWidth={1.65} />,
      },
      {
        id: 'delivery',
        label: 'Rapid Execution',
        node: <Zap className="w-7 h-7 text-yellow-400" strokeWidth={1.65} />,
      },
      {
        id: 'cloud-infra',
        label: 'Cloud Deployment',
        node: <Cloud className="w-7 h-7 text-blue-300" strokeWidth={1.65} />,
      },
      {
        id: 'benchmarks',
        label: 'Speed & Core Vitals',
        node: <Gauge className="w-7 h-7 text-teal-400" strokeWidth={1.65} />,
      },
      {
        id: 'team-advisory',
        label: 'Founder & Team Advisory',
        node: <Users className="w-7 h-7 text-orange-400" strokeWidth={1.65} />,
      },
    ],
    allItems: [],
  },
];

for (const card of COMPETENCY_CARDS) {
  if (card.allItems.length === 0) {
    card.allItems = card.primaryIcons;
  }
}

function LogoBadgeWithTooltip({ item }: { item: EcosystemIcon }) {
  return (
    <div
      tabIndex={0}
      role="img"
      aria-label={item.label}
      className="group/logo relative w-10 h-10 flex items-center justify-center rounded-xl transition-transform duration-200 hover:scale-115 focus-visible:scale-115 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 cursor-default"
    >
      <div className="transition-all duration-200 group-hover/logo:drop-shadow-[0_0_12px_rgba(59,130,246,0.45)] [&>svg]:w-8 [&>svg]:h-8">
        {item.node}
      </div>

      {/* Subtle Floating Glass Tooltip */}
      <div
        role="tooltip"
        className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-lg bg-slate-950/95 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-slate-100 shadow-[0_10px_24px_-6px_rgba(0,0,0,0.9)] opacity-0 translate-y-1 transition-all duration-150 group-hover/logo:opacity-100 group-hover/logo:translate-y-0 group-focus-visible/logo:opacity-100 group-focus-visible/logo:translate-y-0"
      >
        {item.label}
        <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-slate-950/95 border-r border-b border-white/15" />
      </div>
    </div>
  );
}

export default function Skills() {
  const [modalCard, setModalCard] = useState<CompetencyCardConfig | null>(null);

  useEffect(() => {
    if (!modalCard) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalCard(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalCard]);

  const groupedModalSections = React.useMemo(() => {
    if (!modalCard) return null;
    const hasGroups = modalCard.allItems.some((item) => Boolean(item.group));
    if (!hasGroups) return null;

    const groups = new Map<string, EcosystemIcon[]>();
    for (const item of modalCard.allItems) {
      const key = item.group || 'Core Capabilities';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries());
  }, [modalCard]);

  return (
    <section id="skills" className="relative py-16 lg:py-20 px-4 overflow-hidden">
      <BackgroundBlobs />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[11px] mb-2.5 block">
            Ecosystem
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-white leading-[1.1] mb-3.5">
            Core Competencies
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 mx-auto rounded-full" />
        </motion.div>

        {/* Equal 3x2 Glass Cards Grid with Compact 4x3 (12-Icon) Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:auto-rows-fr">
          {COMPETENCY_CARDS.map((card, idx) => (
            <motion.article
              key={card.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'group relative rounded-2xl bg-slate-900/45 backdrop-blur-md border border-white/[0.08] p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_36px_-20px_rgba(0,0,0,0.65)]',
                card.hoverBorderClass
              )}
            >
              {/* Contained Ambient Glow & Hairline Layer (keeps hover tooltips unclipped) */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
                <div
                  className={cn(
                    'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    card.hairlineClass
                  )}
                />
                <div
                  className={cn(
                    'absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                    card.glowClass
                  )}
                />
              </div>

              {/* Card Header: Category Icon + Title + Details */}
              <div className="relative z-10 pb-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105',
                      card.iconBoxClass
                    )}
                  >
                    {card.categoryIcon}
                  </div>
                  <h3 className="text-[15px] sm:text-base font-bold text-white tracking-tight leading-snug truncate">
                    {card.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {card.description}
                </p>
              </div>

              {/* Compact 4x3 Logos-Only Grid (12 Icons) with Subtle Hover Tooltips */}
              <div className="relative z-10 w-full py-4 my-auto grid grid-cols-4 gap-y-3 gap-x-2 place-items-center">
                {card.primaryIcons.slice(0, 12).map((iconItem) => (
                  <React.Fragment key={iconItem.id}>
                    <LogoBadgeWithTooltip item={iconItem} />
                  </React.Fragment>
                ))}
              </div>

              {/* Card Footer: Count + View All Modal Trigger */}
              <div className="relative z-10 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-slate-400">
                <span className="tabular-nums">{card.countLabel}</span>
                <button
                  type="button"
                  onClick={() => setModalCard(card)}
                  className={cn(
                    'inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer hover:text-white',
                    card.accentText
                  )}
                >
                  <span>View All</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Centered Glassmorphism Modal Popup */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {modalCard && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setModalCard(null)}
                  className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 10 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="competency-stack-modal-title"
                  className="relative w-full max-w-3xl max-h-[85vh] rounded-2xl bg-slate-900/85 backdrop-blur-xl border border-white/15 shadow-[0_24px_80px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col"
                >
                  <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shrink-0" />

                  {/* Modal Header */}
                  <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 border-b border-white/[0.08] shrink-0">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={cn(
                          'w-11 h-11 rounded-xl border flex items-center justify-center shrink-0',
                          modalCard.iconBoxClass
                        )}
                      >
                        {modalCard.categoryIcon}
                      </div>
                      <div className="min-w-0">
                        <h3
                          id="competency-stack-modal-title"
                          className="text-lg sm:text-xl font-bold text-white tracking-tight truncate"
                        >
                          {modalCard.title}
                        </h3>
                        <p className={cn('text-xs font-semibold', modalCard.accentText)}>
                          {modalCard.countLabel}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalCard(null)}
                      aria-label="Close modal"
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.12] text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Modal Named Stack Content */}
                  <div className="p-5 sm:p-7 overflow-y-auto custom-scrollbar space-y-6">
                    <p className="text-sm text-slate-300/90 leading-relaxed">
                      {modalCard.description}
                    </p>

                    {groupedModalSections ? (
                      groupedModalSections.map(([groupName, items]) => (
                        <div key={groupName}>
                          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                            {groupName}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl bg-slate-950/60 border border-white/[0.07] hover:border-blue-500/35 transition-colors text-center"
                              >
                                <div className="flex items-center justify-center w-10 h-10">
                                  {item.node}
                                </div>
                                <span className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-snug">
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div>
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                          Full Tool &amp; Capability Stack
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {modalCard.allItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl bg-slate-950/60 border border-white/[0.07] hover:border-blue-500/35 transition-colors text-center"
                            >
                              <div className="flex items-center justify-center w-10 h-10">
                                {item.node}
                              </div>
                              <span className="text-xs sm:text-[13px] font-semibold text-slate-200 leading-snug">
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}
