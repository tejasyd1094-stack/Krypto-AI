
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { KryptoLogo } from './Branding';

type AuthMode = 'signin' | 'signup';

interface LoginProps {
  onGuestLogin?: () => void;
}

const Login: React.FC<LoginProps> = ({ onGuestLogin }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    const origin = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });

    if (error) {
      console.error('OAuth Error:', error);
      setError(`HANDSHAKE_FAILED: ${error.message}`);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username || email.split('@')[0],
              full_name: username
            }
          }
        });
        if (error) throw error;
        setMessage("Verification protocol initiated. Check your inbox to confirm identity.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(`AUTH_EXCEPTION: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-6 relative overflow-hidden text-zinc-100">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-yellow-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative w-full max-w-md bg-zinc-900/40 border border-zinc-800 rounded-[48px] p-8 sm:p-12 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <KryptoLogo className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]" size={64} />
          <h1 className="text-3xl font-black tracking-tighter gold-text-gradient uppercase mb-2">Krypto AI</h1>
          <p className="text-zinc-500 font-medium text-xs tracking-wide">
            {mode === 'signin' ? 'LOG IN TO YOUR CAREER VAULT' : 'ENGINEER YOUR NEW IDENTITY'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-zinc-950 p-1.5 rounded-[24px] mb-8 border border-zinc-800/50">
          <button 
            onClick={() => { setMode('signin'); setError(null); }}
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all ${mode === 'signin' ? 'bg-zinc-800 text-yellow-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => { setMode('signup'); setError(null); }}
            className={`flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-[18px] transition-all ${mode === 'signup' ? 'bg-zinc-800 text-yellow-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
          {mode === 'signup' && (
            <div className="space-y-2 animate-in slide-in-from-top-2">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Architect Username</label>
              <input 
                type="text" 
                required
                placeholder="e.g. NeoRecruiter"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Email Protocol</label>
            <input 
              type="email" 
              required
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">Access Key</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-zinc-800"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake">
               <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">
                 {error}
               </p>
            </div>
          )}

          {message && <p className="text-green-500 text-[9px] font-black uppercase tracking-widest text-center px-2">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-yellow-500 text-zinc-950 rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-yellow-400 transition-all shadow-xl active:scale-95 disabled:opacity-50 border-b-4 border-yellow-700"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              mode === 'signin' ? 'Initialize Access' : 'Register Identity'
            )}
          </button>
        </form>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
          <div className="relative flex justify-center text-[8px] uppercase font-black"><span className="bg-[#0c0c0e] px-4 text-zinc-600 tracking-widest">Or Multi-Factor Auth</span></div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-zinc-950 border border-zinc-800 text-zinc-400 rounded-[24px] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-900 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google Identity
          </button>

          {onGuestLogin && (
            <button
              onClick={onGuestLogin}
              className="w-full py-4 bg-transparent border border-zinc-800/50 text-zinc-600 rounded-[24px] text-[8px] font-black uppercase tracking-[0.4em] hover:text-yellow-500/50 hover:border-yellow-500/20 transition-all"
            >
              Demo Access (Testing)
            </button>
          )}
        </div>

        <div className="text-center mt-10">
          <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.3em]">
            Enterprise-Grade Career Security Enabled
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
