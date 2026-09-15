import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { ThemeToggle } from '../components/ThemeToggle';

const DEMO_ACCOUNTS = [
  // student1 is seeded into a real team; the bare `student@` account is not,
  // which makes it a poor demo of the student flow.
  { email: 'student1@htu.edu.gh', label: '🎓 Student', className: 'bg-ok/10 text-ok hover:bg-ok/20 border-ok/20' },
  { email: 'coordinator@htu.edu.gh', label: '📋 Coordinator', className: 'bg-accent/10 text-accent hover:bg-accent/20 border-accent/20' },
  { email: 'supervisor1@htu.edu.gh', label: '👨‍🏫 Supervisor', className: 'bg-warn/10 text-warn hover:bg-warn/20 border-warn/20' },
  { email: 'admin@htu.edu.gh', label: '🛡️ Admin', className: 'bg-danger/10 text-danger hover:bg-danger/20 border-danger/20' },
];

const inputClass =
  'w-full bg-sunken border border-line rounded-xl pl-11 pr-4 py-3 text-sm text-ink-body placeholder-ink-subtle focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all';

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
    <div className="min-h-screen bg-canvas text-ink flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md bg-panel/80 backdrop-blur-xl border border-line rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 text-accent mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">HTU FYP Portal</h1>
          <p className="text-sm text-ink-muted mt-1">Ho Technical University — Computer Science Dept.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" />
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
            className="w-full py-3.5 px-4 min-h-11 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
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

        <div className="mt-8 pt-6 border-t border-line text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle mb-3">
            Quick Test Accounts (Click to Demo)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickLogin(account.email)}
                className={`px-3 py-2 min-h-11 rounded-lg border disabled:opacity-50 transition-all ${account.className}`}
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
