import React, { useState, useEffect } from 'react';
import { supabase, hasSupabaseConfig } from '../lib/supabaseClient';
import AdminDashboard from '../components/admin/AdminDashboard';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    // Check for existing local admin session first
    const savedSession = localStorage.getItem('admin_session');
    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession));
      } catch (e) {
        localStorage.removeItem('admin_session');
      }
    }

    if (hasSupabaseConfig) {
      supabase.auth.getSession().then(({ data: { session: supaSession } }) => {
        if (supaSession) {
          setSession(supaSession);
          localStorage.setItem('admin_session', JSON.stringify(supaSession));
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, supaSession) => {
        if (supaSession) {
          setSession(supaSession);
          localStorage.setItem('admin_session', JSON.stringify(supaSession));
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowErrorModal(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    let authenticated = false;

    // 1. Check Supabase Auth first
    if (hasSupabaseConfig) {
      try {
        const { data: supaData, error: supaError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!supaError && supaData?.session) {
          setSession(supaData.session);
          localStorage.setItem('admin_session', JSON.stringify(supaData.session));
          authenticated = true;
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase Auth error:', err);
      }

      // 2. Check Supabase custom admin_settings table if Auth was not created or failed
      if (!authenticated) {
        try {
          const { data: adminRows, error: tableError } = await supabase
            .from('admin_settings')
            .select('*')
            .eq('email', cleanEmail)
            .limit(1);

          if (!tableError && adminRows && adminRows.length > 0) {
            const dbRecord = adminRows[0];
            if (dbRecord.password === cleanPass) {
              const customSession = {
                user: {
                  id: dbRecord.id || 'admin-supabase-table-id',
                  email: dbRecord.email || cleanEmail,
                  user_metadata: { name: 'S M Hasinur Rahman', role: 'admin' }
                },
                access_token: 'admin-table-authenticated-token'
              };
              localStorage.setItem('admin_session', JSON.stringify(customSession));
              setSession(customSession);
              authenticated = true;
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Supabase admin_settings table query issue:', err);
        }
      }
    }

    // 3. Fallback owner login validation for site administrator (Hasiev184@)
    if (!authenticated) {
      if (
        (cleanEmail === 'hasinurrahman.me@gmail.com' || cleanEmail.includes('hasinur')) &&
        (cleanPass === 'Hasiev184@' || cleanPass === 'hasiev184@')
      ) {
        const adminSession = {
          user: {
            id: 'admin-hasinur-session-id',
            email: 'hasinurrahman.me@gmail.com',
            user_metadata: { name: 'S M Hasinur Rahman', role: 'admin' }
          },
          access_token: 'admin-authenticated-token'
        };
        localStorage.setItem('admin_session', JSON.stringify(adminSession));
        setSession(adminSession);
        authenticated = true;
        setLoading(false);
        return;
      }
    }

    // 4. Trigger "Wrong Password" Popup Modal if not authenticated
    if (!authenticated) {
      setShowErrorModal(true);
    }

    setLoading(false);
  };

  if (session) {
    return <AdminDashboard session={session} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-900 flex items-center justify-center px-4 font-sans relative">
      <div className="max-w-md w-full bg-slate-800/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 text-blue-500 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.3)] border border-blue-500/30">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Security</h1>
          <p className="text-xs text-slate-400">Enter your credentials to access the portfolio dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
                placeholder="••••••••"
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1.5 transition-colors focus:outline-none cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none cursor-pointer text-sm font-semibold"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>

          <div className="text-center pt-2">
            <a href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Return to Home
            </a>
          </div>
        </form>
      </div>

      {/* Modern Pop-up Alert Modal for Wrong Password */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-800 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center transform transition-all animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 mx-auto flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wrong Password</h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              The email address or password you entered is incorrect. Please double-check your credentials and try again.
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

