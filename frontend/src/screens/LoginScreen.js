import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Flame } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LoginScreen() {
  const { user, setUser } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (user) {
    return (
      <div data-testid="login-screen" className="p-4 pt-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 fire-gradient rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl font-heading font-black text-white">{user.email?.[0]?.toUpperCase()}</span>
          </div>
          <h2 className="font-heading text-2xl font-bold text-white mb-1">Signed In</h2>
          <p className="text-zinc-400 text-sm mb-6">{user.email}</p>
          <button
            data-testid="logout-btn"
            onClick={() => setUser(null)}
            className="px-8 h-12 bg-zinc-800 border border-zinc-700 rounded-full font-semibold text-zinc-300 hover:bg-zinc-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');
      if (isSignUp) {
        setSuccess('Account created! Check your email to verify.');
        setIsSignUp(false);
      } else {
        setUser({ email, accessToken: data.access_token, id: data.user?.id });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-screen" className="p-4 pt-6">
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="animate-flicker mb-4">
          <Flame size={40} className="text-orange-500" />
        </div>
        <h1 className="font-heading text-3xl font-black text-white uppercase tracking-tight mb-1">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-zinc-400 text-sm">
          {isSignUp ? 'Start tracking your habits' : 'Sign in to sync your data'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            data-testid="email-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            required
            className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-4 text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            data-testid="password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            minLength={6}
            className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl pl-11 pr-11 text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
          />
          <button
            type="button"
            data-testid="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p data-testid="auth-error" className="text-red-400 text-sm px-1">{error}</p>}
        {success && <p data-testid="auth-success" className="text-green-400 text-sm px-1">{success}</p>}

        <button
          data-testid="auth-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full h-14 fire-gradient rounded-full font-heading font-bold text-white uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isSignUp ? (
            <><UserPlus size={18} /> Sign Up</>
          ) : (
            <><LogIn size={18} /> Sign In</>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          data-testid="toggle-auth-mode"
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
          className="text-sm text-zinc-400 hover:text-orange-400 transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>

      <p className="text-center text-[11px] text-zinc-700 mt-8">
        Login is optional. Your habits are stored locally.
      </p>
    </div>
  );
}
