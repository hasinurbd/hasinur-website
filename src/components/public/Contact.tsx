import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Facebook,
  Instagram,
  Linkedin,
  Github,
  Youtube,
  UserPlus,
  Download,
  MessageSquare,
  Heart,
  Share2,
} from 'lucide-react';
import { useProfile } from '../../lib/ProfileContext';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { BackgroundBlobs, FloatingIcon } from './VisualElements';
import { motion } from 'motion/react';

function BehanceIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-white/10 hover:border-blue-400 transition-all duration-200 hover:-translate-y-0.5"
    >
      {React.cloneElement(icon as React.ReactElement, { size: 19 })}
    </a>
  );
}

export default function Contact() {
  const { profile } = useProfile();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'' | 'sending' | 'success' | 'error'>('');

  const handleSaveContact = () => {
    const name = profile.name || 'S M Hasinur Rahman';
    const title = profile.title || 'Full-Stack Developer & Designer';
    const email = profile.email || 'hasinurrahman.me@gmail.com';
    const phone = profile.phone || '+8801647706099';
    const location = profile.location || 'Dhaka, Bangladesh';
    const website = window.location.origin;

    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${name.split(' ').reverse().join(';')};;;`,
      `FN:${name}`,
      `TITLE:${title}`,
      `TEL;TYPE=CELL,VOICE:${phone}`,
      `EMAIL;TYPE=WORK,INTERNET:${email}`,
      `ADR;TYPE=WORK:;;${location};;;;`,
      `URL:${website}`,
      'END:VCARD',
    ].join('\r\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name.replace(/\s+/g, '_')}_Contact.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase.from('messages').insert([formData]);
        if (error) {
          setStatus('error');
          console.error(error);
          return;
        }
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(''), 5000);
      } catch (err) {
        console.error('Contact form submit error:', err);
        setStatus('error');
      }
    } else {
      setTimeout(() => {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setStatus(''), 3000);
      }, 600);
    }
  };

  return (
    <section id="contact" className="relative py-16 lg:py-20 px-4 overflow-hidden">
      <BackgroundBlobs />

      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<MessageSquare size={16} />} top="10%" left="5%" delay={0} />
        <FloatingIcon icon={<Heart size={16} />} top="80%" left="10%" delay={1} />
        <FloatingIcon icon={<Share2 size={16} />} top="40%" left="92%" delay={2} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10 lg:mb-12">
          <span className="text-blue-400 font-semibold tracking-[0.28em] uppercase text-[11px] mb-2.5 block">
            Get in Touch
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black mb-3.5 tracking-tight text-white">
            Let&apos;s Work Together
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="space-y-5">
              {profile.email && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Mail size={19} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                      Email
                    </h4>
                    <a
                      href={`mailto:${profile.email}`}
                      className="text-base sm:text-lg text-white font-semibold hover:text-blue-400 transition-colors break-all"
                    >
                      {profile.email}
                    </a>
                  </div>
                </div>
              )}

              {profile.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Phone size={19} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                      Phone
                    </h4>
                    <a
                      href={`tel:${profile.phone}`}
                      className="text-base sm:text-lg text-white font-semibold hover:text-blue-400 transition-colors tabular-nums"
                    >
                      {profile.phone}
                    </a>
                  </div>
                </div>
              )}

              {profile.location && (
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <MapPin size={19} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">
                      Location
                    </h4>
                    <p className="text-base sm:text-lg text-white font-semibold">
                      {profile.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Save Contact Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveContact}
                  id="save-contact-vcard-btn"
                  className="w-full sm:w-auto flex items-center gap-3.5 bg-slate-900/45 hover:bg-slate-900/70 backdrop-blur-md border border-white/[0.08] hover:border-blue-500/40 p-2.5 pr-5 rounded-xl transition-all duration-200 group cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 transition-colors">
                    <UserPlus size={18} />
                  </div>
                  <div className="text-sm sm:text-base text-white font-semibold group-hover:text-blue-400 transition-colors flex items-center gap-2">
                    <span>Save Contact Card</span>
                    <Download size={15} className="text-blue-400" />
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                Social Connect
              </h4>
              <div className="flex flex-wrap gap-3">
                <SocialLink
                  href={profile.facebook_url || 'https://facebook.com/hasinur01'}
                  icon={<Facebook />}
                  label="Facebook"
                />
                <SocialLink
                  href={profile.instagram_url || 'https://instagram.com/hasinur_rahman'}
                  icon={<Instagram />}
                  label="Instagram"
                />
                <SocialLink
                  href={profile.linkedin_url || 'https://linkedin.com/in/hasinurbd'}
                  icon={<Linkedin />}
                  label="LinkedIn"
                />
                <SocialLink
                  href={profile.behance_url || 'https://behance.net/hasinurbd'}
                  icon={<BehanceIcon />}
                  label="Behance"
                />
                <SocialLink
                  href={profile.github_url || 'https://github.com/hasinurbd'}
                  icon={<Github />}
                  label="GitHub"
                />
                <SocialLink
                  href={profile.youtube_url || 'https://www.youtube.com/@talksofhasi'}
                  icon={<Youtube />}
                  label="YouTube"
                />
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-900/45 backdrop-blur-md border border-white/[0.08] p-6 sm:p-8 rounded-2xl shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_40px_-20px_rgba(0,0,0,0.6)]">
            <h3 className="text-xl font-bold text-white mb-6 tracking-tight">
              Send a Message
            </h3>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center min-h-[280px] text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mb-5"
                >
                  <Send size={22} />
                </motion.div>
                <h4 className="text-lg font-bold text-white mb-2">Message Sent</h4>
                <p className="text-slate-400 text-sm">
                  Thanks for reaching out. I&apos;ll get back to you soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 text-sm"
                      placeholder="Hasinur"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 text-sm"
                      placeholder="hasinur@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={5}
                    className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none placeholder:text-slate-600 text-sm"
                    placeholder="Tell me about your project or inquiry..."
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs text-rose-400 font-medium">
                    Failed to send message. Please try again or email directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-lg disabled:opacity-70 text-sm cursor-pointer"
                >
                  {status === 'sending' ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
