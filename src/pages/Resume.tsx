import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, Award, Briefcase, Code, FileText, Printer, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import { getMockProfile, getMockData, mockExperiences, mockPortfolioItems, mockAchievements } from '../lib/mockData';
import { sanitizeHtml } from '../lib/utils';

export default function Resume() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumeData = async () => {
      setLoading(true);
      try {
        if (hasSupabaseConfig) {
          // Fetch profile
          const { data: prof } = await supabase.from('profiles').select('*').single();
          if (prof) {
            const sanitized = { ...prof };
            if (sanitized.phone === "+8801518914773" || sanitized.phone === "01518914773" || (sanitized.phone && sanitized.phone.includes("1518914773"))) {
              sanitized.phone = "+8801647706099";
            }
            setProfile(sanitized);
          }

          // Fetch experiences
          const { data: exps } = await supabase.from('experiences').select('*').order('id', { ascending: true });
          if (exps) setExperiences(exps);

          // Fetch projects
          const { data: projs } = await supabase.from('portfolio_items').select('*').order('likes', { ascending: false });
          if (projs) setProjects(projs);

          // Fetch achievements
          const { data: achs } = await supabase.from('achievements').select('*').order('date', { ascending: false });
          if (achs) setAchievements(achs);
        } else {
          setProfile(getMockProfile());
          setExperiences(getMockData('mock_experiences', mockExperiences));
          setProjects(getMockData('mock_portfolio', mockPortfolioItems));
          setAchievements(getMockData('mock_achievements', mockAchievements));
        }
      } catch (err) {
        console.error('Error fetching resume data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, []);

  // Automatically trigger printer setup shortly after loading completes
  useEffect(() => {
    if (!loading && profile) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loading, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-3">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Generating Resume Document...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <h2 className="text-xl font-black mb-4">Error generating document</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Go Back Home</button>
      </div>
    );
  }

  // Pre-compiled fallback skills matched to Hasinur's profile
  const selectedSkills = [
    { title: "Web development", tags: ["React", "TypeScript", "Node.js", "Firebase", "Supabase", "Tailwind CSS"] },
    { title: "Design & UX", tags: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "Visual Branding", "UI Design"] },
    { title: "Content Writing", tags: ["Copywriting", "Technical Writing", "SEO Optimization", "Creative Strategy"] }
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-800 print:bg-white print:text-black font-sans relative">
      {/* Top sticky action control (hidden during printing) */}
      <div className="print:hidden bg-slate-900/90 backdrop-blur-md border-b border-white/10 py-4 px-6 fixed top-0 left-0 right-0 z-50 flex justify-between items-center max-w-full">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Back to Portfolio
        </button>
        <span className="text-[10px] sm:text-xs text-slate-400 font-bold hidden sm:block">
          💡 Tip: Set Layout to <b>A4</b> and click <b>Save as PDF</b> or select your local printer
        </span>
        <button 
          onClick={() => window.print()} 
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/20"
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      {/* Main Resume Sheet (Letter/A4 proportional) */}
      <div className="pt-24 pb-12 px-4 print:pt-0 print:pb-0 print:px-0 flex justify-center">
        <div id="resume-sheet" className="w-full max-w-[850px] bg-white rounded-2xl border border-white/5 shadow-2xl p-8 md:p-12 print:rounded-none print:border-none print:shadow-none print:p-0 flex flex-col gap-8 min-h-[1100px]">
          
          {/* Header Layout: Name, title & Contact Info banner */}
          <div className="border-b-4 border-slate-900 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1.5 flex-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase">
                {profile.name}
              </h1>
              <p className="text-blue-600 font-black tracking-widest text-[11px] md:text-sm uppercase">
                {profile.title || "Creative Designer & Full Stack Developer"}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs font-semibold text-slate-600 print:text-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-blue-600 shrink-0" />
                <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-blue-600 shrink-0" />
                <a href={`tel:${profile.phone}`} className="hover:underline">{profile.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-blue-600 shrink-0" />
                <span>{profile.location || "Dhaka, Bangladesh"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-blue-600 shrink-0" />
                <span>hasinurrahman.me</span>
              </div>
            </div>
          </div>

          {/* Profile Overview Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <FileText size={16} className="text-blue-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Professional Summary</h2>
            </div>
            <div 
              className="text-xs text-slate-600 print:text-slate-800 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(profile.bio || "") }}
            />
          </div>

          {/* Core Skills section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Code size={16} className="text-blue-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Technical Expertise & Skills</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {selectedSkills.map(skill => (
                <div key={skill.title} className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight">{skill.title}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {skill.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 print:bg-slate-50 print:text-slate-900 rounded text-[9px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Professional Experience block */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Briefcase size={16} className="text-blue-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Employment & Experience</h2>
            </div>
            <div className="space-y-4">
              {experiences.map(exp => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <h3 className="text-xs font-black text-slate-900 uppercase">
                      {exp.role} <span className="text-slate-400 font-normal">|</span> <span className="text-blue-600">{exp.company_institution}</span>
                    </h3>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                      {exp.date_range ? exp.date_range : exp.status}
                    </div>
                  </div>
                  {exp.subject && (
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{exp.subject}</p>
                  )}
                  {exp.bullet_points && exp.bullet_points.length > 0 ? (
                    <ul className="list-disc list-inside text-[11px] text-slate-600 print:text-slate-800 space-y-1 pl-1 font-medium leading-relaxed">
                      {exp.bullet_points.map((bp: string, i: number) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>
                  ) : exp.description ? (
                    <p className="text-[11px] text-slate-600 print:text-slate-800 font-medium leading-relaxed">{exp.description}</p>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic font-medium">Assigned moderation and design assets coordination successfully.</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Work Portfolio block */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Briefcase size={16} className="text-blue-600" />
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Selected Highlights & Showcases</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.slice(0, 4).map(proj => (
                <div key={proj.id} className="space-y-1 border-l-2 border-slate-200 pl-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase">{proj.title}</h3>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{proj.category}</p>
                  <p className="text-[10px] text-slate-500 print:text-slate-800 font-medium line-clamp-2 leading-relaxed">{proj.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Milestone Achievements section */}
          {achievements.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
                <Award size={16} className="text-blue-600" />
                <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">Awards & Recognition</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {achievements.slice(0, 4).map(ach => (
                  <div key={ach.id} className="space-y-0.5">
                    <div className="flex justify-between items-baseline gap-2">
                      <h3 className="text-xs font-black text-slate-900 uppercase leading-none">{ach.title}</h3>
                      <span className="text-[8px] font-bold text-slate-400 uppercase shrink-0">
                        {new Date(ach.date).getFullYear()}
                      </span>
                    </div>
                    {ach.author && (
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{ach.author}</p>
                    )}
                    <div 
                      className="text-[10px] text-slate-600 print:text-slate-800 line-clamp-1 font-medium leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(ach.description) }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer signature */}
          <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-black uppercase tracking-widest">
            <span>REFERENCE AVAILABLE UPON REQUEST</span>
            <span>Generated dynamically via Portfolio CMS</span>
          </div>

        </div>
      </div>
    </div>
  );
}
