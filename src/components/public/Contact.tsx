import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Heart, Share2, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { getMockProfile } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';
import { motion } from 'motion/react';

function BehanceIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a2 2 0 0 0-2-2H5v4h2a2 2 0 0 0 2-2z"/><path d="M9 18a3 3 0 0 0-3-3H5v5a1 1 0 0 0 1 1h3a3 3 0 0 0 0-6z"/><path d="M14 12h7a4 4 0 0 1 0 8h-7a4 4 0 0 1 0-8z"/><line x1="15" y1="9" x2="20" y2="9"/>
    </svg>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <motion.a 
      whileHover={{ y: -3, scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      className="w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-white/10 hover:border-blue-400 transition-all duration-300"
    >
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </motion.a>
  );
}

export default function Contact() {
  const [profile, setProfile] = useState(getMockProfile());
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'' | 'sending' | 'success' | 'error'>('');
  const [viewCount, setViewCount] = useState(100000);

  useEffect(() => {
    const fetchViews = async () => {
      if (hasSupabaseConfig) {
        const { data, error } = await supabase
          .from('site_stats')
          .select('views')
          .eq('id', 'global')
          .single();
        
        if (data && !error) {
          const displayViews = Math.max(100000, data.views);
          setViewCount(displayViews);
        }
      } else {
        const saved = localStorage.getItem('mockViews');
        const current = saved ? parseInt(saved) : 100000;
        setViewCount(current);
      }
    };
    fetchViews();
  }, []);

  useEffect(() => {
    if (hasSupabaseConfig) {
      const fetchProfile = async () => {
        const { data, error } = await supabase.from('profile_info').select('*').limit(1).maybeSingle();
        if (data && !error) {
          setProfile(data);
        }
      };
      fetchProfile();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    if (hasSupabaseConfig) {
      const { error } = await supabase.from('messages').insert([formData]);
      if (error) {
        setStatus('error');
        console.error(error);
        return;
      }
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setStatus(''), 5000);
    } else {
      // Mock sending process
      setTimeout(() => {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(''), 3000);
      }, 1500);
    }
  };

  return (
    <section id="contact" className="relative py-12 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<MessageSquare size={16} />} top="10%" left="5%" delay={0} />
        <FloatingIcon icon={<Heart size={16} />} top="80%" left="10%" delay={1} />
        <FloatingIcon icon={<Share2 size={16} />} top="40%" left="92%" delay={2} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-blue-500 font-bold tracking-[0.3em] uppercase text-[9px] mb-2 block">Get in Touch</span>
          <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight text-white uppercase italic">Let's Work Together</h2>
          <div className="w-10 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              {profile.email && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Email</h4>
                    <a href={`mailto:${profile.email}`} className="text-lg text-white font-bold hover:text-blue-400 transition-colors">
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Phone</h4>
                    <a href={`tel:${profile.phone}`} className="text-lg text-white font-bold hover:text-blue-400 transition-colors">
                      {profile.phone}
                    </a>
                  </div>
                </div>
              )}

              {profile.location && (
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Location</h4>
                    <p className="text-lg text-white font-bold">
                      {profile.location}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Social Connect</h4>
              <div className="flex flex-wrap gap-4">
                <SocialLink href={profile.facebook_url || "https://facebook.com/hasinur01"} icon={<Facebook />} label="Facebook" />
                <SocialLink href={profile.instagram_url || "https://instagram.com/hasinur_rahman"} icon={<Instagram />} label="Instagram" />
                <SocialLink href={profile.linkedin_url || "https://linkedin.com/in/hasinurbd"} icon={<Linkedin />} label="LinkedIn" />
                <SocialLink href={profile.behance_url || "https://behance.net/hasinurbd"} icon={<BehanceIcon />} label="Behance" />
                <SocialLink href={profile.twitter_url || "https://twitter.com/hasinurbd"} icon={<Twitter />} label="Twitter" />
                <SocialLink href={profile.youtube_url || "https://youtube.com/@hasinurbd"} icon={<Youtube />} label="YouTube" />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/20 border border-white/10 p-8 md:p-10 rounded-[2rem] backdrop-blur-md relative group">
            <div className="absolute inset-0 bg-blue-600/5 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <h3 className="text-xl font-bold text-white mb-8 uppercase italic tracking-tight">Send a Message</h3>
            
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center min-h-[300px] text-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6"
                >
                  <Send size={24} />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-3">Message Sent!</h4>
                <p className="text-slate-400 text-sm">Thanks for reaching out. I'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 text-sm"
                      placeholder="Hasinur"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700 text-sm"
                      placeholder="hasinur@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Message</label>
                  <textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none placeholder:text-slate-700 text-sm"
                    placeholder="Hello Hasinur..."
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl disabled:opacity-70 group uppercase tracking-widest text-[10px]"
                >
                  {status === 'sending' ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>Send Message <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
