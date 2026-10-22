'use client';

import { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const SESSION_KEY = 'obs_unlocked';

export function PasswordGate({
  password,
  children,
}: {
  password: string;
  children: React.ReactNode;
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput]       = useState('');
  const [show, setShow]         = useState(false);
  const [error, setError]       = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
      setUnlocked(true);
    }
    setChecking(false);
  }, []);

  const submit = () => {
    // If no password is configured server-side, block access entirely
    if (!password) {
      setError(true);
      setTimeout(() => setError(false), 2000);
      return;
    }
    if (input === password) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setUnlocked(true);
    } else {
      setError(true);
      setInput('');
      setTimeout(() => setError(false), 2000);
    }
  };

  if (checking) return null;
  if (unlocked)  return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#16213E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Observability</h1>
          <p className="text-sm text-slate-400 text-center">
            Enter the access password to view platform metrics.
          </p>
        </div>

        <div className={`rounded-xl border ${error ? 'border-red-500' : 'border-white/10'} bg-white/5 p-6 transition-colors`}>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="Enter password"
              autoFocus
              className={`w-full rounded-lg bg-white/10 border ${
                error ? 'border-red-500' : 'border-white/10'
              } text-white placeholder-slate-500 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <p className="mt-2 text-xs text-red-400">Incorrect password. Try again.</p>
          )}

          <button
            onClick={submit}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 transition-colors">
            <ShieldCheck className="w-4 h-4" />
            Unlock
          </button>
        </div>
      </div>
    </div>
  );
}
