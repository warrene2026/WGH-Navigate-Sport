'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/lib/ui/Logo';

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    // Always show the generic success message regardless of whether the
    // email actually matches an account — avoids leaking which emails
    // are registered (user enumeration).
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-nys-bg">
      <div className="w-full max-w-[380px]">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-nys-card border border-nys-border rounded-xl p-6">
          {sent ? (
            <p className="text-sm text-white text-center">
              If that email has an account, a reset link is on its way. Check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-nys-dim">
                Enter your email and we'll send you a link to set a password.
              </p>
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
              <button
                type="submit"
                disabled={busy}
                className="bg-nys-red text-white font-bold text-sm tracking-wide uppercase rounded-lg py-3 disabled:opacity-60"
              >
                {busy ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-nys-faint text-center mt-6">
          <a href="/login" className="hover:text-white">Back to sign in</a>
        </p>
      </div>
    </main>
  );
}
