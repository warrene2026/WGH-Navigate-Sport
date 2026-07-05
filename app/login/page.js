'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/lib/ui/Logo';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace('/');
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-nys-bg">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-nys-card border border-nys-border rounded-xl p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-nys-dim">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="rounded-lg px-3 py-2.5 text-sm w-full"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-nys-dim">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="rounded-lg px-3 py-2.5 text-sm w-full"
              />
            </label>

            {error && (
              <p className="text-xs text-nys-red bg-[rgba(232,25,44,0.1)] border border-[rgba(232,25,44,0.3)] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="bg-nys-red text-white font-bold text-sm tracking-wide uppercase rounded-lg py-3 disabled:opacity-60"
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </button>

            <a
              href="/forgot-password"
              className="text-xs text-nys-dim text-center hover:text-white"
            >
              Forgot password?
            </a>
          </form>
        </div>

        <p className="text-xs text-nys-faint text-center mt-6">
          Accounts are created by an administrator. Contact WGH for access.
        </p>
      </div>
    </main>
  );
}
