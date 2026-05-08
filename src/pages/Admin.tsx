import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import AdminDashboard from '../components/admin/AdminDashboard';
import { Lock } from 'lucide-react';

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasSupabaseConfig) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (hasSupabaseConfig) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(`Supabase Auth Error: ${authError.message}`);
      }
    } else {
      setError('System Error: Database connection not configured. Please build the application with Supabase environment variables in AI Studio Secrets.');
    }
    setLoading(false);
  };

  if (session) {
    return <AdminDashboard session={session} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-blue-900/10 to-slate-900 flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 text-blue-500 mb-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Security</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
          
          <div className="text-center mt-6">
            <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Return to Home</a>
          </div>
        </form>
      </div>
    </div>
  );
}
