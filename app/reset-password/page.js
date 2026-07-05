'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/lib/ui/Logo';

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // The recovery link Supabase emails establishes a temporary session
    // via the URL fragment as soon as the client library loads. Give it
    // a moment, then check whether we actually have a session — if not,
    // this page was reached without a valid/expired reset link.
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setReady(!!session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
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
          {!ready ? (
            <p className="text-sm text-nys-dim text-center">
              This reset link is invalid or has expired.{' '}
              <a href="/forgot-password" className="text-white hover:underline">
                Request a new one
              </a>
              .
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-nys-dim">Set a new password for your account.</p>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-nys-dim">New password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="rounded-lg px-3 py-2.5 text-sm w-full"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-nys-dim">Confirm password</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
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
                {busy ? 'Saving…' : 'Set password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
