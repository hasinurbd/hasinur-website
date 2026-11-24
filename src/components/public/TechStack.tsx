import React from 'react';
import {
  Code2,
  Database,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

export interface TechItem {
  id: string;
  name: string;
  group: 'Frontend' | 'Backend & Database' | 'Tools & Security';
  largeIcon: React.ReactNode;
}

export const TECH_STACK_ITEMS: TechItem[] = [
  {
    id: 'react',
    name: 'React.js',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-11 h-11 text-[#61DAFB]" fill="none" stroke="currentColor" strokeWidth="1.45">
        <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
        <ellipse cx="12" cy="12" rx="9.8" ry="3.9" />
        <ellipse cx="12" cy="12" rx="9.8" ry="3.9" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="9.8" ry="3.9" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="none">
        <circle cx="12" cy="12" r="10.2" fill="#090d16" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
        <path d="M8.8 15.8V8.4L16.5 18.1" stroke="white" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.2 8.4v4.6" stroke="white" strokeWidth="1.65" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#3178C6" />
        <text x="13.2" y="17.2" textAnchor="middle" fill="white" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">TS</text>
      </svg>
    ),
  },
  {
    id: 'javascript',
    name: 'JavaScript (ES6+)',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#F7DF1E" />
        <text x="13.5" y="17.5" textAnchor="middle" fill="#0f172a" fontSize="9.5" fontWeight="900" fontFamily="sans-serif">JS</text>
      </svg>
    ),
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-11 h-11 text-[#38BDF8]" fill="currentColor">
        <path d="M12 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C15.61 7.15 14.47 6 12 6zm-5 6c-2.67 0-4.33 1.33-5 4 1-1.33 2.17-1.83 3.5-1.5.76.19 1.31.74 1.91 1.35.98 1 2.12 2.15 4.59 2.15 2.67 0 4.33-1.33 5-4-1 1.33-2.17 1.83-3.5 1.5-.76-.19-1.31-.74-1.91-1.35C10.61 13.15 9.47 12 7 12z" />
      </svg>
    ),
  },
  {
    id: 'html5',
    name: 'HTML5',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <path d="M3.5 2.5l1.6 17L12 21.5l6.9-2 1.6-17H3.5z" fill="#E34F26" />
        <path d="M16.2 7.2H8.4l.4 4.1h6.4l-.6 4.7-2.6.8-2.6-.8-.2-1.7" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'css3',
    name: 'CSS3',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <path d="M3.5 2.5l1.6 17L12 21.5l6.9-2 1.6-17H3.5z" fill="#264DE4" />
        <path d="M8 7.2h8l-.5 4.1h-5m5 0l-.6 4.7-2.9.8-2.9-.8" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'bootstrap',
    name: 'Bootstrap',
    group: 'Frontend',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <rect x="2.5" y="3" width="19" height="18" rx="4.5" fill="#7952B3" />
        <text x="12" y="16.5" textAnchor="middle" fill="white" fontSize="12" fontWeight="900" fontFamily="sans-serif">B</text>
      </svg>
    ),
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    group: 'Backend & Database',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#5FA04E]" fill="none">
        <polygon points="12 2 20.8 7 20.8 17 12 22 3.2 17 3.2 7" fill="rgba(95,160,78,0.16)" stroke="#5FA04E" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 15V9l6 6V9" stroke="#83CD29" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'expressjs',
    name: 'Express.js',
    group: 'Backend & Database',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <circle cx="12" cy="12" r="10" fill="rgba(148,163,184,0.14)" stroke="rgba(226,232,240,0.35)" strokeWidth="1.2" />
        <text x="12" y="15.2" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="800" fontFamily="sans-serif">ex</text>
      </svg>
    ),
  },
  {
    id: 'restapi',
    name: 'REST API',
    group: 'Backend & Database',
    largeIcon: <Code2 className="w-10 h-10 text-cyan-400" strokeWidth={1.65} />,
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    group: 'Backend & Database',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <path d="M12 2.4c3.9 3.9 5.5 7.4 5.5 11.1 0 3.3-2.3 6-5.5 7.3-3.2-1.3-5.5-4-5.5-7.3 0-3.7 1.6-7.2 5.5-11.1z" fill="#47A248" />
        <path d="M12 8.5v13.2" stroke="#A6E3A1" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'mongoose',
    name: 'Mongoose',
    group: 'Backend & Database',
    largeIcon: <Database className="w-10 h-10 text-rose-400" strokeWidth={1.65} />,
  },
  {
    id: 'mysql',
    name: 'MySQL',
    group: 'Backend & Database',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10">
        <rect x="2.5" y="4" width="19" height="16" rx="4" fill="#00618A" />
        <text x="12" y="15.2" textAnchor="middle" fill="#F29111" fontSize="8.5" fontWeight="900" fontFamily="sans-serif">SQL</text>
      </svg>
    ),
  },
  {
    id: 'git',
    name: 'Git & GitHub',
    group: 'Tools & Security',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: 'vscode',
    name: 'VS Code',
    group: 'Tools & Security',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#22A7F2]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.8 3.2L21 5.3v13.4l-4.2 2.1L7 12l9.8-8.8z" fill="rgba(34,167,242,0.16)" />
        <path d="M16.8 3.2v17.6" />
        <path d="M7.2 12L3.5 9.2v5.6L7.2 12z" />
      </svg>
    ),
  },
  {
    id: 'vercel',
    name: 'Vercel',
    group: 'Tools & Security',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
        <path d="M12 3.5L21.5 20H2.5L12 3.5Z" />
      </svg>
    ),
  },
  {
    id: 'netlify',
    name: 'Netlify',
    group: 'Tools & Security',
    largeIcon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 text-[#00C7B7]" fill="none">
        <path d="M12 2.5L21.5 12 12 21.5 2.5 12 12 2.5z" fill="rgba(0,199,183,0.16)" stroke="#00C7B7" strokeWidth="1.5" />
        <path d="M8 12h8M12 8v8" stroke="#00C7B7" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity',
    group: 'Tools & Security',
    largeIcon: <ShieldAlert className="w-10 h-10 text-rose-400" strokeWidth={1.65} />,
  },
  {
    id: 'auth',
    name: 'Auth & JWT',
    group: 'Tools & Security',
    largeIcon: <KeyRound className="w-10 h-10 text-amber-400" strokeWidth={1.65} />,
  },
  {
    id: 'secureweb',
    name: 'Secure Web Dev',
    group: 'Tools & Security',
    largeIcon: <ShieldCheck className="w-10 h-10 text-emerald-400" strokeWidth={1.65} />,
  },
];
