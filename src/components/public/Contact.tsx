import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Heart, Share2 } from 'lucide-react';
import { getMockProfile } from '../../lib/mockData';
import { supabase, hasSupabaseConfig } from '../../lib/supabaseClient';
import { FloatingIcon, BackgroundBlobs } from './VisualElements';

export default function Contact() {
  const [profile] = useState(getMockProfile());
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'' | 'sending' | 'success' | 'error'>('');

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
    <section id="contact" className="relative py-24 px-4 overflow-hidden">
      <BackgroundBlobs />
      
      <div className="absolute inset-0 pointer-events-none">
        <FloatingIcon icon={<MessageSquare size={24} />} top="10%" left="5%" delay={0} />
        <FloatingIcon icon={<Heart size={20} />} top="80%" left="10%" delay={1} />
        <FloatingIcon icon={<Share2 size={24} />} top="40%" left="92%" delay={2} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-white">Get In Touch</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto rounded-full"></div>
          <p className="mt-6 text-slate-400 max-w-2xl mx-auto">
            Interested in working together or have a question? Feel free to reach out. I'm always open to discussing new projects, creative ideas, or opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Email</h4>
                  <a href={`mailto:${profile.email}`} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Phone</h4>
                  <a href={`tel:${profile.phone}`} className="text-slate-400 hover:text-blue-400 transition-colors">
                    {profile.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Location</h4>
                  <p className="text-slate-400">
                    {profile.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-slate-800/50 rounded-2xl border border-white/5">
              <h4 className="text-white font-medium mb-2">Connect online</h4>
              <p className="text-slate-400 text-sm mb-6">You can also find me on social media below or through my resume.</p>
              <div className="flex gap-4">
                <a href="/" onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState(null, '', '/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-slate-300 hover:text-white transition-all">Back to Top</a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/40 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
            <h3 className="text-2xl font-semibold text-white mb-6">Send a Message</h3>
            
            {status === 'success' ? (
              <div className="h-full flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-4">
                  <Send size={24} />
                </div>
                <h4 className="text-xl font-medium text-white mb-2">Message Sent!</h4>
                <p className="text-slate-400 text-sm">Thanks for reaching out. I'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-400 mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-400 mb-2">Message</label>
                  <textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Hello Hasinur..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-70"
                >
                  {status === 'sending' ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>Send Message <Send size={18} /></>
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
