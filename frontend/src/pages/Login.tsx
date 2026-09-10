import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const DEMO_ACCOUNTS = [
  // student1 is seeded into a real team; the bare `student@` account is not,
  // which makes it a poor demo of the student flow.
  { email: 'student1@htu.edu.gh', label: '🎓 Student', className: 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20' },
  { email: 'coordinator@htu.edu.gh', label: '📋 Coordinator', className: 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/20' },
  { email: 'supervisor1@htu.edu.gh', label: '👨‍🏫 Supervisor', className: 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/20' },
  { email: 'admin@htu.edu.gh', label: '🛡️ Admin', className: 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/20' },
];

const inputClass =
  'w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, token } = useAuthStore();
  const navigate = useNavigate();

  if (token) {
    return <Navigate to="/" replace />;
  }

  const signIn = async (withEmail: string, withPassword: string) => {
    const ok = await login(withEmail, withPassword);
    if (ok) navigate('/', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    await signIn(demoEmail, 'password');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">HTU FYP Portal</h1>
          <p className="text-sm text-slate-400 mt-1">Ho Technical University — Computer Science Dept.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@htu.edu.gh"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4" /> Sign In to Portal
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Quick Test Accounts (Click to Demo)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin(account.email)}
                className={`px-3 py-2 rounded-lg border disabled:opacity-50 transition-all ${account.className}`}
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
